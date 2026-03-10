import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SupportedCurrency } from "@/types/international";

// This API funds a user's international wallet
// Flow: user has main balance (local currency) → converts to target currency → added to wallets.TARGET
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, targetCurrency, amount } = body;

    // ── 1. Validation ────────────────────────────────────────────────
    if (!email || !targetCurrency || !amount) {
      return NextResponse.json({ message: "Email, targetCurrency, and amount are required." }, { status: 400 });
    }

    const amountRequested = Number(amount);
    if (isNaN(amountRequested) || amountRequested <= 0) {
      return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
    }

    // ── 2. Find User ─────────────────────────────────────────────────
    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    // ── 3. Get user's local currency ─────────────────────────────────
    const localCurrency = (user.currency || "USD") as string;

    // ── 4. Get exchange rate (localCurrency → targetCurrency) ────────
    let amountDeductedFromBalance: number;

    if (localCurrency === targetCurrency) {
      // Same currency — no conversion needed, 1:1
      amountDeductedFromBalance = amountRequested;
    } else {
      // Fetch live rate
      const rateRes = await fetch(
        `${process.env.NEXTAUTH_URL}/api/exchange-rate?from=${targetCurrency}&to=${localCurrency}`
      );

      if (!rateRes.ok) {
        return NextResponse.json({ message: "Could not fetch exchange rate." }, { status: 502 });
      }

      const rateData = await rateRes.json();
      const rate: number = rateData.rates[localCurrency];

      if (!rate) {
        return NextResponse.json({ message: "Exchange rate unavailable." }, { status: 422 });
      }

      // How much local currency to deduct for the requested target amount
      // e.g. user wants 100 USD, rate = 1 USD = 59 PHP
      // so deduct 100 * 59 = 5900 PHP from balance
      amountDeductedFromBalance = parseFloat((amountRequested * rate).toFixed(4));
    }

    // ── 5. Balance Check ─────────────────────────────────────────────
    const currentBalance = user.balance || 0;
    if (currentBalance < amountDeductedFromBalance) {
      return NextResponse.json({
        message: `Insufficient balance. You need ${amountDeductedFromBalance} ${localCurrency} but have ${currentBalance} ${localCurrency}.`,
      }, { status: 400 });
    }

    // ── 6. Transaction record ────────────────────────────────────────
    const transactionId = `TOPUP_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const topupTx = {
      transactionId,
      type: "wallet_topup",
      fromCurrency: localCurrency,
      toCurrency: targetCurrency,
      amountDeducted: amountDeductedFromBalance,
      amountAdded: amountRequested,
      description: `Topped up ${amountRequested} ${targetCurrency} international wallet`,
      status: "completed",
      date: new Date(),
    };

    // ── 7. Update DB ─────────────────────────────────────────────────
    await users.updateOne(
      { email },
      {
        $inc: {
          balance: -amountDeductedFromBalance,                    // deduct from main balance
          [`wallets.${targetCurrency}`]: amountRequested,        // add to international wallet
        },
        $push: { history: { $each: [topupTx], $position: 0 } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      transactionId,
      summary: {
        deducted: `${amountDeductedFromBalance} ${localCurrency}`,
        added: `${amountRequested} ${targetCurrency}`,
        newBalance: parseFloat((currentBalance - amountDeductedFromBalance).toFixed(4)),
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Top Up Error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
