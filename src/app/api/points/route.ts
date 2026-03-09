import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";


const POINT_CONFIG: Record<string, number> = {
  KYC_APPROVED: 100,
  SEND_MONEY: 20,
  ADD_MONEY: 10,
  MOBILE_RECHARGE: 15,
  CASH_OUT: 10,
  DEPOSIT: 20,
  REQUEST_MONEY: 5,
  BILL_PAYMENT: 20
};

const RANK_LEVELS = {
  PLATINUM: 5000,
  GOLD: 2000,
  SILVER: 500,
  BRONZE: 0,
};

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, activityType } = body; 

    if (!email || !activityType) {
      return NextResponse.json({ error: "Email and activity type are required" }, { status: 400 });
    }

   
    const pointsToAdd = POINT_CONFIG[activityType] || 0;
    
    if (pointsToAdd === 0) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const totalPoints = (user.points || 0) + pointsToAdd;
    const now = new Date();

    
    let newRank = "Bronze";
    if (totalPoints >= RANK_LEVELS.PLATINUM) newRank = "Platinum";
    else if (totalPoints >= RANK_LEVELS.GOLD) newRank = "Gold";
    else if (totalPoints >= RANK_LEVELS.SILVER) newRank = "Silver";

    
    await usersCollection.updateOne(
      { email: email },
      {
        $set: {
          points: totalPoints,
          rank: newRank,
          updatedAt: now,
        },
        $push: {
          pointsHistory: {
            amount: pointsToAdd,
            reason: activityType.replace(/_/g, " "), // 'SEND_MONEY' হবে 'SEND MONEY'
            timestamp: now,
          },
        } as any,
      }
    );

    return NextResponse.json({
      success: true,
      addedPoints: pointsToAdd,
      totalPoints: totalPoints,
      rank: newRank,
      rankUp: newRank !== (user.rank || "Bronze"),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}