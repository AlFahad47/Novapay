import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import pusherServer from "@/lib/pusher";

export async function POST(req: NextRequest) {
  // 1. Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Read the message data sent from the browser
  const { channelId, type, text, receiverId } = await req.json();

  if (!channelId || !text || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 3. Build the message object to save in MongoDB
  const message = {
    channelId,              // e.g. "support-abc123" or "dm-abc-xyz"
    type,                   // "support" or "dm"
    senderId: session.user.id,
    senderName: session.user.name ?? "Unknown",
    senderImage: session.user.image ?? null,
    text,
    timestamp: new Date(),
    read: false,            // unread by default - used for notification badges later
  };

  // 4. Save the message to MongoDB (messages collection)
  const client = await clientPromise;
  const db = client.db("novapay_db");
  await db.collection("messages").insertOne(message);

  // 5. Trigger Pusher - this pushes the message to all browsers subscribed to this channel
  await pusherServer.trigger(channelId, "new-message", {
    senderId: session.user.id,
    senderName: session.user.name,
    senderImage: session.user.image,
    text,
    timestamp: message.timestamp,
    read: false,
  });

  return NextResponse.json({ success: true });
}

