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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Users, DollarSign, CreditCard, ShieldCheck } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  verifiedUsers: number;
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
  const [kycData, setKycData] = useState<any[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();

        setStats(data.stats);
        setUserGrowth(data.userGrowth);
        setRevenue(data.revenue);
        setKycData(data.kyc);
      } catch (err) {
        console.error("Analytics fetch failed");
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

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="space-y-10">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Admin Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of platform performance
        </p>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            icon: <Users size={24} />,
            color: "from-blue-500 to-blue-400",
          },
          {
            title: "Revenue",
            value: `$${stats.totalRevenue}`,
            icon: <DollarSign size={24} />,
            color: "from-green-500 to-green-400",
          },
          {
            title: "Transactions",
            value: stats.totalTransactions,
            icon: <CreditCard size={24} />,
            color: "from-purple-500 to-purple-400",
          },
          {
            title: "Verified Users",
            value: stats.verifiedUsers,
            icon: <ShieldCheck size={24} />,
            color: "from-yellow-500 to-yellow-400",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {card.value}
                </h2>
              </div>

              <div
                className={`p-3 rounded-lg text-white bg-gradient-to-r ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* USER GROWTH */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow"
        >
          <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200">
            User Growth
          </h3>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* REVENUE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow"
        >
          <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Monthly Revenue
          </h3>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* KYC STATUS */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow"
      >
        <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200">
          KYC Status Distribution
        </h3>

        <div className="h-[320px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={kycData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {kycData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
