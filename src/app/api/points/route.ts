import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const POINT_CONFIG: Record<string, number> = {
  KYC_APPROVED: 100,
  SEND_MONEY: 5000,
  ADD_MONEY: 25,
  MOBILE_RECHARGE: 15,
  CASH_OUT: 25,
  DEPOSIT: 50,
  REQUEST_MONEY: 20,
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

    // logic change: 
    // points = spending balance (jeta khoroch kora jay)
    // totalXP = lifetime earnings (jeta diye rank check hobe)
    const currentPoints = (user.points || 0) + pointsToAdd;
    const totalXP = (user.totalXP || 0) + pointsToAdd; 
    const now = new Date();

    // Rank calculate hobe Lifetime XP (totalXP) er upor, current points er upor noy
    let newRank = "Bronze";
    if (totalXP >= RANK_LEVELS.PLATINUM) newRank = "Platinum";
    else if (totalXP >= RANK_LEVELS.GOLD) newRank = "Gold";
    else if (totalXP >= RANK_LEVELS.SILVER) newRank = "Silver";

    await usersCollection.updateOne(
      { email: email },
      {
        $set: {
          points: currentPoints, // Spending balance 
          totalXP: totalXP,      // Lifetime record 
          rank: newRank,         // Rank totalXP 
          updatedAt: now,
        },
        $push: {
          pointsHistory: {
            amount: pointsToAdd,
            reason: activityType.replace(/_/g, " "),
            timestamp: now,
          },
        } as any,
      }
    );

    return NextResponse.json({
      success: true,
      addedPoints: pointsToAdd,
      totalPoints: currentPoints,
      totalXP: totalXP,
      rank: newRank,
      rankUp: newRank !== (user.rank || "Bronze"),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}