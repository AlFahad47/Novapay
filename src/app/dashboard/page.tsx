"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { CreditCard, Bell, Clock, Activity, DollarSign } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loanLimit, setLoanLimit] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    role: "",
  });

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "User",
      });
    }
  }, [session]);

  const fetchDashboard = async () => {
    try {
      setLoadingData(true);

      const res = await fetch("/api/user/dashboard");
      const data = await res.json();

      setBalance(data.balance || 0);
      setLoanLimit(data.loanLimit || 0);
      setPending(data.pendingRequests || 0);
      setNotifications(data.notifications || 0);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Failed loading dashboard data", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (session) fetchDashboard();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  const role =
    session?.user?.role === "Admin"
      ? "Admin"
      : session?.user?.role === "Agent"
        ? "Agent"
        : "User";

  const calculateLimit = async () => {
    setIsCalculating(true);

    Swal.fire({
      title: "AI is analyzing...",
      text: "Evaluating your transaction history for the best limit.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/loan/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });

      const data = await res.json();

      if (data.limit !== undefined) {
        setLoanLimit(data.limit);
        Swal.fire({
          icon: "success",
          title: "Limit Updated!",
          text: `Based on your usage, your new limit is ${data.limit} BDT.`,
          footer: `Reason: ${
            data.reason || "High trust score based on account activity"
          }`,
        });
      }
    } catch (err) {
      Swal.fire("Error", "Could not calculate limit at this time.", "error");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHome role={role} />

      {/* Modern Profile Card */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 text-[120px] pr-6 pt-2">
          💳
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Image
              src={profile.image || "/dashboard.jfif"}
              alt="profile"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-md object-cover"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-sm opacity-90">{profile.email}</p>

            <span className="mt-2 inline-block text-xs bg-white/20 px-3 py-1 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Overview
          </h2>

          <button
            onClick={calculateLimit}
            disabled={isCalculating}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <Activity size={14} />
            {isCalculating ? "Analyzing..." : "Refresh AI Limit"}
          </button>
        </div>

        {loadingData ? (
          <p className="text-gray-500 text-sm">Loading account data...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Wallet Balance"
              value={`$${balance}`}
              icon={<CreditCard size={20} />}
            />

            <SummaryCard
              title="AI Loan Limit"
              value={loanLimit !== null ? `${loanLimit} BDT` : "Not calculated"}
              icon={<DollarSign size={20} />}
            />

            <SummaryCard
              title="Pending Requests"
              value={pending}
              icon={<Clock size={20} />}
            />

            <SummaryCard
              title="Notifications"
              value={notifications}
              icon={<Bell size={20} />}
            />
          </div>
        )}
      </div>

      {/* Quick Insights Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20">
          <p className="text-sm text-gray-500">Spending Trend</p>
          <p className="text-lg font-semibold">Stable</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20">
          <p className="text-sm text-gray-500">Risk Score</p>
          <p className="text-lg font-semibold">Low</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20">
          <p className="text-sm text-gray-500">Account Status</p>
          <p className="text-lg font-semibold">Active</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Transactions
        </h2>

        {loadingData ? (
          <p className="text-gray-500 text-sm">Loading transactions...</p>
        ) : (
          <ul className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions found</p>
            ) : (
              transactions.map((tx, i) => (
                <TransactionItem
                  key={i}
                  name={tx.name}
                  amount={tx.amount}
                  time={tx.time}
                />
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }: any) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function TransactionItem({ name, amount, time }: any) {
  return (
    <li className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2 text-sm">
      <span className="text-gray-700 dark:text-gray-200">{name}</span>

      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-white">{amount}</p>
        <p className="text-gray-500 text-xs">{time}</p>
      </div>
    </li>
  );
}
