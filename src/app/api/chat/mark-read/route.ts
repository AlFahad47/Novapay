import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { channelId } = await req.json();
  if (!channelId) {
    return NextResponse.json({ error: "channelId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const client = await clientPromise;
  const db = client.db("novapay_db");

  // Mark all messages in this channel as read, EXCEPT the ones the current user sent
  await db.collection("messages").updateMany(
    { channelId, read: false, senderId: { $ne: userId } },
    { $set: { read: true } }
  );

  return NextResponse.json({ success: true });
}
