import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 'find email
    const pendingRequest = await db.collection("notifications")
      .findOne(
        { to: email, status: "pending" },
        { sort: { createdAt: -1 } } //latest req
      );

    return NextResponse.json({ 
      success: true, 
      request: pendingRequest ? {
        _id: pendingRequest._id.toString(), // ID string
        from: pendingRequest.from,
        amount: pendingRequest.amount,
        note: pendingRequest.note,
        status: pendingRequest.status
      } : null 
    });
  } catch (error) {
    console.error("Fetch Notification Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }       
}