import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await clientPromise;
  const db = client.db("novapay_db");

  // Find all DM conversations the current user is part of
  // A DM channel looks like "dm-{id1}-{id2}" where both IDs are present
  const conversations = await db.collection("messages").aggregate([
    // Only DM messages involving this user
    {
      $match: {
        type: "dm",
        channelId: { $regex: userId },
      },
    },

    // Sort by time so the last message is accurate
    { $sort: { timestamp: 1 } },

    // Group by channel — keep only the latest message per conversation
    {
      $group: {
        _id: "$channelId",
        lastMessage: { $last: "$text" },
        lastTimestamp: { $last: "$timestamp" },
        lastSenderId: { $last: "$senderId" },
        lastSenderName: { $last: "$senderName" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$read", false] }, { $ne: ["$senderId", userId] }] },
              1,
              0,
            ],
          },
        },
      },
    },

    // Latest first
    { $sort: { lastTimestamp: -1 } },
  ]).toArray();

  // Extract the OTHER user's ID from the channelId (format: "dm-{id1}-{id2}")
  // One of them is the current user — the other one is who we want
  const enriched = conversations.map((conv) => {
    const parts = conv._id.replace("dm-", "").split("-");
    // channelId = "dm-" + smallerId + "-" + largerId
    // But IDs can contain hyphens (MongoDB ObjectIds don't, so this is safe)
    const otherUserId = parts.find((p: string) => p !== userId) ?? parts[0];
    return { ...conv, otherUserId };
  });

  return NextResponse.json({ conversations: enriched });
}
