"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, LayoutDashboard, ArrowUpRight, Send, Wallet, 
  TrendingUp, CreditCard, ShieldCheck, Wifi, Bell, Lock, X, UserCircle2
} from "lucide-react";
import Swal from "sweetalert2";
import StatusOnboarding from "../../components/StatusOnboarding";


const BannerUser: React.FC = () => {
  const { data: session } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // নোটিফিকেশন স্টেট
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [notificationData, setNotificationData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ডাটা ফেচিং লজিক
  useEffect(() => {
    const fetchAllData = async () => {
      if (session?.user?.email) {
        try {
          // ১. ইউজার প্রোফাইল আপডেট
          const userRes = await fetch(`/api/user/update?email=${session.user.email}`);
          const userData = await userRes.json();
          setDbUser(userData);


          if (userData?.kycStatus !== "approved" && userData?.kycStatus !== "pending") {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false); // ফর্ম জমা দিলে আর দেখাবে না
        }

          // ২. নোটিফিকেশন চেক (আপনার ডাটাবেজ ফিল্ড 'to' অনুযায়ী)
          const notifRes = await fetch(`/api/notifications?email=${session.user.email}`);
          const notifData = await notifRes.json();
          
          if (notifData.success && notifData.request) {
            setPendingRequests(1); 
            setNotificationData(notifData.request);
          } else {
            setPendingRequests(0);
            setNotificationData(null);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 15000); 
    return () => clearInterval(interval);
  }, [session]);

  const firstName = dbUser?.name?.split(" ")[0] || session?.user?.name?.split(" ")[0] || "User";
  const currencySymbol = dbUser?.currency === "BDT" ? "৳" : "$";
  const isApproved = dbUser?.kycStatus === "approved";

  const stats = [
    { label: "Balance", value: isApproved ? `${currencySymbol}${dbUser?.balance || "0.00"}` : "Locked", icon: <Wallet size={15} />, color: "text-[#4DA1FF]" },
    { label: "This Month", value: isApproved ? `${currencySymbol}${dbUser?.monthlyTotal || "0"}` : "N/A", icon: <TrendingUp size={15} />, color: "text-green-400" },
    { label: "Transactions", value: isApproved ? (dbUser?.transactionCount || "0") : "0", icon: <CreditCard size={15} />, color: "text-purple-400" },
    { label: "Security", value: isApproved ? "Active" : "Pending", icon: <ShieldCheck size={15} />, color: isApproved ? "text-emerald-400" : "text-orange-400" },
  ];

  const cardActions = [
    { label: "Send", icon: <Send size={15} /> },
    { label: "Add", icon: <Plus size={15} /> },
    { label: "History", icon: <TrendingUp size={15} /> },
  ];

  const hedwigGradient = "linear-gradient(to right, #4DA1FF, #1E50FF)";

  // এই ফাংশনটি BannerUser কম্পোনেন্টের ভেতরে যোগ করুন
const confirmPayment = async (data: any) => {
  Swal.fire({
    title: 'Confirm Payment',
    text: `Send ৳${data.amount} to ${data.from || data.senderEmail}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Pay Now',
    confirmButtonColor: '#1E50FF',
  }).then(async (result) => {
    if (result.isConfirmed) {
      // এখানে সরাসরি API কল করুন
      processPayment(data);
    }
  });
};

const processPayment = async (data: any) => {
  try {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session?.user?.email,
        type: "send_money",
        amount: Number(data.amount),
        receiver: (data.from || data.senderEmail).toLowerCase().trim(),
        description: `Payment for request: ${data.note || 'No note'}`,
        requestId: data._id, // ডাটাবেজ থেকে ডিলিট করার জন্য আইডি
      }),
    });

    const result = await res.json();
    if (result.success) {
      Swal.fire("Success!", "Payment completed and request cleared.", "success");
      // ইভেন্ট ফায়ার করা যাতে ব্যানার থেকে লাল ডট চলে যায়
      setPendingRequests(0);
      setNotificationData(null);
      window.dispatchEvent(new Event("balanceUpdated"));
    } else {
      Swal.fire("Error", result.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Transaction failed", "error");
  }
};

  return (
    <section className="relative w-full min-h-[88vh] bg-[#f0f7ff] dark:bg-[#050B14] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-user-grid { background-image: linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px); background-size: 50px 50px; }
          .dark .bg-user-grid { background-image: linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px); }
          @keyframes iconFloat { 0%, 100% { transform: translateY(0px) scale(1); opacity: 0.25; } 50% { transform: translateY(-20px) scale(1.08); opacity: 0.5; } }
          .icon-float { animation: iconFloat 7s ease-in-out infinite; }
          @keyframes floatCard { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          .float-card { animation: floatCard 5s ease-in-out infinite; }
          @keyframes shimmerSlide { 100% { transform: translateX(200%); } }
          .shimmer-card { position: relative; overflow: hidden; }
          .shimmer-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); animation: shimmerSlide 3s infinite; }
        `
      }} />

      <div className="absolute inset-0 bg-user-grid z-[-2]" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] dark:bg-[#1E50FF] opacity-[0.18] blur-[140px] rounded-full pointer-events-none z-[-1]" />

      <div className="w-11/12 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <motion.div className="flex-1 flex flex-col items-start gap-6 max-w-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4DA1FF]/20 bg-[#4DA1FF]/10 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isApproved ? 'bg-green-400' : 'bg-orange-400'}`} />
            <span className="text-[#1E50FF] dark:text-[#4DA1FF] text-xs font-bold tracking-widest uppercase">NovaPay · {isApproved ? "Verified Account" : "KYC Pending"}</span>
          </div>
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-base mb-1">{greeting},</p>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] text-[#0F172A] dark:text-white">Welcome back, <span className="text-transparent bg-clip-text" style={{ backgroundImage: hedwigGradient }}>{firstName}!</span></h1>
            <p className="mt-4 text-[#64748B] dark:text-[#94A3B8] text-sm md:text-base max-w-md leading-relaxed">Your digital assets are {isApproved ? "secure and ready" : "under review"}. {isApproved ? "Manage transfers and track spending in real-time." : "Complete your profile to unlock all features."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard"><motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="group relative flex items-center gap-2 px-7 py-3.5 rounded-full overflow-hidden border border-[#4DA1FF]/20 shadow-lg"><div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF]" /><LayoutDashboard size={16} className="relative text-white" /><span className="relative text-white text-sm font-semibold tracking-wide">Dashboard</span><ArrowUpRight size={15} className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></motion.button></Link>
            <Link href='/wallet'>
            <motion.button whileHover={{ scale: 1.04 }} className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#4DA1FF]/25 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-[#1E50FF] dark:text-[#4DA1FF]"><Wallet size={15} /><span className="text-sm font-semibold cursor-pointer">Wallet Account</span></motion.button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#4DA1FF]/15 bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm"><span className={stat.color}>{stat.icon}</span><div><p className="text-[10px] text-[#94A3B8] leading-none">{stat.label}</p><p className="text-xs font-bold text-[#0F172A] dark:text-white mt-0.5">{loading ? "..." : stat.value}</p></div></motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT CARD SECTION */}
        <motion.div className="flex-shrink-0 flex flex-col items-center gap-5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
          
          {/* ক্লিকযোগ্য এলার্ট বাটন */}
          <motion.button 
            onClick={() => pendingRequests > 0 && setIsModalOpen(true)}
            whileHover={pendingRequests > 0 ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 self-end px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 cursor-pointer ${pendingRequests > 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20 active:scale-95' : 'bg-white/70 dark:bg-[#0F172A]/70 border-[#4DA1FF]/20'}`}
          >
            <Bell size={13} className={pendingRequests > 0 ? "text-red-500 animate-bounce" : "text-[#4DA1FF]"} />
            <span className={`text-xs font-medium ${pendingRequests > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#0F172A] dark:text-white'}`}>
              {pendingRequests > 0 ? `${pendingRequests} New Request` : "No Alerts"}
            </span>
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">!</span>
            )}
          </motion.button>

          <div className="float-card">
            <div className={`shimmer-card w-[300px] md:w-[340px] h-[200px] md:h-[220px] rounded-2xl border border-white/20 p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 ${!isApproved ? 'grayscale brightness-75' : ''}`} style={{ background: isApproved ? "linear-gradient(130deg, #4DA1FF, #1E50FF)" : "#1e293b" }}>
              <div className="flex justify-between items-start"><div><p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">NovaPay Wallet</p><p className="text-white font-bold text-base mt-0.5">{firstName}</p></div>{isApproved ? <Wifi size={18} className="text-white/60 rotate-90" /> : <Lock size={16} className="text-white/40" />}</div>
              <div><p className="text-white/60 text-[10px] uppercase tracking-widest">Available Balance</p><p className="text-white font-bold text-3xl tracking-tight mt-1">{loading ? "..." : isApproved ? `${currencySymbol}${dbUser?.balance || "0.00"}` : `${currencySymbol} ••••`}</p></div>
              <div className="flex justify-between items-end"><p className="font-mono text-white/75 text-sm tracking-wider">**** **** **** {isApproved ? "4291" : "****"}</p><div className="flex items-center"><div className="w-7 h-7 rounded-full bg-yellow-400/80 -mr-3 border border-white/20" /><div className="w-7 h-7 rounded-full bg-orange-500/70 border border-white/20" /></div></div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full px-2">
            {cardActions.map((action) => (
              <motion.button key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-[#4DA1FF]/15 backdrop-blur-sm hover:bg-[#4DA1FF]/10 text-[#1E50FF] dark:text-[#4DA1FF]"><span className="text-current">{action.icon}</span><span className="text-[10px] font-semibold text-[#0F172A] dark:text-white">{action.label}</span></motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {isModalOpen && notificationData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl border border-[#4DA1FF]/20"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:rotate-90 transition-transform"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#4DA1FF]/20 to-[#1E50FF]/20 flex items-center justify-center mb-5 border border-[#4DA1FF]/20">
                  <UserCircle2 size={40} className="text-[#4DA1FF]" />
                </div>
                
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Money Request</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed">
                  <span className="font-bold text-[#1E50FF] dark:text-[#4DA1FF]">{notificationData.from || notificationData.senderEmail}</span> is requesting funds from you.
                </p>

                <div className="w-full bg-[#f8faff] dark:bg-white/5 border border-[#4DA1FF]/10 rounded-2xl p-5 my-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Amount</span>
                  <div className="text-3xl font-black text-[#0F172A] dark:text-white mt-1">
                    {currencySymbol}{notificationData.amount}
                  </div>
                  {notificationData.note && (
                    <div className="mt-3 pt-3 border-t border-[#4DA1FF]/10">
                      <p className="text-xs italic text-[#64748B] dark:text-[#94A3B8]">"{notificationData.note}"</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-sm font-bold text-[#64748B] dark:text-white hover:bg-gray-200 transition-colors"
                  >
                    Later
                  </button>
                

{/* // BannerUser.tsx এর ভেতরে Pay Now বাটনের অংশটি এভাবে পরিবর্তন করুন */}

{/* Later বাটন এর নিচে Pay Now বাটন */}
<button 
  onClick={async () => {
    // পেমেন্ট শুরু করার আগে কনফার্মেশন বা সরাসরি হ্যান্ডেল করা
    setIsModalOpen(false); // নোটিফিকেশন মডাল বন্ধ করুন
    
    // পেমেন্ট প্রসেস করার জন্য আপনার handleSend এর মত লজিক এখানে কল হবে
    // অথবা আপনি চাইলে সরাসরি একটি কনফার্মেশন এলার্ট দেখাতে পারেন
    confirmPayment(notificationData);
  }}
  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] text-white text-sm font-bold shadow-lg shadow-[#1E50FF]/30 hover:shadow-[#1E50FF]/50 transition-all"
>
  Pay Now
</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {showOnboarding && (
        <StatusOnboarding 
          status={dbUser?.kycStatus} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
      </AnimatePresence>
    </section>
  );
};

export default BannerUser;