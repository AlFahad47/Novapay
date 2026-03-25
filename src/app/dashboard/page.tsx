// "use client";

// import {
//   Users,
//   CreditCard,
//   DollarSign,
//   Activity,
//   ArrowUpRight,
//   MessageSquare,
// } from "lucide-react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import React from "react";

// type Role = "User" | "Agent" | "Admin";

// /* ---------------- ROLE-BASED QUICK ACTIONS ---------------- */

// const actionsByRole: Record<Role, { label: string; icon: React.ReactNode; href?: string }[]> =
//   {
//     User: [
//       { label: "Apply for Loan", icon: <DollarSign size={18} /> },
//       { label: "Upload Documents", icon: <CreditCard size={18} /> },
//       { label: "Track Application", icon: <Activity size={18} /> },
//       { label: "Contact Support", icon: <MessageSquare size={18} />, href: "/chat/support" },
//     ],
//     Agent: [
//       { label: "Verify KYC", icon: <Users size={18} /> },
//       { label: "Review Applications", icon: <Activity size={18} /> },
//       { label: "Contact Client", icon: <Users size={18} /> },
//     ],
//     Admin: [
//       { label: "Add New User", icon: <Users size={18} /> },
//       { label: "Manage Agents", icon: <Users size={18} /> },
//       { label: "Generate Report", icon: <DollarSign size={18} /> },
//     ],
//   };

// export default function DashboardHome() {
//   // 🔥 Change this later dynamically from auth/session
//   const role: Role = "User";

//   return (
//     <motion.div
//       className="space-y-8"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//     >
//       {/* ---------------- Welcome Section ---------------- */}
//       <motion.div
//         initial={{ y: 30, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.6 }}
//         className="bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white p-8 rounded-2xl shadow-lg"
//       >
//         <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
//         <p className="opacity-90">
//           Here’s what’s happening with your platform today.
//         </p>
//       </motion.div>

//       {/* ---------------- Stats Cards ---------------- */}
//       <motion.div
//         className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
//         initial="hidden"
//         animate="visible"
//         variants={{
//           hidden: {},
//           visible: {
//             transition: {
//               staggerChildren: 0.15,
//             },
//           },
//         }}
//       >
//         <StatCard
//           title="Total Users"
//           value="12,450"
//           icon={<Users size={22} />}
//           growth="+12%"
//         />
//         <StatCard
//           title="Total Revenue"
//           value="$84,300"
//           icon={<DollarSign size={22} />}
//           growth="+18%"
//         />
//         <StatCard
//           title="Transactions"
//           value="1,245"
//           icon={<CreditCard size={22} />}
//           growth="+5%"
//         />
//         <StatCard
//           title="Active Sessions"
//           value="342"
//           icon={<Activity size={22} />}
//           growth="+3%"
//         />
//       </motion.div>

//       {/* ---------------- Quick Actions ---------------- */}
//       <motion.div
//         initial={{ y: 30, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.3 }}
//         className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800"
//       >
//         <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
//           Quick Actions
//         </h2>

//         <div className="grid gap-4 md:grid-cols-3">
//           {actionsByRole[role].map((action) => (
//             <QuickButton
//               key={action.label}
//               label={action.label}
//               icon={action.icon}
//               href={action.href}
//             />
//           ))}
//         </div>
//       </motion.div>

//       {/* ---------------- Recent Activity ---------------- */}
//       <motion.div
//         initial={{ y: 30, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.4 }}
//         className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800"
//       >
//         <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-blue-300">
//           Recent Activity
//         </h2>

//         <motion.ul
//           className="space-y-4"
//           initial="hidden"
//           animate="visible"
//           variants={{
//             hidden: {},
//             visible: {
//               transition: {
//                 staggerChildren: 0.1,
//               },
//             },
//           }}
//         >
//           <ActivityItem text="New user registered" time="2 minutes ago" />
//           <ActivityItem text="Transaction completed" time="10 minutes ago" />
//           <ActivityItem text="KYC verified successfully" time="1 hour ago" />
//           <ActivityItem text="New admin added" time="3 hours ago" />
//         </motion.ul>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ---------------- Components ---------------- */

// function StatCard({
//   title,
//   value,
//   icon,
//   growth,
// }: {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
//   growth: string;
// }) {
//   return (
//     <motion.div
//       variants={{
//         hidden: { y: 20, opacity: 0 },
//         visible: { y: 0, opacity: 1 },
//       }}
//       whileHover={{ y: -5 }}
//       transition={{ duration: 0.4 }}
//       className="bg-white dark:bg-[#0c1a2b] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-blue-800 hover:shadow-md transition"
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div className="p-3 bg-blue-100 dark:bg-[#0070ff]/20 rounded-xl text-blue-600 dark:text-[#00b4ff]">
//           {icon}
//         </div>
//         <span className="text-sm text-blue-600 dark:text-[#00b4ff] font-medium flex items-center gap-1">
//           {growth}
//           <ArrowUpRight size={14} />
//         </span>
//       </div>

//       <h3 className="text-2xl font-bold text-gray-800 dark:text-blue-100">
//         {value}
//       </h3>
//       <p className="text-sm text-gray-500 dark:text-blue-100/60 mt-1">
//         {title}
//       </p>
//     </motion.div>
//   );
// }

