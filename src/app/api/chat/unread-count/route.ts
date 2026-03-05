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
  const isAdmin = session.user.role?.toLowerCase() === "admin";
  const client = await clientPromise;
  const db = client.db("novapay_db");

  if (isAdmin) {
    // Admin: count all unread support messages NOT sent by the admin
    const support = await db.collection("messages").countDocuments({
      type: "support",
      read: false,
      senderId: { $ne: userId },
    });

    // Admin: count unread DMs sent to admin
    const dm = await db.collection("messages").countDocuments({
      type: "dm",
      channelId: { $regex: userId },
      read: false,
      senderId: { $ne: userId },
    });

    return NextResponse.json({ support, dm, total: support + dm });
  } else {
    // Regular user: count unread messages in their own support channel
    const support = await db.collection("messages").countDocuments({
      channelId: `support-${userId}`,
      read: false,
      senderId: { $ne: userId },
    });

    // User: count unread DMs
    const dm = await db.collection("messages").countDocuments({
      type: "dm",
      channelId: { $regex: userId },
      read: false,
      senderId: { $ne: userId },
    });

    return NextResponse.json({ support, dm, total: support + dm });
  }
}
