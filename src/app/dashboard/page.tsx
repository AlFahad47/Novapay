"use client";

import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";

type Role = "User" | "Agent" | "Admin";

/* ---------------- ROLE-BASED QUICK ACTIONS ---------------- */

const actionsByRole: Record<Role, { label: string; icon: React.ReactNode; href?: string }[]> =
  {
    User: [
      { label: "Apply for Loan", icon: <DollarSign size={18} /> },
      { label: "Upload Documents", icon: <CreditCard size={18} /> },
      { label: "Track Application", icon: <Activity size={18} /> },
      { label: "Contact Support", icon: <MessageSquare size={18} />, href: "/chat/support" },
    ],
    Agent: [
      { label: "Verify KYC", icon: <Users size={18} /> },
      { label: "Review Applications", icon: <Activity size={18} /> },
      { label: "Contact Client", icon: <Users size={18} /> },
    ],
    Admin: [
      { label: "Add New User", icon: <Users size={18} /> },
      { label: "Manage Agents", icon: <Users size={18} /> },
      { label: "Generate Report", icon: <DollarSign size={18} /> },
    ],
  };

export default function DashboardHome() {
  // 🔥 Change this later dynamically from auth/session
  const role: Role = "User";

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---------------- Welcome Section ---------------- */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
        <p className="opacity-90">
          Here’s what’s happening with your platform today.
        </p>
      </motion.div>

      {/* ---------------- Stats Cards ---------------- */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <StatCard
          title="Total Users"
          value="12,450"
          icon={<Users size={22} />}
          growth="+12%"
        />
        <StatCard
          title="Total Revenue"
          value="$84,300"
          icon={<DollarSign size={22} />}
          growth="+18%"
        />
        <StatCard
          title="Transactions"
          value="1,245"
          icon={<CreditCard size={22} />}
          growth="+5%"
        />
        <StatCard
          title="Active Sessions"
          value="342"
          icon={<Activity size={22} />}
          growth="+3%"
        />
      </motion.div>

      {/* ---------------- Quick Actions ---------------- */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
          Quick Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {actionsByRole[role].map((action) => (
            <QuickButton
              key={action.label}
              label={action.label}
              icon={action.icon}
              href={action.href}
            />
          ))}
        </div>
      </motion.div>

      {/* ---------------- Recent Activity ---------------- */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
          Recent Activity
        </h2>

        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <ActivityItem text="New user registered" time="2 minutes ago" />
          <ActivityItem text="Transaction completed" time="10 minutes ago" />
          <ActivityItem text="KYC verified successfully" time="1 hour ago" />
          <ActivityItem text="New admin added" time="3 hours ago" />
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  title,
  value,
  icon,
  growth,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  growth: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-blue-800 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 dark:bg-[#0070ff]/20 rounded-xl text-blue-600 dark:text-[#00b4ff]">
          {icon}
        </div>
        <span className="text-sm text-blue-600 dark:text-[#00b4ff] font-medium flex items-center gap-1">
          {growth}
          <ArrowUpRight size={14} />
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 dark:text-blue-100">
        {value}
      </h3>
      <p className="text-sm text-gray-500 dark:text-blue-100/60 mt-1">
        {title}
      </p>
    </motion.div>
  );
}

function QuickButton({
  label,
  icon,
  href,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const className = "flex items-center justify-center gap-2 bg-gray-100 dark:bg-blue-900/40 hover:bg-[#0095ff] hover:text-white transition px-5 py-3 rounded-xl font-medium text-gray-700 dark:text-blue-200";

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
        <Link href={href} className={className}>
          {icon}
          {label}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center border-b border-gray-200 dark:border-blue-900 pb-3"
    >
      <span className="text-gray-700 dark:text-blue-100">{text}</span>
      <span className="text-sm text-gray-500 dark:text-blue-100/60">
        {time}
      </span>
    </motion.li>
  );
}
