import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { FX_FEE_PERCENT, SupportedCurrency } from "@/types/international";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderEmail, recipientEmail, fromCurrency, toCurrency, amount, description } = body;

    // ── 1. Basic Validation ──────────────────────────────────────────
    if (!senderEmail || !recipientEmail || !fromCurrency || !toCurrency || !amount) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (senderEmail === recipientEmail) {
      return NextResponse.json({ message: "Cannot send money to yourself." }, { status: 400 });
    }

    if (fromCurrency === toCurrency) {
      return NextResponse.json({ message: "Use regular transfer for same currency." }, { status: 400 });
    }

    const amountSent = Number(amount);
    if (isNaN(amountSent) || amountSent <= 0) {
      return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
    }

    // ── 2. Fetch Live Exchange Rate ──────────────────────────────────
    // We call our own exchange-rate API route internally
    const rateRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/exchange-rate?from=${fromCurrency}&to=${toCurrency}`
    );

    if (!rateRes.ok) {
      return NextResponse.json({ message: "Could not fetch exchange rate. Try again." }, { status: 502 });
    }

    const rateData = await rateRes.json();
    const rate: number = rateData.rates[toCurrency as SupportedCurrency];

    if (!rate) {
      return NextResponse.json({ message: "Exchange rate unavailable for this currency pair." }, { status: 422 });
    }

    // ── 3. Calculate Fee & Final Amount ─────────────────────────────
    // Fee = 2% of amountSent (in fromCurrency)
    const fee = parseFloat(((amountSent * FX_FEE_PERCENT) / 100).toFixed(4));
    const totalDeducted = parseFloat((amountSent + fee).toFixed(4));
    const amountReceived = parseFloat((amountSent * rate).toFixed(4));

    // ── 4. Database Operations ───────────────────────────────────────
    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    // Find both users
    const [sender, recipient] = await Promise.all([
      users.findOne({ email: senderEmail }),
      users.findOne({ email: recipientEmail }),
    ]);

    if (!sender) return NextResponse.json({ message: "Sender not found." }, { status: 404 });
    if (!recipient) return NextResponse.json({ message: "Recipient not found." }, { status: 404 });

    // KYC check
    if (recipient.kycStatus !== "approved") {
      return NextResponse.json({ message: "Recipient is not KYC verified." }, { status: 403 });
    }

    // ── 5. Balance Check ─────────────────────────────────────────────
    // Check sender's wallet for fromCurrency
    // wallets = { USD: 100, PHP: 500, ... }
    const senderWallets = sender.wallets || {};
    const senderBalance = senderWallets[fromCurrency] ?? 0;

    if (senderBalance < totalDeducted) {
      return NextResponse.json({
        message: `Insufficient ${fromCurrency} balance. You have ${senderBalance.toFixed(2)} ${fromCurrency} but need ${totalDeducted} ${fromCurrency}.`,
      }, { status: 400 });
    }

    // ── 6. Build Transaction History Entries ────────────────────────
    const transactionId = `INTL_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const senderTx = {
      transactionId,
      type: "international_send",
      fromCurrency,
      toCurrency,
      amountSent,
      amountReceived,
      rate,
      fee,
      totalDeducted,
      senderEmail,
      recipientEmail,
      description: description || `International transfer to ${recipientEmail}`,
      status: "completed",
      date: new Date(),
    };

    const recipientTx = {
      transactionId,
      type: "international_receive",
      fromCurrency,
      toCurrency,
      amountSent,
      amountReceived,
      rate,
      fee,
      senderEmail,
      recipientEmail,
      description: description || `International transfer from ${senderEmail}`,
      status: "completed",
      date: new Date(),
    };

    // ── 7. Atomic DB Update ──────────────────────────────────────────
    await Promise.all([
      // Deduct from sender's wallet
      users.updateOne(
        { email: senderEmail },
        {
          $inc: { [`wallets.${fromCurrency}`]: -totalDeducted },
          $push: { history: { $each: [senderTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        }
      ),
      // Credit to recipient's wallet
      users.updateOne(
        { email: recipientEmail },
        {
          $inc: { [`wallets.${toCurrency}`]: amountReceived },
          $push: { history: { $each: [recipientTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        }
      ),
    ]);

    // ── 8. Return Success Response ───────────────────────────────────
    return NextResponse.json({
      success: true,
      transactionId,
      summary: {
        sent: `${amountSent} ${fromCurrency}`,
        fee: `${fee} ${fromCurrency}`,
        totalDeducted: `${totalDeducted} ${fromCurrency}`,
        received: `${amountReceived} ${toCurrency}`,
        rate: `1 ${fromCurrency} = ${rate} ${toCurrency}`,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("International Transfer Error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
