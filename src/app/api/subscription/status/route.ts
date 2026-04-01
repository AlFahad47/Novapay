import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const subscription = user.subscription ?? null;

    if (!subscription || !subscription.active) {
      return NextResponse.json({ subscribed: false, subscription: null, daysLeft: null });
    }

    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();

    if (expiresAt <= now) {
      // Expired - mark inactive in DB
      await db.collection("users").updateOne(
        { email },
        { $set: { "subscription.active": false } }
      );
      return NextResponse.json({ subscribed: false, subscription: null, daysLeft: null });
    }

    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      subscribed: true,
      subscription,
      daysLeft,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

