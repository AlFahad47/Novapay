import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch User Data
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    // 2. Fetch Active Loan (This makes the Repayment Card appear in UI)
    const activeLoan = await db.collection("loans").findOne({
      userEmail: session.user.email,
      status: { $in: ["active", "defaulted"] }, // Only show if debt is current
    });

    // 3. Fetch Transactions
    const transactions = await db
      .collection("transactions")
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // 4. Counts for Dashboard Badges
    const pendingRequests = await db
      .collection("requests")
      .countDocuments({ userEmail: session.user.email, status: "pending" });

    const notifications = await db
      .collection("notifications")
      .countDocuments({ userEmail: session.user.email, read: false });

    // 5. Return JSON with the added 'activeLoan' key
    return NextResponse.json({
      balance: user?.balance || 0,
      loanLimit: user?.loanLimit || 0,
      limitReason: user?.limitReason || null, // Ensure UI can show why limit is 0
      pendingRequests,
      notifications,
      activeLoan: activeLoan || null, // Sent to frontend to trigger {activeLoan && (...)}
      transactions: transactions.map((t) => ({
        name: t.title,
        amount: t.amount,
        time: new Date(t.createdAt).toLocaleString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}