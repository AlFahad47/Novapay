import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { email, loanId } = await req.json();
    const client = await clientPromise;
    const db = client.db("novapay_db");

    const loan = await db.collection("loans").findOne({ _id: new ObjectId(loanId) });
    const user = await db.collection("users").findOne({ email });

    if (!loan || !user) return NextResponse.json({ error: "Data not found" }, { status: 404 });

    const totalDebt = loan.remainingAmount;

    // Check if user has enough money to pay off the loan
    if (user.balance < totalDebt) {
      return NextResponse.json({ error: "Insufficient balance to clear loan" }, { status: 400 });
    }

    // 1. Deduct balance and add to history
    await db.collection("users").updateOne(
      { email },
      
      { 
        $inc: { balance: -totalDebt },
        $set: { 
          loanLimit: null,   // This makes the "Calculate My Limit" button come back
          limitReason: null  // This removes the "Repay current loan" warning
        },
        $push: { 
          wallethistory: { 
            id: `PAY-${Math.random().toString(36).toUpperCase().substring(2, 6)}`,
            type: "loan_repayment_manual", 
            amount: totalDebt, 
            date: new Date() 
          } 
        } as any
      }
    );

    // 2. Mark loan as completed
    await db.collection("loans").updateOne(
      { _id: new ObjectId(loanId) },
      { $set: { remainingAmount: 0, status: "completed", closedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REPAYMENT ERROR:", error);
    return NextResponse.json({ error: "Repayment failed" }, { status: 500 });
  }
}