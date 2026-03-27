"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  CreditCard,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  verifiedUsers: number;
};

type User = {
  kycStatus?: string;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    verifiedUsers: 0,
  });

  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // 🔥 Fetch analytics
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();

        // 🔥 Fetch users separately (to calculate verified users correctly)
        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();

        const users: User[] = userData?.users || [];

        // ✅ VERIFIED LOGIC (FINAL FIX)
        const verifiedCount = users.filter((u: any) => {
          const status =
            u.kycDetails?.kycStatus || u.kycStatus || u.status || "";

          const normalized = status.toLowerCase().trim();

          return normalized === "approved" || normalized === "accepted";
        }).length;

        setStats({
          totalUsers: data.stats.totalUsers,
          totalRevenue: data.stats.totalRevenue,
          totalTransactions: data.stats.totalTransactions,
          verifiedUsers: verifiedCount,
        });

        setUserGrowth(data.userGrowth || []);
        setRevenue(data.revenue || []);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      }
    };

    loadAnalytics();
  }, []);

  const cardAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Admin Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Deep insights into your platform 🚀
        </p>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            icon: <Users size={22} />,
            color: "from-blue-500 to-cyan-500",
          },
          {
            title: "Revenue",
            value: `$${stats.totalRevenue}`,
            icon: <DollarSign size={22} />,
            color: "from-green-500 to-emerald-400",
          },
          {
            title: "Transactions",
            value: stats.totalTransactions,
            icon: <CreditCard size={22} />,
            color: "from-purple-500 to-pink-500",
          },
          {
            title: "Verified Users",
            value: stats.verifiedUsers,
            icon: <ShieldCheck size={22} />,
            color: "from-yellow-500 to-orange-400",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl p-6 bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <h2 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                  {card.value}
                </h2>
              </div>

              <div
                className={`p-3 rounded-xl text-white bg-gradient-to-r ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
          <TrendingUp className="mb-3" />
          <h3 className="text-lg font-semibold">Growth Rate</h3>
          <p className="text-sm opacity-90 mt-1">
            Users increasing over time 📈
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg">
          <DollarSign className="mb-3" />
          <h3 className="text-lg font-semibold">Revenue Trend</h3>
          <p className="text-sm opacity-90 mt-1">
            Strong financial performance 💰
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
          <Users className="mb-3" />
          <h3 className="text-lg font-semibold">User Activity</h3>
          <p className="text-sm opacity-90 mt-1">
            Active users are engaging 🔥
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* USER GROWTH */}

        <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200">
            User Growth
          </h3>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                {/* 🌈 Gradient */}
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />

                {/* ✨ Better Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0c1a2b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                  cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                />

                {/* 🌊 Area Fill */}
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="url(#lineStroke)"
                  strokeWidth={4}
                  fill="url(#userGradient)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE */}

        <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Monthly Revenue
          </h3>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                {/* 🌈 Gradient */}
                <defs>
                  <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                </defs>

                {/* 🔥 Clean Grid */}
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />

                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />

                {/* ✨ Modern Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0c1a2b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`$${value}`, "Revenue"]}
                />

                {/* 🌊 Line + Area */}
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueLine)"
                  strokeWidth={4}
                  fill="url(#revenueArea)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
