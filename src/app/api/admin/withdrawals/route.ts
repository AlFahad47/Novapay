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
    const { status, goalId, email } = await req.json();

    if (!status || !goalId || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 1. Withdrawal Request collection update (Sob somoy hobe, status approved hok ba rejected)
    const withdrawUpdate = await db.collection("withdraw-microsaving").updateOne(
      { goalId: goalId, email: email }, 
      { $set: { status: status, processedAt: new Date() } }
    );

    if (withdrawUpdate.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Request not found" }, 
        { status: 404 }
      );
    }

    // 2. Main User collection update (Approved ba Rejected - dui khetrei user dashboard update hobe)
    // Age shudhu status === 'approved' chilo, ekhon status check ta remove kore diyechi
    // jate 'rejected' pathaleo database-e update hoy.
    
    await db.collection("users").updateOne(
      { email: email, "microsaving.id": goalId }, 
      { 
        $set: { "microsaving.$.status": status } // dynamic bhabe approved/rejected bose jabe
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Status updated to ${status} in both collections!` 
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}