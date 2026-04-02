"use client";

import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import T from "@/components/T";
import { formatAmount } from "@/lib/utils";

type Role = "User" | "Agent" | "Admin";

export default function DashboardHome({ role }: { role: Role }) {
  const { data: session } = useSession();

  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const name = role === "Admin" ? "Admin" : session?.user?.name || "User";

  // Dynamic Greeting
  const hour = new Date().getHours();
  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning ☀️";
  else if (hour < 18) greeting = "Good Afternoon 🌤";
  else greeting = "Good Evening 🌙";

  /* ---------------- FETCH ADMIN STATS ---------------- */

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();

        setStats(data.stats || []);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const icons = [Users, DollarSign, CreditCard, Activity];

  // Determine if a stat value is monetary (Revenue-related)
  const isMonetaryStat = (title: string): boolean => {
    return title.toLowerCase().includes("revenue");
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}

      <div className="bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          <T>{greeting}</T>, {name} 👋
        </h1>

        <p className="mt-2 text-sm text-blue-100">
          <T>Here's what's happening in your dashboard today.</T>
        </p>
      </div>

      {/* Stats */}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400"><T>Loading stats...</T></p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = icons[index] || Activity;
            const displayValue = isMonetaryStat(stat.title)
              ? formatAmount(stat.value)
              : stat.value.toLocaleString();

            return (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={displayValue}
                icon={<Icon />}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="
      bg-white 
      dark:bg-[#0c1a2b]
      border border-gray-200 
      dark:border-gray-800
      p-6 
      rounded-2xl 
      shadow-sm
      hover:shadow-lg
      transition-all
      "
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>

        <ArrowUpRight size={16} className="text-gray-400 dark:text-gray-500" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><T>{title}</T></p>
    </motion.div>
  );
}
