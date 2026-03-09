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
    const db = client.db();

    // Find and update in one atomic operation
    const result = await db.collection("users").findOneAndUpdate(
      { email: session.user.email },
      { 
        $inc: { points: -cost }, 
        $addToSet: { unlockedFeatures: featureName } 
      },
      { returnDocument: "after" } // Crucial: returns the user AFTER the change
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