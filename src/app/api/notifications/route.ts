import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// --- GET: Fetch ALL pending notifications ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // We use .find() instead of .findOne() to get every pending notification
    const pendingRequests = await db.collection("notifications")
      .find({ 
        $or: [
          { to: email },           
          { receiverEmail: email }  
        ], 
        status: "pending" 
      })
      .sort({ createdAt: -1, date: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      // We map the array to ensure IDs are strings and keys are consistent
      requests: pendingRequests.map(req => ({
        _id: req._id.toString(),
        from: req.from || req.senderEmail || req.receiverEmail, 
        amount: req.amount,
        note: req.note,
        status: req.status,
        type: req.type || "standard_request",
        goalId: req.goalId || null,
        savingDay: req.savingDay || null
      }))
    });
  } catch (error) {
    console.error("Fetch Notification Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }       
}

// --- POST: Logic for creating saving reminders or requests ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, goalName, amount, savingDay } = body;

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 1. Find the user AND the specific goal in their microsaving array
    const user = await db.collection("users").findOne({ 
      email: email, 
      "microsaving.goalName": goalName 
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User or Goal not found" }, { status: 404 });
    }

    // 2. Extract the actual 'id' from the database to ensure a perfect match
    const targetGoal = user.microsaving.find((g: any) => g.goalName === goalName);

    if (!targetGoal) {
      return NextResponse.json({ success: false, message: "Target goal not found" }, { status: 404 });
    }

    // 3. Create the notification using the verified targetGoal.id
    const notification = {
      to: email,
      receiverEmail: email,
      from: "Micro-saving Account",
      // 🎯 This ensures the notification ID matches the User Goal ID exactly
      goalId: targetGoal.id, 
      amount: Number(amount),
      note: `Saving reminder for ${goalName}`,
      savingDay: savingDay,
      type: "saving_reminder",
      status: "pending", 
      createdAt: new Date(),
    };

    await db.collection("notifications").insertOne(notification);

    return NextResponse.json({ success: true, message: "Notification synced and created" });
  } catch (error: any) {
    console.error("Notification Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}