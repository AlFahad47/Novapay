import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json();
    const client = await clientPromise;
    const db = client.db("novapay_db");

    const requestedAmount = parseFloat(amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json({ error: "Invalid loan amount" }, { status: 400 });
    }

    // 1. HARD CHECK: Does this user already have an unfinished loan?
    const existingLoan = await db.collection("loans").findOne({ 
      userEmail: email, 
      status: { $in: ["active", "defaulted", "pending"] } 
    });

    if (existingLoan) {
      return NextResponse.json({ 
        error: "You already have an active or pending loan. Please repay it first." 
      }, { status: 400 });
    }

    // 2. Fetch User & Verify AI Limit
    const user = await db.collection("users").findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (requestedAmount > (user.loanLimit || 0)) {
      return NextResponse.json({ error: "Amount exceeds your AI-approved limit" }, { status: 400 });
    }

    // 3. Create the Active Loan Object (Pre-approved model)
    const interest = 0.05; // 5% flat fee
    const totalPayable = requestedAmount * (1 + interest);
    
    const activeLoan = {
      userId: user._id,
      userEmail: email,
      amount: requestedAmount,
      totalPayable: totalPayable,
      remainingAmount: totalPayable,
      monthlyInstallment: totalPayable / 12, // 12-month repayment plan
      status: "active",
      nextInstallmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    // 4. Prepare Transaction for wallethistory
    const transactionItem = { 
      id: `LN-${Math.random().toString(36).toUpperCase().substring(2, 7)}`,
      type: "loan_disbursement", 
      amount: requestedAmount, 
      date: new Date() 
    };

    // 5. Atomic Update Logic
    // Insert loan record
    await db.collection("loans").insertOne(activeLoan);

    // Update User Balance, Reset Limit, and Handle wallethistory (if null)
    const isHistoryNull = user.wallethistory === null || !user.wallethistory;

    await db.collection("users").updateOne(
      { email },
      { 
        $inc: { balance: requestedAmount },
        $set: { 
          loanLimit: 0, // Reset limit so they can't take another loan immediately
          ...(isHistoryNull && { wallethistory: [transactionItem] }) 
        },
        ...(!isHistoryNull && { $push: { wallethistory: transactionItem as any } })
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Loan disbursed successfully!" 
    });

  } catch (error: any) {
    console.error("DISBURSEMENT ERROR:", error.message);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}