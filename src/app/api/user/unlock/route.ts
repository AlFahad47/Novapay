import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cost, featureName } = await req.json();

    const client = await clientPromise;
    const db = client.db("novapay_db"); // Ensure using the correct DB name

    // Find and update in one atomic operation
    const result = await db.collection("users").findOneAndUpdate(
      { email: session.user.email },
      { 
        // 1. Points kombe (spending balance)
        $inc: { points: -cost }, 
        // 2. Feature-ti list-e add hobe
        $addToSet: { unlockedFeatures: featureName } 
        // NOTE: Ekhane 'rank' update korar dorkar nei. 
        // Rank jeno na bodlay, tai rank related kono code ekhane add kora jabe na.
      },
      { 
        returnDocument: "after",
        projection: { password: 0 } // Security: password chara baki data pathabe
      }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the updated user object directly
    return NextResponse.json(result);

  } catch (error) {
    console.error("Unlock Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}