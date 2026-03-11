"use client";
import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  FaPaperPlane, FaHandHoldingUsd, FaMoneyBillWave, FaWallet,
  FaMobileAlt, FaReceipt, FaHistory, FaPiggyBank, FaCreditCard,
  FaSyncAlt, FaBolt, FaLock, FaCheckCircle, FaExclamationTriangle, FaClock
} from "react-icons/fa";
import { IconType } from "react-icons";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import BillForm from "../modals/bill";
import RechargeForm from "../modals/mobilerecharge";
import SendMoneyForm from "../modals/sendmoney";
import RequestMoneyForm from "../modals/RequestMoney";
import CashOutForm from "../modals/CashOutForm";
import AddMoneyForm from "../modals/AddMoneyForm";

type MenuItem = {
  name: string;
  icon: IconType;
  route: string;
  requiresAuth: boolean;
  points?: number; // Added points type
};

const quickActions: MenuItem[] = [
  { name: "Send Money",          icon: FaPaperPlane,      route: "/send-money",       requiresAuth: true, points: 100 },
  { name: "Request Money",       icon: FaHandHoldingUsd, route: "/request-money",    requiresAuth: true, points: 20 },
  { name: "Cash Out",            icon: FaMoneyBillWave,  route: "/cash-out",         requiresAuth: true, points: 50 },
  { name: "Add Money",           icon: FaWallet,         route: "/add-money",        requiresAuth: true, points: 100 },
  { name: "Mobile Recharge",     icon: FaMobileAlt,      route: "/mobile-recharge",  requiresAuth: false, points: 20 },
  { name: "Pay Bill",            icon: FaReceipt,        route: "/pay-bill",         requiresAuth: false, points: 25 },
  { name: "Transaction History", icon: FaHistory,        route: "/dashboard/transactions", requiresAuth: true },
  { name: "Wallet",              icon: FaPiggyBank,      route: "/wallet",           requiresAuth: true },
  { name: "Cards & Banks",       icon: FaCreditCard,     route: "/cardsbank",      requiresAuth: true },
  { name: "Subscriptions",       icon: FaSyncAlt,        route: "/subscriptions",    requiresAuth: false },
];

