"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import {
  CreditCard,
  Bell,
  Clock,
  Edit,
  Activity,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loanLimit, setLoanLimit] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  /* Profile State */
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    role: "",
  });

  const user = session?.user;

  /* Sync session → profile */

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

  /* -------- Fetch Dashboard Data -------- */

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

  /* -------- AI Loan Calculation -------- */
  const calculateLimit = async () => {
    setIsCalculating(true);

    // Show a "Processing" toast
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
        // Ensure you are using data.reason here!
        Swal.fire({
          icon: "success",
          title: "Limit Updated!",
          text: `Based on your usage, your new limit is ${data.limit} BDT.`,
          footer: `Reason: ${data.reason || "High trust score based on account activity"}`,
        });
      }
    } catch (err) {
      Swal.fire("Error", "Could not calculate limit at this time.", "error");
    } finally {
      setIsCalculating(false);
    }
  };
  /* -------- Edit Profile -------- */

  const editProfile = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Profile",
      html: `
        <input id="name" class="swal2-input" placeholder="Name" value="${profile.name}">
        <input id="email" class="swal2-input" placeholder="Email" value="${profile.email}">
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: () => {
        return {
          name: (document.getElementById("name") as HTMLInputElement).value,
          email: (document.getElementById("email") as HTMLInputElement).value,
        };
      },
    });

    if (formValues) {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Updated!", "Profile updated successfully", "success");

        /* update session */
        await update();

        /* update UI instantly */
        setProfile({
          name: formValues.name,
          email: formValues.email,
          image: profile.image,
          role: profile.role,
        });

        /* refresh dashboard */
        fetchDashboard();
      } else {
        Swal.fire("Error", "Profile update failed", "error");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Dashboard */}
      <DashboardHome role={role} />

      {/* User Profile */}

      <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={profile.image || "/dashboard.jfif"}
              alt="profile"
              width={70}
              height={70}
              className="rounded-full object-cover"
            />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.name}
              </h2>

              <p className="text-sm text-gray-500">{profile.email}</p>

              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-md mt-1 inline-block">
                {profile.role || "User"}
              </span>
            </div>
          </div>

          <button
            onClick={editProfile}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Account Summary */}

      <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Summary
          </h2>
          {/* AI Trigger Button */}
          <button
            onClick={calculateLimit}
            disabled={isCalculating}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
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

            {/* NEW AI LOAN CARD */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/20 p-4 rounded-xl flex items-center gap-4 border border-blue-100 dark:border-blue-900/50">
              <div className="text-indigo-600 dark:text-indigo-400">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI Loan Limit
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {/* Use !== null to allow 0 to show up properly */}
                  {loanLimit !== null ? `${loanLimit} BDT` : "Calculate Now"}
                </p>
              </div>
            </div>

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
      {/* Recent Transactions */}

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

/* Summary Card */

function SummaryCard({ title, value, icon }: any) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4">
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

/* Transaction Item */

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
