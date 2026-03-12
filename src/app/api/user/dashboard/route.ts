import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({
    email: session.user.email,
  });

  const transactions = await db
    .collection("transactions")
    .find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const pendingRequests = await db
    .collection("requests")
    .countDocuments({ userEmail: session.user.email, status: "pending" });

  const notifications = await db
    .collection("notifications")
    .countDocuments({ userEmail: session.user.email, read: false });

  return NextResponse.json({
    balance: user?.balance || 0,
    pendingRequests,
    notifications,
    transactions: transactions.map((t) => ({
      name: t.title,
      amount: t.amount,
      time: new Date(t.createdAt).toLocaleString(),
    })),
  });
}
