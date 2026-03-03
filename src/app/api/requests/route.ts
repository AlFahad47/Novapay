import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * 
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    const pendingRequest = await db.collection("notifications").findOne(
      { to: email, status: "pending" },
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({
      success: true,
      request: pendingRequest
        ? {
            _id: pendingRequest._id.toString(),
            from: pendingRequest.from,
            amount: pendingRequest.amount,
            note: pendingRequest.note,
            createdAt: pendingRequest.createdAt,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

/**
 * 
 */
export async function POST(request: Request) {
  try {
    const { senderEmail, receiverEmail, amount, note } = await request.json();

    if (!senderEmail || !receiverEmail || !amount) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // --- 
    const recipientUser = await usersCollection.findOne({ 
      email: receiverEmail.toLowerCase().trim() 
    });

    if (!recipientUser) {
      return NextResponse.json({ 
        success: false, 
        message: "The user you're requesting money from does not exist." 
      }, { status: 404 });
    }

    // --- KYC validation ---
    if (recipientUser.kycStatus !== "approved") {
      return NextResponse.json({ 
        success: false, 
        message: "Recipient is not KYC verified. You can only request money from verified users." 
      }, { status: 403 });
    }

    const newRequest = {
      from: senderEmail,
      to: receiverEmail.toLowerCase().trim(),
      amount: Number(amount),
      note: note || "No note added",
      status: "pending",
      type: "money_request",
      createdAt: new Date(),
    };

    await db.collection("notifications").insertOne(newRequest);

    return NextResponse.json({ success: true, message: "Request sent successfully!" });
  } catch (error) {
    console.error("Request Error:", error);
    return NextResponse.json({ success: false, message: "Error sending request" }, { status: 500 });
  }
}

/**
 * ৩. DELETE: 
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Request ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    const result = await db.collection("notifications").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true, message: "Notification removed" });
    } else {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}