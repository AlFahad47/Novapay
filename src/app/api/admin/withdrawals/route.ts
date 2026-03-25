import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("novapay_db");

    // We use an aggregation to join the withdrawal request with the User's name/details
    const requests = await db.collection("withdraw-microsaving")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "userDetails"
          }
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            email: 1,
            amount: "$amountToWithdraw", // mapping your field name to UI name
            goalId: 1,
            status: 1,
            requestedAt: 1,
            reason: 1,
            user: {
              name: "$userDetails.name",
              email: "$userDetails.email"
            }
          }
        },
        { $sort: { requestedAt: -1 } } // Show newest first
      ]).toArray();

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// ... (existing imports and GET function)

export async function PATCH(req: Request) {
  try {
    const { status, goalId, email, amount } = await req.json();
    const client = await clientPromise;
    const db = client.db("novapay_db");

    let finalAmount = Number(amount);
    
    // Status approved 3% fee
    if (status === "approved") {
      const fee = finalAmount * 0.03;
      finalAmount = finalAmount - fee;
    }

    // Update withdrawal collection with net amount
    await db.collection("withdraw-microsaving").updateOne(
      { goalId, email },
      { $set: { status, netAmount: finalAmount, processedAt: new Date() } }
    );

    // Update user's microsaving status
    await db.collection("users").updateOne(
      { email, "microsaving.id": goalId },
      { $set: { "microsaving.$.status": status } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}