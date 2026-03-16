// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import clientPromise from "@/lib/mongodb";

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     // 🔎 Debug session
//     if (!session) {
//       return NextResponse.json(
//         { message: "No session found" },
//         { status: 401 }
//       );
//     }

//     if (!session.user?.email) {
//       return NextResponse.json(
//         { message: "Session has no email" },
//         { status: 401 }
//       );
//     }

//     const client = await clientPromise;
//     const db = client.db("novapay_db");
//     const usersCollection = db.collection("users");

//     const currentUser = await usersCollection.findOne({
//       email: session.user.email,
//     });

//     if (!currentUser) {
//       return NextResponse.json(
//         { message: "User not found in database" },
//         { status: 404 }
//       );
//     }

//     // 🔥 IMPORTANT FIX
//     // Case insensitive + fallback
//     const role = (currentUser.role || "").toLowerCase();

//     if (role !== "admin") {
//       return NextResponse.json(
//         { message: `Your role is '${currentUser.role}' (not Admin)` },
//         { status: 403 }
//       );
//     }

//     /* ========================= */

//     const totalUsers = await usersCollection.countDocuments();
//     const pendingKYC = await usersCollection.countDocuments({
//       kycStatus: "Pending",
//     });
//     const totalSubscribers = await usersCollection.countDocuments({
//       "subscription.active": true,
//       "subscription.expiresAt": { $gt: new Date().toISOString() },
//     });

//     const users = await usersCollection.find().toArray();

//     let totalTransactions = 0;
//     let totalRevenue = 0;
//     let subscriptionRevenue = 0;
//     let recentTransactions: any[] = [];
//     const monthlyMap: Record<number, number> = {};

//     users.forEach((user) => {
//       const history = user.history || [];

//       totalTransactions += history.length;

//       history.forEach((tx: any) => {
//         if (tx.status === "completed") {
//           totalRevenue += Number(tx.amount || 0);

//           if (tx.type === "subscription_income") {
//             subscriptionRevenue += Number(tx.amount || 0);
//           }

//           if (tx.date) {
//             const month = new Date(tx.date).getMonth();
//             monthlyMap[month] =
//               (monthlyMap[month] || 0) + Number(tx.amount || 0);
//           }
//         }

//         recentTransactions.push({
//           id: tx.transactionId || Math.random().toString(),
//           user: user.name || user.email,
//           amount: tx.amount || 0,
//           status: tx.status || "unknown",
//           date: tx.date
//             ? new Date(tx.date).toDateString()
//             : "",
//         });
//       });
//     });

//     recentTransactions.sort(
//       (a, b) =>
//         new Date(b.date).getTime() -
//         new Date(a.date).getTime()
//     );

//     const monthNames = [
//       "Jan","Feb","Mar","Apr","May","Jun",
//       "Jul","Aug","Sep","Oct","Nov","Dec"
//     ];

//     const revenue = Object.keys(monthlyMap).map((m) => ({
//       name: monthNames[Number(m)],
//       value: monthlyMap[Number(m)],
//     }));

//     return NextResponse.json({
//       stats: [
//         { title: "Total Users", value: totalUsers },
//         { title: "Total Revenue", value: totalRevenue },
//         { title: "Transactions", value: totalTransactions },
//         { title: "Pending KYC", value: pendingKYC },
//         { title: "Subscribers", value: totalSubscribers },
//         { title: "Subscription Revenue", value: subscriptionRevenue },
//       ],
//       revenue,
//       transactions: recentTransactions.slice(0, 5),
//     });

//   } catch (error) {
//     console.error("Admin Stats Error:", error);

//     return NextResponse.json(
//       { message: "Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 1. Session & Auth Check
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({
      email: session.user.email,
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Role Check (Case-Insensitive)
    const role = (currentUser.role || "").toLowerCase();
    if (role !== "admin") {
      return NextResponse.json(
        { message: `Access denied. Role: ${currentUser.role}` },
        { status: 403 },
      );
    }

    // 🔴 3. Fraud Check
    if (currentUser.accountStatus === "fraud") {
      return NextResponse.json(
        { message: "Admin account blocked due to suspicious activity." },
        { status: 403 },
      );
    }

    // 4. Aggregating Stats
    const totalUsers = await usersCollection.countDocuments();
    const pendingKYC = await usersCollection.countDocuments({
      kycStatus: "Pending",
    });

    // Subscriber logic with proper date handling
    const totalSubscribers = await usersCollection.countDocuments({
      "subscription.active": true,
      "subscription.expiresAt": { $gt: new Date().toISOString() },
    });

    const users = await usersCollection.find().toArray();

    let totalTransactions = 0;
    let totalRevenue = 0;
    let subscriptionRevenue = 0;
    let recentTransactions: any[] = [];
    const monthlyMap: Record<number, number> = {};

    users.forEach((user) => {
      const history = user.history || [];
      totalTransactions += history.length;

      history.forEach((tx: any) => {
        if (tx.status === "completed") {
          const amount = Number(tx.amount || 0);
          totalRevenue += amount;

          if (tx.type === "subscription_income") {
            subscriptionRevenue += amount;
          }

          if (tx.date) {
            const dateObj = new Date(tx.date);
            const month = dateObj.getMonth();
            monthlyMap[month] = (monthlyMap[month] || 0) + amount;
          }
        }

        recentTransactions.push({
          id: tx.transactionId || Math.random().toString(36).substr(2, 9),
          user: user.name || user.email,
          type: tx.type || "transaction",
          amount: tx.amount || 0,
          status: tx.status || "completed",
          date: tx.date ? new Date(tx.date).toLocaleDateString() : "N/A",
          rawDate: tx.date ? new Date(tx.date) : new Date(0), // for sorting
        });
      });
    });

    // 5. Sort transactions by date (Newest first)
    recentTransactions.sort(
      (a, b) => b.rawDate.getTime() - a.rawDate.getTime(),
    );

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenueChart = monthNames.map((name, index) => ({
      name,
      value: monthlyMap[index] || 0,
    }));

    return NextResponse.json({
      stats: [
        { title: "Total Users", value: totalUsers },
        { title: "Total Revenue", value: totalRevenue },
        { title: "Transactions", value: totalTransactions },
        { title: "Pending KYC", value: pendingKYC },
        { title: "Subscribers", value: totalSubscribers },
        { title: "Subscription Revenue", value: subscriptionRevenue },
      ],
      revenue: revenueChart,
      transactions: recentTransactions.slice(0, 5), // Only top 5
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
