"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

/* ---------------- Animated Counter ---------------- */

function Counter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.floor(latest).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    growth: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------- Fetch Analytics Data -------- */

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/user/analytics");
        const data = await res.json();

        setStats({
          revenue: data.totalRevenue || 0,
          expenses: data.totalExpenses || 0,
          profit: data.netProfit || 0,
          growth: data.growthRate || 0,
        });

        setRevenueData(data.monthlyRevenue || []);
        setTransactionData(data.transactions || []);
      } catch (error) {
        console.error("Analytics fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchAnalytics();
  }, [session]);

  return (
    <div className="relative space-y-10 overflow-hidden">
      {/* Floating Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-10 left-10"
        />
        <motion.div
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl bottom-10 right-10"
        />
      </div>

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>

        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
          Visual insights into your financial performance
        </p>
      </motion.div>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: stats.revenue },
          { label: "Total Expenses", value: stats.expenses },
          { label: "Net Profit", value: stats.profit },
          { label: "Growth Rate", value: stats.growth },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-6 rounded-2xl 
            bg-white/60 dark:bg-[#0c1a2b]/80
            backdrop-blur-xl
            border border-blue-200 dark:border-blue-900
            shadow-xl overflow-hidden"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {card.label}
            </p>

            <h2 className="text-3xl font-bold text-blue-900 dark:text-white mt-2">
              {card.label === "Growth Rate" ? (
                <>
                  +<Counter value={card.value} />%
                </>
              ) : (
                <>
                  $<Counter value={card.value} />
                </>
              )}
            </h2>

            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            />
          </motion.div>
        ))}
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-white/70 dark:bg-[#0c1a2b]/80 backdrop-blur-xl border border-blue-200 dark:border-blue-900 shadow-xl h-80"
        >
          <h3 className="mb-4 font-semibold text-blue-900 dark:text-white">
            Monthly Revenue
          </h3>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-white/70 dark:bg-[#0c1a2b]/80 backdrop-blur-xl border border-blue-200 dark:border-blue-900 shadow-xl h-80"
        >
          <h3 className="mb-4 font-semibold text-blue-900 dark:text-white">
            Income vs Expense
          </h3>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Area Chart */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/70 dark:bg-[#0c1a2b]/80 backdrop-blur-xl border border-blue-200 dark:border-blue-900 shadow-xl h-96"
      >
        <h3 className="mb-4 font-semibold text-blue-900 dark:text-white">
          Revenue Growth Trend
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