// function QuickButton({
//   label,
//   icon,
//   href,
// }: {
//   label: string;
//   icon: React.ReactNode;
//   href?: string;
// }) {
//   const className = "flex items-center justify-center gap-2 bg-gray-100 dark:bg-blue-900/40 hover:bg-[#0095ff] hover:text-white transition px-5 py-3 rounded-xl font-medium text-gray-700 dark:text-blue-200";

//   if (href) {
//     return (
//       <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
//         <Link href={href} className={className}>
//           {icon}
//           {label}
//         </Link>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.button
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       transition={{ duration: 0.2 }}
//       className={className}
//     >
//       {icon}
//       {label}
//     </motion.button>
//   );
// }

// function ActivityItem({ text, time }: { text: string; time: string }) {
//   return (
//     <motion.li
//       variants={{
//         hidden: { opacity: 0, x: -20 },
//         visible: { opacity: 1, x: 0 },
//       }}
//       transition={{ duration: 0.3 }}
//       className="flex justify-between items-center border-b border-gray-200 dark:border-blue-900 pb-3"
//     >
//       <span className="text-gray-700 dark:text-blue-100">{text}</span>
//       <span className="text-sm text-gray-500 dark:text-blue-100/60">
//         {time}
//       </span>
//     </motion.li>
//   );
// }




"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { CreditCard, Bell, Clock, Edit, Activity, DollarSign,Info } from "lucide-react";
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
const [limitReason, setLimitReason] = useState<string | null>(null); 
const [activeLoan, setActiveLoan] = useState<any>(null);

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
      setActiveLoan(data.activeLoan || null)
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
    footer: `Reason: ${data.reason || "High trust score based on account activity"}` 
  });
}
  } catch (err) {
    Swal.fire("Error", "Could not calculate limit at this time.", "error");
  } finally {
    setIsCalculating(false);
  }
};
  /* -------- Edit Profile -------- */


const handleApplyLoan = async () => {
  const { value: amount } = await Swal.fire({
    title: "Instant AI Loan",
    text: `Apply for up to ${loanLimit} BDT instantly.`,
    input: "number",
    inputAttributes: { min: "100", max: String(loanLimit), step: "100" },
    showCancelButton: true,
    confirmButtonText: "Get Funds Now",
    confirmButtonColor: "#4f46e5",
  });

  if (amount) {
    Swal.fire({ title: "Sending funds...", didOpen: () => Swal.showLoading() });

    const res = await fetch("/api/loan/apply", {
      method: "POST",
      body: JSON.stringify({ email: profile.email, amount }),
    });

    const data = await res.json();
    if (data.success) {
      Swal.fire("Success!", "Money has been added to your wallet.", "success");
      fetchDashboard(); // Refresh balance and limit
    } else {
      Swal.fire("Error", data.error, "error");
    }
  }
};

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
    
    {/* 1. First Card: Wallet Balance */}
    <SummaryCard
      title="Wallet Balance"
      value={`$${balance}`}
      icon={<CreditCard size={20} />}
    />

    {/* 2. SECOND CARD:  */}
    {/* 2. SECOND CARD: AI LOAN CARD WITH DEBT PROTECTION */}
<div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm">
  <div className="flex justify-between items-start mb-4">
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Credit Line</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {loanLimit ?? 0} BDT
      </h3>
    </div>
    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
      <DollarSign className="text-indigo-600 dark:text-indigo-400" size={24} />
    </div>
  </div>
  
  {/* NEW DYNAMIC BUTTON LOGIC */}
  {loanLimit && loanLimit > 0 ? (
    <button
      onClick={handleApplyLoan}
      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer"
    >
      Get Instant Loan
    </button>
  ) : (
    <div className="w-full py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium text-center rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center justify-center gap-2">
      <Info size={14} />
      {limitReason || "Repay current loan to unlock limits."}
    </div>
  )}
  
  {limitReason && loanLimit && loanLimit > 0 && (
    <p className="mt-3 text-[10px] text-gray-400 italic text-center leading-tight">
      *AI Suggestion: {limitReason.substring(0, 60)}...
    </p>
  )}
</div>

    {/* 3. Third Card: Pending Requests */}
    <SummaryCard
      title="Pending Requests"
      value={pending}
      icon={<Clock size={20} />}
    />

    {/* 4. Fourth Card: Notifications */}
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
              <p className="text-gray-500 text-sm">
                No transactions found
              </p>
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
{activeLoan && (
  <div className="bg-white dark:bg-[#0c1a2b] border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Clock className="text-indigo-500" size={18} /> Active Loan Details
      </h3>
      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">
        Auto-Cut Active
      </span>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Remaining Debt:</span>
        <span className="font-bold text-indigo-600">{activeLoan.remainingAmount.toFixed(2)} BDT</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all" 
          style={{ width: `${((activeLoan.totalPayable - activeLoan.remainingAmount) / activeLoan.totalPayable) * 100}%` }}
        />
      </div>

      <p className="text-[10px] text-gray-400">
        Next Auto-Cut: {new Date(activeLoan.nextInstallmentDate).toLocaleDateString()} ({activeLoan.monthlyInstallment.toFixed(2)} BDT)
      </p>

      <button
        onClick={() => handleInstantRepay(activeLoan._id)}
        className="w-full mt-2 py-2 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition active:scale-95"
      >
        Pay Full Amount Instantly
      </button>
    </div>
  </div>
)}
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