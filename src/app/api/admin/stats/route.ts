import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🔎 Debug session
    if (!session) {
      return NextResponse.json(
        { message: "No session found" },
        { status: 401 }
      );
    }

    if (!session.user?.email) {
      return NextResponse.json(
        { message: "Session has no email" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({
      email: session.user.email,
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    // 🔥 IMPORTANT FIX
    // Case insensitive + fallback
    const role = (currentUser.role || "").toLowerCase();

    if (role !== "admin") {
      return NextResponse.json(
        { message: `Your role is '${currentUser.role}' (not Admin)` },
        { status: 403 }
      );
    }

    /* ========================= */

    const totalUsers = await usersCollection.countDocuments();
    const pendingKYC = await usersCollection.countDocuments({
      kycStatus: "Pending",
    });

    const users = await usersCollection.find().toArray();

    let totalTransactions = 0;
    let totalRevenue = 0;
    let recentTransactions: any[] = [];
    const monthlyMap: Record<number, number> = {};

    users.forEach((user) => {
      const history = user.history || [];

      totalTransactions += history.length;

      history.forEach((tx: any) => {
        if (tx.status === "completed") {
          totalRevenue += Number(tx.amount || 0);

          if (tx.date) {
            const month = new Date(tx.date).getMonth();
            monthlyMap[month] =
              (monthlyMap[month] || 0) + Number(tx.amount || 0);
          }
        }

        recentTransactions.push({
          id: tx.transactionId || Math.random().toString(),
          user: user.name || user.email,
          amount: tx.amount || 0,
          status: tx.status || "unknown",
          date: tx.date
            ? new Date(tx.date).toDateString()
            : "",
        });
      });
    });

    recentTransactions.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const revenue = Object.keys(monthlyMap).map((m) => ({
      name: monthNames[Number(m)],
      value: monthlyMap[Number(m)],
    }));

    return NextResponse.json({
      stats: [
        { title: "Total Users", value: totalUsers },
        { title: "Total Revenue", value: totalRevenue },
        { title: "Transactions", value: totalTransactions },
        { title: "Pending KYC", value: pendingKYC },
      ],
      revenue,
      transactions: recentTransactions.slice(0, 5),
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}