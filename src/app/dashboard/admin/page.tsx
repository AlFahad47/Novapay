

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import UserRequestsSection from "@/components/admin/UserRequestsSection";

type Stat = {
  title: string;
  value: number;
};

type Revenue = {
  name: string;
  value: number;
};

type Transaction = {
  id: string;
  user: string;
  amount: number;
  status: string;
  date: string;
};

export default function Admin() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/stats");

        if (!res.ok) {
          setError("You are not authorized to view this page.");
          setStats([]);
          setRevenue([]);
          setTransactions([]);
          return;
        }

        const data = await res.json();

        setStats(Array.isArray(data.stats) ? data.stats : []);
        setRevenue(Array.isArray(data.revenue) ? data.revenue : []);
        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : []
        );
      } catch (err) {
        console.error("Admin fetch error:", err);
        setError("Something went wrong while loading admin data.");
        setStats([]);
        setRevenue([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] text-gray-800 dark:text-blue-100 transition-colors duration-500">
      <main className="p-8 grid gap-8 max-w-7xl mx-auto">

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.length > 0 ? (
            stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow"
              >
                <p className="text-sm text-gray-500 dark:text-blue-100/60">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                  {Number(stat.value || 0).toLocaleString()}
                </h3>
              </motion.div>
            ))
          ) : (
            <p>No stats available.</p>
          )}
        </section>

        {/* CHART */}
        <section className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
            Revenue Analytics
          </h4>

          <div className="h-[300px]">
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue}>
                  <CartesianGrid stroke="rgba(0,157,255,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0095ff"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No revenue data available.</p>
            )}
          </div>
        </section>

        {/* TRANSACTIONS */}
        <section className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
            Recent Transactions
          </h4>

          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-blue-800">
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-200 dark:border-blue-900"
                    >
                      <td className="py-3">{tx.user}</td>
                      <td className="py-3">${Number(tx.amount || 0)}</td>
                      <td className="py-3">{tx.status}</td>
                      <td className="py-3">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No recent transactions.</p>
            )}
          </div>
        </section>

        {/* KYC SECTION */}
        <section className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow">
          <UserRequestsSection />
        </section>

      </main>
    </div>
  );
}