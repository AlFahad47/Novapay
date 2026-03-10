import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  // 1. Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Read channelId from the URL query string
  // Example URL: /api/chat/history?channelId=support-abc123
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  // 3. Fetch all messages for this channel from MongoDB
  // Sort by timestamp ascending so oldest message appears at the top
  const client = await clientPromise;
  const db = client.db("novapay_db");

  const messages = await db
    .collection("messages")
    .find({ channelId })
    .sort({ timestamp: 1 })
    .toArray();

  return NextResponse.json({ messages });
}
