"use client";

import { useSession } from "next-auth/react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import T from "@/components/T";

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

type User = {
  name: string;
  email: string;
  image?: string;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<Stat[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();

        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();

        setStats(data.stats || []);
        setRevenue(data.revenue || []);
        setTransactions(data.transactions || []);
        setUsers(userData.users || []);
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
        <p className="text-gray-600 dark:text-gray-300"><T>Loading dashboard...</T></p>
      </div>
    );
  }

  const role = session?.user?.role ?? "User";

  const getUserInfo = (txUser: string) => {
    return users.find((u) => u.email === txUser || u.name === txUser);
  };

  return (
    <div className="space-y-8 w-full">
      <DashboardHome role={role as "Admin"} />

      {/* ✅ FIXED Monthly Revenue */}
      <div className="bg-white dark:bg-[#0c1a2b] p-4 sm:p-6 lg:p-8 rounded-xl shadow border border-gray-200 dark:border-gray-700 w-full">
        <h3 className="font-semibold mb-6 text-gray-800 dark:text-gray-200 text-lg">
          <T>Monthly Revenue</T>
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
          <T>Recent Transactions</T>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-gray-600 dark:text-gray-400">
                <th className="py-3 text-left"><T>User</T></th>
                <th className="text-left"><T>Amount</T></th>
                <th className="text-left"><T>Status</T></th>
                <th className="text-left"><T>Date</T></th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => {
                const user = getUserInfo(tx.user);

                return (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setIsOpen(true);
                    }}
                    className="cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111c2d]"
                  >
                    <td className="py-3 flex items-center gap-3">
                      {user?.image ? (
                        <img
                          src={user.image}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                          {(user?.name || tx.user).charAt(0)}
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {user?.name || tx.user}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </td>

                    <td className="font-semibold">${tx.amount}</td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td>{tx.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              <T>No transactions yet</T>
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && selectedTx && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl w-[90%] max-w-md"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            >
              <h2 className="text-xl font-bold mb-4"><T>Transaction Details</T></h2>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>User:</strong> {selectedTx.user}
                </p>
                <p>
                  <strong>Amount:</strong> ${selectedTx.amount}
                </p>
                <p>
                  <strong>Status:</strong> {selectedTx.status}
                </p>
                <p>
                  <strong>Date:</strong> {selectedTx.date}
                </p>
                <p>
                  <strong>ID:</strong> {selectedTx.id}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl"
              >
                <T>Close</T>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
