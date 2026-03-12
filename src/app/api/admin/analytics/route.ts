import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = db.collection("users");
    const transactions = db.collection("transactions");
    const kyc = db.collection("kyc");

    const totalUsers = await users.countDocuments();
    const totalTransactions = await transactions.countDocuments();

    const totalRevenueAgg = await transactions
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$amount" } },
          },
        },
      ])
      .toArray();

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const verifiedUsers = await kyc.countDocuments({ status: "approved" });

    /* USER GROWTH */

    const usersByMonth = await users
      .aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            users: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const months = [
      "",
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

    const userGrowth = usersByMonth.map((u) => ({
      name: months[u._id],
      users: u.users,
    }));

    /* MONTHLY REVENUE */

    const revenueByMonth = await transactions
      .aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: { $toDouble: "$amount" } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const revenue = revenueByMonth.map((r) => ({
      name: months[r._id],
      revenue: r.revenue,
    }));

    /* KYC STATUS */

    const approved = await kyc.countDocuments({ status: "approved" });
    const pending = await kyc.countDocuments({ status: "pending" });
    const rejected = await kyc.countDocuments({ status: "rejected" });

    const kycData = [
      { name: "Approved", value: approved },
      { name: "Pending", value: pending },
      { name: "Rejected", value: rejected },
    ];

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRevenue,
        totalTransactions,
        verifiedUsers,
      },
      userGrowth,
      revenue,
      kyc: kycData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analytics error" }, { status: 500 });
  }
}
