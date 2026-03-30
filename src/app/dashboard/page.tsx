"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { CreditCard, Bell, Clock, Edit, Activity, DollarSign,Info } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import T from "@/components/T";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
const [loanLimit, setLoanLimit] = useState<number | null>(null);
const [isCalculating, setIsCalculating] = useState(false);
const [limitReason, setLimitReason] = useState<string | null>(null); 
const [activeLoan, setActiveLoan] = useState<any>(null);

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
        <T>Loading dashboard...</T>
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

const handleInstantRepay = async (loanId: string) => {
  const result = await Swal.fire({
    title: "Confirm Full Repayment?",
    text: "This will deduct the entire remaining balance from your wallet.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Pay Now",
    confirmButtonColor: "#4f46e5"
  });

  if (result.isConfirmed) {
    Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading() });

    const res = await fetch("/api/loan/repay", {
      method: "POST",
      body: JSON.stringify({ email: profile.email, loanId }),
    });

    const data = await res.json();
    if (data.success) {
      // 1. Show success message
      await Swal.fire("Paid!", "Your loan is cleared. AI is now recalculating your new limit...", "success");
      
      // 2. Refresh basic dashboard data (balance, etc.)
      await fetchDashboard();

      // 3. AUTO-TRIGGER AI REFRESH
      // This calls your existing AI route to unlock the BDT limit automatically
      calculateLimit(); 
      
    } else {
      Swal.fire("Error", data.error, "error");
    }
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
            Account Summary
          </h2>
          <button 
            onClick={calculateLimit}
            disabled={isCalculating}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Activity size={14} />
            <T>{isCalculating ? "Analyzing..." : "Refresh AI Limit"}</T>
          </button>
        </div>

        {loadingData ? (
          <p className="text-gray-500 text-sm">Loading account data...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"> 
            <SummaryCard title="Wallet Balance" value={`$${balance}`} icon={<CreditCard size={20} />} />

            {/* AI LOAN CARD */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider"><T>AI Credit Line</T></p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loanLimit ?? 0} BDT</h3>
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <DollarSign className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
              </div>
              
            {isCalculating ? (
  /* 0. LOADING STATE: Shown while AI is processing */
  <div className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[11px] font-bold text-center rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2">
    <Activity size={14} className="animate-spin" />
    AI is analyzing your profile...
  </div>
) : loanLimit === null ? (
  /* 1. FRESH STATE: No limit calculated yet / Just repaid */
  <button
    onClick={calculateLimit}
    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none cursor-pointer flex items-center justify-center gap-2 group"
  >
    <Activity size={16} className="group-hover:rotate-12 transition-transform" />
    Check AI Eligibility
  </button>
) : loanLimit > 0 ? (
  /* 2. APPROVED STATE: User has money available to take */
  <button
    onClick={handleApplyLoan}
    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer flex items-center justify-center gap-2"
  >
    <DollarSign size={16} />
    <T>Get Instant Loan</T>
  </button>
) : (
  /* 3. LOCKED STATE: User has an active loan (limit is 0) */
  <div className="w-full py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold text-center rounded-xl border border-amber-100 dark:border-amber-900/50 flex flex-col items-center justify-center gap-1 px-2">
    <div className="flex items-center gap-2">
      <Info size={12} />
      <span>LIMIT LOCKED</span>
    </div>
    <p className="font-medium opacity-80 leading-tight">
      {limitReason || "Repay current loan to unlock limits."}
    </p>
  </div>
)}
            </div>

            <SummaryCard title="Pending Requests" value={pending} icon={<Clock size={20} />} />
            <SummaryCard title="Notifications" value={notifications} icon={<Bell size={20} />} />
          </div>
        )}
      </div>

      {/* --- NEW PLACEMENT: ACTIVE LOAN DETAILS --- */}
      {activeLoan && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#0c1a2b] border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-lg max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Clock className="text-indigo-500" size={18} /> Loan Progress</h3>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black tracking-tighter">AUTO-CUT ON</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500">Debt Remaining</span>
              <span className="text-xl font-black text-indigo-600">{Number(activeLoan.remainingAmount).toFixed(2)} BDT</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${((activeLoan.totalPayable - activeLoan.remainingAmount) / activeLoan.totalPayable) * 100}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 text-center">Next deduction: {new Date(activeLoan.nextInstallmentDate).toLocaleDateString()}</p>
            <button onClick={() => handleInstantRepay(activeLoan._id)} className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-all">
              Pay Full Amount Now
            </button>
          </div>
        </motion.div>
      )}
      {/* Recent Transactions */}

      <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          <T>Recent Transactions</T>
        </h2>

        {loadingData ? (
          <p className="text-gray-500 text-sm"><T>Loading transactions...</T></p>
        ) : (
          <ul className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm"><T>No transactions found</T></p>
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
        <p className="text-sm text-gray-500 dark:text-gray-400"><T>{title}</T></p>
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
