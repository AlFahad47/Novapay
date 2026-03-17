import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json(); // "approved" or "rejected"
    const { id } = params;

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 1. Find the original request to get amount and email
    const requestData = await db.collection("withdraw-microsaving").findOne({ _id: new ObjectId(id) });

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 2. Update the status in the requests collection
    await db.collection("withdraw-microsaving").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status, processedAt: new Date().toISOString() } }
    );

    if (status === "approved") {
      // 3. Add money to user's main balance and update the microsaving goal
      await db.collection("users").updateOne(
        { email: requestData.email },
        { 
          $inc: { balance: Number(requestData.amountToWithdraw) },
          // Remove or complete the specific goal in the microsaving array
          $pull: { microsaving: { id: requestData.goalId } } 
        }
      );
      
      // 4. Record a transaction for the user's history
      await db.collection("transactions").insertOne({
        email: requestData.email,
        type: "withdraw_success",
        amount: requestData.amountToWithdraw,
        description: `Early withdrawal for: ${requestData.goalName}`,
        date: new Date().toISOString()
      });
    } else {
      // If rejected, set the microsaving goal back to "active"
      await db.collection("users").updateOne(
        { email: requestData.email, "microsaving.id": requestData.goalId },
        { $set: { "microsaving.$.status": "active" } }
      );
    }

    return NextResponse.json({ success: true, message: `Request ${status}` });
  } catch (error) {
    console.error("Admin PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}