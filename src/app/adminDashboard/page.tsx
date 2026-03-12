"use client";

import { useSession } from "next-auth/react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Stat = {
  title: string;
  value: number;
};

type Transaction = {
  id: string;
  user: string;
  amount: number;
  status: string;
  date: string;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<Stat[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();

        setStats(data.stats || []);
        setRevenue(data.revenue || []);
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  const role = session?.user?.role ?? "User";

  return (
    <div className="space-y-8 w-full">
      {/* Dashboard Home */}
      <DashboardHome role={role as "Admin"} />

      {/* Chart */}

      <div className="bg-white dark:bg-[#0c1a2b] p-4 sm:p-6 lg:p-8 rounded-xl shadow border border-gray-200 dark:border-gray-700 w-full">
        <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200 text-lg">
          Monthly Revenue
        </h3>

        <div className="w-full h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenue}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              {/* Gradient */}

              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.4} />
                </linearGradient>
              </defs>

              {/* Grid */}

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-slate-500"
              />

              {/* X Axis */}

              <XAxis
                dataKey="name"
                tick={{ fill: "#475569", fontSize: 12 }}
                className="dark:fill-slate-400"
                axisLine={false}
                tickLine={false}
              />

              {/* Y Axis */}

              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                className="dark:fill-slate-400"
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}

              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.1)" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  color: "#111827",
                  fontSize: "13px",
                }}
                wrapperClassName="dark:[&>div]:!bg-slate-900 dark:[&>div]:!text-white dark:[&>div]:!border-slate-700"
                labelStyle={{ color: "#6b7280" }}
              />

              {/* Bars */}

              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[10, 10, 0, 0]}
                barSize={35}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}

      <div className="bg-white dark:bg-[#0c1a2b] p-4 sm:p-6 lg:p-8 rounded-xl shadow border border-gray-200 dark:border-gray-700 w-full">
        <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200 text-lg">
          Recent Transactions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-gray-600 dark:text-gray-400">
                <th className="py-3 text-left">User</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status</th>
                <th className="text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111c2d]"
                >
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {tx.user}
                  </td>

                  <td className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    ${tx.amount}
                  </td>

                  <td className="whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                ${
                  tx.status === "completed"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  <td className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {tx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">
              No transactions yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
