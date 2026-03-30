import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SupportedCurrency } from "@/types/international";

// POST /api/transfer/cashout
// Flow: user has wallets.X (foreign currency) → converts to BDT → added to main balance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, sourceCurrency, amount } = body;

    // ── 1. Validation ────────────────────────────────────────────────
    if (!email || !sourceCurrency || !amount) {
      return NextResponse.json(
        { message: "Email, sourceCurrency, and amount are required." },
        { status: 400 }
      );
    }

    const amountToConvert = Number(amount);
    if (isNaN(amountToConvert) || amountToConvert <= 0) {
      return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
    }

    // ── 2. Find User ─────────────────────────────────────────────────
    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    // ── 3. Check wallet balance ───────────────────────────────────────
    const walletBalance = user.wallets?.[sourceCurrency] ?? 0;
    if (walletBalance < amountToConvert) {
      return NextResponse.json(
        {
          message: `Insufficient ${sourceCurrency} wallet balance. You have ${walletBalance} ${sourceCurrency}.`,
        },
        { status: 400 }
      );
    }

    // ── 4. Get exchange rate (sourceCurrency → BDT) ──────────────────
    const localCurrency = "BDT";
    let bdtAmountToAdd: number;

    if (sourceCurrency === localCurrency) {
      bdtAmountToAdd = amountToConvert;
    } else {
      const rateRes = await fetch(
        `https://open.er-api.com/v6/latest/${sourceCurrency}`,
        { next: { revalidate: 600 } }
      );

      if (!rateRes.ok) {
        return NextResponse.json({ message: "Could not fetch exchange rate." }, { status: 502 });
      }

      const rateData = await rateRes.json();
      const rate: number = rateData.rates?.[localCurrency];

      if (!rate) {
        return NextResponse.json(
          { message: "Exchange rate unavailable." },
          { status: 422 }
        );
      }

      // e.g. 50 USD × 110 BDT/USD = 5500 BDT
      bdtAmountToAdd = parseFloat((amountToConvert * rate).toFixed(4));
    }

    // ── 5. Transaction record ────────────────────────────────────────
    const transactionId = `CASHOUT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const cashoutTx = {
      transactionId,
      type: "wallet_cashout",
      fromCurrency: sourceCurrency,
      toCurrency: localCurrency,
      amountDeducted: amountToConvert,
      amountAdded: bdtAmountToAdd,
      description: `Cashed out ${amountToConvert} ${sourceCurrency} → ${bdtAmountToAdd} BDT`,
      status: "completed",
      date: new Date(),
    };

    // ── 6. Update DB ─────────────────────────────────────────────────
    const currentBalance = user.balance ?? 0;

    await users.updateOne(
      { email },
      {
        $inc: {
          balance: bdtAmountToAdd,                               // add to main BDT balance
          [`wallets.${sourceCurrency}`]: -amountToConvert,       // deduct from foreign wallet
        },
        $push: { history: { $each: [cashoutTx], $position: 0 } } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      {
        success: true,
        transactionId,
        summary: {
          deducted: `${amountToConvert} ${sourceCurrency}`,
          added: `${bdtAmountToAdd} BDT`,
          newBalance: parseFloat((currentBalance + bdtAmountToAdd).toFixed(4)),
          newWalletBalance: parseFloat((walletBalance - amountToConvert).toFixed(4)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cash Out Error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
