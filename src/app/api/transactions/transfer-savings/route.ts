import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, goalId } = await req.json();

    if (!email || !goalId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 1. Approved Request 
    const withdrawalDoc = await db.collection("withdraw-microsaving").findOne({
      email,
      goalId,
      status: "approved" 
    });

    if (!withdrawalDoc) {
      return NextResponse.json({ error: "Approved request not found" }, { status: 404 });
    }

    // 2. 5% Fee Calculation
    const originalAmount = Number(withdrawalDoc.amountToWithdraw);
    const fee = originalAmount * 0.05;
    const netAmount = originalAmount - fee;

    // 3. User Database Update (Balance Increase & Goal Pull)
    const userUpdate = await db.collection("users").updateOne(
      { email },
      { 
        $inc: { balance: netAmount },
        $pull: { microsaving: { id: goalId } } 
      }
    );

    if (userUpdate.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update user balance" }, { status: 500 });
    }

    // 4. Transaction Record 
    await db.collection("transactions").insertOne({
      email,
      type: "savings_transfer",
      amount: netAmount,
      fee: fee,
      description: `Early withdrawal from goal: ${withdrawalDoc.goalName}`,
      status: "completed",
      date: new Date()
    });

    // 5. Withdrawal Record Status Update 
    await db.collection("withdraw-microsaving").updateOne(
      { _id: withdrawalDoc._id },
      { $set: { status: "completed", transferredAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Transferred ${netAmount.toFixed(2)} to wallet (3% fee deducted).` 
    });

  } catch (error: any) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}