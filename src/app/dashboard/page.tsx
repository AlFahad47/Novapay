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
import { CreditCard, Bell, Clock, Edit } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Account Summary
        </h2>

        {loadingData ? (
          <p className="text-gray-500 text-sm">Loading account data...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <SummaryCard
              title="Wallet Balance"
              value={`$${balance}`}
              icon={<CreditCard size={20} />}
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