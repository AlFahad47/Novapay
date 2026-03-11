import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SUBSCRIPTION_PRICES, SUBSCRIPTION_DURATION_DAYS, SubscriptionPlan } from "@/types/subscription";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, plan } = body;

    if (!userEmail || !plan) {
      return NextResponse.json({ message: "Email and plan are required." }, { status: 400 });
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ message: "Invalid plan. Choose monthly or yearly." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    // Fetch user
    const user = await users.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if already subscribed
    if (user.subscription?.active) {
      const expiresAt = new Date(user.subscription.expiresAt);
      if (expiresAt > new Date()) {
        return NextResponse.json({ message: "You already have an active subscription." }, { status: 400 });
      }
    }

    const price = SUBSCRIPTION_PRICES[plan as SubscriptionPlan];
    const userBalance = user.balance ?? 0;

    if (userBalance < price) {
      return NextResponse.json({
        message: `Insufficient balance. You need ৳${price} but have ৳${userBalance}.`,
      }, { status: 400 });
    }

    // Find admin account
    const admin = await users.findOne({ role: "Admin" });
    if (!admin) {
      return NextResponse.json({ message: "Admin account not found." }, { status: 500 });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DURATION_DAYS[plan as SubscriptionPlan]);

    const subscriptionData = {
      active: true,
      plan,
      startDate: startDate.toISOString(),
      expiresAt: expiresAt.toISOString(),
      amount: price,
    };

    const historyEntry = {
      type: "subscription",
      amount: price,
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Elite Subscription`,
      date: startDate.toISOString(),
      status: "completed",
    };

    // Deduct from user, credit admin, save subscription
    await users.updateOne(
      { email: userEmail },
      {
        $inc: { balance: -price },
        $set: { subscription: subscriptionData, updatedAt: new Date().toISOString() },
        $push: { history: historyEntry } as any,
      }
    );

    await users.updateOne(
      { role: "Admin" },
      {
        $inc: { balance: price },
        $push: {
          history: {
            type: "subscription_income",
            amount: price,
            description: `Subscription payment from ${userEmail} (${plan})`,
            date: startDate.toISOString(),
            status: "completed",
          },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Subscription activated successfully!",
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error("Subscription purchase error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
