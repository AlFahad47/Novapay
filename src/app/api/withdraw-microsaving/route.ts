import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; 

export async function POST(req: Request) {
  try {
    const { email, goalId, goalName, amountToWithdraw, reason } = await req.json();

    if (!email || !goalId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db"); // Replace with your DB name

    // 1. Create the Withdrawal Request for Admin
    const withdrawalRequest = {
      email,
      goalId,
      goalName,
      amountToWithdraw,
      reason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    await db.collection("withdraw-microsaving").insertOne(withdrawalRequest);

    // 2. Update the Goal Status in the User's Microsaving Array
    // This prevents multiple requests and lets the UI show "Pending Review"
    const updateResult = await db.collection("users").updateOne(
      { email: email, "microsaving.id": goalId },
      { 
        $set: { "microsaving.$.status": "pending-withdrawal" } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Withdrawal request submitted" }, { status: 200 });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}