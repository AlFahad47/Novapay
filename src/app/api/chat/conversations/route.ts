import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  // 1. Only admins can access this route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("novapay_db");

  // 2. Use MongoDB aggregation to group messages by channelId
  // Aggregation = a pipeline of steps that transforms the data
  const conversations = await db.collection("messages").aggregate([
    // Step 1: Only look at support messages
    { $match: { type: "support" } },

    // Step 2: Sort by timestamp so latest message comes last in each group
    { $sort: { timestamp: 1 } },

    // Step 3: Group by channelId - keep only the LAST message per channel
    {
      $group: {
        _id: "$channelId",                     // group key
        lastMessage: { $last: "$text" },        // last message text
        lastTimestamp: { $last: "$timestamp" }, // last message time
        senderName: { $last: "$senderName" },   // who sent the last message
        senderImage: { $last: "$senderImage" }, // their avatar
        senderId: { $last: "$senderId" },       // their user ID
        unreadCount: {                          // count unread messages
          $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] }
        },
      },
    },

    // Step 4: Sort conversations by latest message first
    { $sort: { lastTimestamp: -1 } },
  ]).toArray();

  return NextResponse.json({ conversations });
}

