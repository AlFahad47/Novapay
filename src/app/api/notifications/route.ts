import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    /**
     * EXISTING LOGIC + NEW LOGIC
     * আমরা $or ব্যবহার করছি যাতে আপনার আগের 'to' ফিল্ড 
     * এবং নতুন 'receiverEmail' ফিল্ড—দুটোর জন্যই নোটিফিকেশন খুঁজে পায়।
     */
    const pendingRequest = await db.collection("notifications")
      .findOne(
        { 
          $or: [
            { to: email },            // আপনার আগের কোডের লজিক
            { receiverEmail: email }  // নতুন ব্যাংক রিকোয়েস্টের লজিক
          ], 
          status: "pending" 
        },
        { sort: { createdAt: -1, date: -1 } } // লেটেস্ট রিকোয়েস্ট সবার আগে
      );

    return NextResponse.json({ 
      success: true, 
      request: pendingRequest ? {
        _id: pendingRequest._id.toString(),
        
        // এখানে আমরা নিশ্চিত করছি যে 'from' অথবা 'senderEmail' যেটাতেই ডেটা থাকুক, 
        // ফ্রন্টএন্ড যেন সেটা পায়।
        from: pendingRequest.from || pendingRequest.senderEmail, 
        
        amount: pendingRequest.amount,
        note: pendingRequest.note,
        status: pendingRequest.status,
        
        // টাইপটি পাঠানো জরুরি যাতে ফ্রন্টএন্ড বুঝতে পারে এটা কি রিকোয়েস্ট
        type: pendingRequest.type || "standard_request" 
      } : null 
    });
  } catch (error) {
    console.error("Fetch Notification Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }       
}