import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, amount, note } = body; 

    if (!email || !amount || !type) {
      return NextResponse.json({ message: "Data missing" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const numAmount = Number(amount);

    // Transaction History Object
    const newTransaction = {
      id: crypto.randomUUID(),
      type, // 'income' or 'expense'
      amount: numAmount,
      note: note || (type === 'income' ? "Cash In" : "Cash Out"),
      date: new Date(),
    };

    // Database Atomic Update
    const updateOps: any = {
      $push: { wallethistory: { $each: [newTransaction], $position: 0 } },
      $set: { "wallet.lastTransactionDate": new Date(), updatedAt: new Date() }
    };

    if (type === "income") {
      updateOps.$inc = { 
        bankBalance: numAmount, 
        "wallet.totalPhysicalIncome": numAmount 
      };
    } else {
      updateOps.$inc = { 
        bankBalance: -numAmount, 
        "wallet.totalPhysicalExpense": numAmount 
      };
    }

    const result = await db.collection("users").updateOne({ email }, updateOps);

    return NextResponse.json({ success: true, message: "Balance updated" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}