const QuickActionsContent = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeIndex, setActiveIndex] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "sendmoney") {
      setActiveModal("Send Money");
      setIsModalOpen(true);
      setActiveIndex(0);
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (isLoggedIn && session?.user?.email) {
        try {
          const res = await fetch(`/api/kyc?email=${session.user.email}`); 
          const data = await res.json();
          if (data && data.kycStatus) setKycStatus(data.kycStatus);
        } catch (err) { console.error("Error fetching KYC:", err); }
      }
    };
    fetchStatus();
  }, [isLoggedIn, session?.user?.email]);

  const total = quickActions.length;
  
  const checkIsLocked = (item: MenuItem) => {
    if (!item.requiresAuth) return false;
    if (!isLoggedIn) return true;
    return kycStatus !== "approved";
  };

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  const handleItemClick = (index: number, item: MenuItem) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      return;
    }

    if (checkIsLocked(item)) {
      if (!isLoggedIn) {
        Swal.fire({
          title: "🔒 Authentication Required",
          text: "Login to access this feature",
          showDenyButton: true,
          confirmButtonText: "Login",
          denyButtonText: "Register",
        }).then((res) => {
          if (res.isConfirmed) router.push("/login");
          else if (res.isDenied) router.push("/register");
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "KYC Required",
          text: "Status: " + (kycStatus || "pending"),
          confirmButtonText: "Check Profile",
        }).then(() => router.push("/dashboard/profile"));
      }
      return;
    }

    if (["Pay Bill", "Mobile Recharge", "Send Money", "Request Money","Cash Out", "Add Money"].includes(item.name)) {
      setActiveModal(item.name);
      setIsModalOpen(true);
    } else {
      router.push(item.route);
    }
  };

  const getItemStyles = (index: number) => {
    let diff = (index - activeIndex + total) % total;
    if (diff > Math.floor(total / 2)) diff -= total;
    const isCenter = diff === 0;
    const spacingX = "max(110px, min(18vw, 240px))";
    const translateX = `calc(-50% + calc(${spacingX} * ${diff}))`;
    return {
      transform: `translate(${translateX}, -50%) scale(${isCenter ? 1 : 0.8})`,
      opacity: Math.abs(diff) >= 3 ? 0 : 1,
      zIndex: isCenter ? 20 : 10,
    };
  };

  
  const renderKycInfo = () => {
    if (!isLoggedIn) return null;

    if (kycStatus === "approved") {
      return (
        <div className="flex items-center justify-center w-full gap-1.5 text-green-500 text-sm font-medium mt-2">
          <FaCheckCircle size={14} /> Verified Account
        </div>
      );
    }

    if (kycStatus === "pending") {
      return (
        <div className="flex items-center justify-center w-full gap-1.5 text-amber-500 text-sm font-medium mt-2 animate-pulse">
          <FaClock size={14} /> Verification Pending
        </div>
      );
    }

    return (
      <div className="flex justify-center w-full">
        <button 
          onClick={() => router.push("/dashboard/kyc")}
          className="flex items-center gap-1.5 text-red-500 text-sm font-semibold mt-2 hover:underline decoration-2 underline-offset-4 transition-all"
        >
          <FaExclamationTriangle size={14} /> 
          {kycStatus === "rejected" ? "KYC Rejected - Re-apply now" : "Complete KYC to Unlock All Features"}
        </button>
      </div>
    );
  };

  return (
    <section className="w-full bg-gray-50 dark:bg-[#0A0E17] pb-10 overflow-hidden relative border-y border-gray-200 dark:border-gray-800/60">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#4DA1FF" offset="0%" /><stop stopColor="#1E50FF" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-[1400px] mx-auto px-4 relative flex flex-col items-center">
        <div className="w-full text-center pt-14 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4DA1FF]/10 border border-[#4DA1FF]/20 text-[#4DA1FF] text-xs font-semibold mb-3">
            <FaBolt size={10} /> Quick Actions
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
            Everything You Need, <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent">One Tap Away</span>
          </h2>
          {renderKycInfo()}
        </div>

        <div className="relative w-full h-[280px] md:h-[340px] flex items-center justify-between">
          <button onClick={handlePrev} className="z-30 p-4 text-gray-400 hover:text-blue-600 hidden sm:block"><ArrowLeft size={32} /></button>
          
          <div className="relative flex-1 h-full overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] md:w-[230px] md:h-[230px] bg-white dark:bg-[#121928] rounded-full shadow-xl z-10 pointer-events-none" />
            
            {quickActions.map((item, index) => {
              const isCenter = index === activeIndex;
              const Icon = item.icon;
              const isLocked = checkIsLocked(item);
              return (
                <div key={index} onClick={() => handleItemClick(index, item)} className={`absolute left-1/2 top-1/2 flex flex-col items-center justify-center transition-all duration-[600ms] w-[160px] md:w-[200px] cursor-pointer`} style={getItemStyles(index)}>
                  <div className={`relative mb-4 transition-all ${isCenter ? "scale-110" : ""} ${isLocked ? "opacity-35" : ""}`}>
                    
                    {/* Points Badge - Only visible when centered */}
                   {item.points && (
  <div
    className={`absolute -top-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ease-out 
      ${isCenter ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"}`}
  >
    {/* Glassmorphic Container */}
    <div className="relative group">
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse" />
      
      <div className="relative flex flex-col items-center justify-center min-w-[50px] px-3 py-1.5 
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
        border border-amber-200/50 dark:border-amber-500/30 
        rounded-2xl shadow-[0_8px_16px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
        
        {/* Shine highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

        <div className="flex items-center gap-1">
          <span className="text-[12px] font-black bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
            +{item.points}
          </span>
          <span className="text-[9px] font-bold text-amber-600/80 dark:text-amber-400/80 tracking-tighter uppercase">
            Points
          </span>
        </div>
        
        {/* Bottom "Diamond" indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 
          bg-white/80 dark:bg-gray-900/80 border-r border-b border-amber-200/50 dark:border-amber-500/30" />
      </div>
    </div>
  </div>
)}

                    <Icon size={isCenter ? 64 : 52} style={isCenter && !isLocked ? { fill: "url(#iconGradient)" } : {}} className={!isCenter || isLocked ? "text-gray-400" : ""} />
                    {isLocked && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow"><FaLock size={10} className="text-gray-400"/></div>}
                  </div>
                  <span className={`text-center font-bold ${isLocked ? "opacity-40" : ""} ${isCenter ? "text-blue-500 text-lg" : "text-gray-500"}`}>{item.name}</span>
                </div>
              );
            })}
          </div>
          <button onClick={handleNext} className="z-30 p-4 text-gray-400 hover:text-blue-600 hidden sm:block"><ArrowRight size={32} /></button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#121928] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  {activeModal === "Pay Bill" ? <FaReceipt className="text-blue-500" /> : <FaPaperPlane className="text-blue-500" />} 
                  {activeModal}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                {activeModal === "Pay Bill" && <BillForm />}
                {activeModal === "Mobile Recharge" && <RechargeForm />} 
                {activeModal === "Send Money" && <SendMoneyForm />} 
                {activeModal === "Request Money" && <RequestMoneyForm />} 
                {activeModal === "Cash Out" && <CashOutForm />} 
                {activeModal === "Add Money" && <AddMoneyForm />} 
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const QuickActions = () => {
  return (
    <Suspense fallback={<div>Loading Actions...</div>}>
      <QuickActionsContent />
    </Suspense>
  );
};

export default QuickActions;