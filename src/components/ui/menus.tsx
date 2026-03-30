"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  FaPaperPlane,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaWallet,
  FaMobileAlt,
  FaReceipt,
  FaHistory,
  FaPiggyBank,
  FaCreditCard,
  FaSyncAlt,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaGlobe,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import T from "@/components/T";

// Modals
import BillForm from "../modals/bill";
import RechargeForm from "../modals/mobilerecharge";
import SendMoneyForm from "../modals/sendmoney";
import RequestMoneyForm from "../modals/RequestMoney";
import CashOutForm from "../modals/CashOutForm";
import AddMoneyForm from "../modals/AddMoneyForm";

// 1. Cleaned up Types & Data
type MenuItem = {
  name: string;
  icon: IconType;
  route: string;
  requiresAuth: boolean;
  points?: number;
};

const quickActions: MenuItem[] = [
  {
    name: "Send Money",
    icon: FaPaperPlane,
    route: "/send-money",
    requiresAuth: true,
    points: 100,
  },
  {
    name: "Request Money",
    icon: FaHandHoldingUsd,
    route: "/request-money",
    requiresAuth: true,
    points: 20,
  },
  {
    name: "Cash Out",
    icon: FaMoneyBillWave,
    route: "/cash-out",
    requiresAuth: true,
    points: 50,
  },
  {
    name: "Add Money",
    icon: FaWallet,
    route: "/add-money",
    requiresAuth: true,
    points: 100,
  },
  {
    name: "Mobile Recharge",
    icon: FaMobileAlt,
    route: "/mobile-recharge",
    requiresAuth: false,
    points: 20,
  },
  {
    name: "Pay Bill",
    icon: FaReceipt,
    route: "/pay-bill",
    requiresAuth: false,
    points: 25,
  },
  {
    name: "Transaction History",
    icon: FaHistory,
    route: "/dashboard/transactions",
    requiresAuth: true,
  },
  { name: "Wallet", icon: FaPiggyBank, route: "/wallet", requiresAuth: true },
  {
    name: "Cards & Banks",
    icon: FaCreditCard,
    route: "/cardsbank",
    requiresAuth: true,
  },
  {
    name: "International Pay",
    icon: FaGlobe,
    route: "/international",
    requiresAuth: true,
  },
  {
    name: "Subscriptions",
    icon: FaSyncAlt,
    route: "/dashboard/subscription",
    requiresAuth: true,
  },
];

// 2. Modal Mapping for Scalability
const ModalComponents: Record<string, React.FC> = {
  "Pay Bill": BillForm,
  "Mobile Recharge": RechargeForm,
  "Send Money": SendMoneyForm,
  "Request Money": RequestMoneyForm,
  "Cash Out": CashOutForm,
  "Add Money": AddMoneyForm,
};

const QuickActionsContent = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const router = useRouter();
  const searchParams = useSearchParams();

  const sendMoneyAction = searchParams.get("action") === "sendmoney";
  const [activeIndex, setActiveIndex] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(() => sendMoneyAction);
  const [activeModal, setActiveModal] = useState<string | null>(() =>
    sendMoneyAction ? "Send Money" : null,
  );
  const [isMounted, setIsMounted] = useState(false);

  const total = quickActions.length;

  // Clean up action URL param on mount
  useEffect(() => {
    if (sendMoneyAction) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  // 3. Optimized Data Fetching: Run requests in parallel
  useEffect(() => {
    const fetchStatus = async () => {
      if (isLoggedIn && session?.user?.email) {
        try {
          const [kycRes, subRes] = await Promise.all([
            fetch(`/api/kyc?email=${session.user.email}`),
            fetch(`/api/subscription/status?email=${session.user.email}`),
          ]);

          const kycData = await kycRes.json();
          const subData = await subRes.json();

          if (kycData?.kycStatus) setKycStatus(kycData.kycStatus);
          setIsSubscribed(subData?.subscribed === true);
        } catch (err) {
          console.error("Error fetching user status:", err);
        }
      }
    };
    fetchStatus();
  }, [isLoggedIn, session?.user?.email]);

  const checkIsLocked = (item: MenuItem) => {
    if (!item.requiresAuth) return false;
    if (!isLoggedIn) return true;
    if (isSubscribed) return false;
    return kycStatus !== "approved";
  };

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  const handleItemClick = (index: number, item: MenuItem) => {
    // Rotate to center if a side item is clicked
    if (index !== activeIndex) {
      setActiveIndex(index);
      return;
    }

    // Execute action if it's the center item
    if (checkIsLocked(item)) {
      if (!isLoggedIn) {
        Swal.fire({
          title: "🔒 Authentication Required",
          text: "Login to access this feature",
          showDenyButton: true,
          confirmButtonText: "Login",
          denyButtonText: "Register",
          confirmButtonColor: "#4DA1FF",
        }).then((res) => {
          if (res.isConfirmed) router.push("/login");
          else if (res.isDenied) router.push("/register");
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "KYC Required",
          text: `Status: ${kycStatus || "Pending"}`,
          confirmButtonText: "Check Profile",
          confirmButtonColor: "#4DA1FF",
        }).then(() => router.push("/dashboard/profile"));
      }
      return;
    }

    if (ModalComponents[item.name]) {
      setActiveModal(item.name);
      setIsModalOpen(true);
    } else {
      router.push(item.route);
    }
  };

  // 4. Cleaned Carousel Math
  const getItemStyles = (index: number) => {
    let diff = (index - activeIndex + total) % total;
    if (diff > Math.floor(total / 2)) diff -= total;

    const isCenter = diff === 0;
    const spacingX = "clamp(100px, 16vw, 200px)"; // Modern responsive clamp
    const translateX = `calc(-50% + calc(${spacingX} * ${diff}))`;
    const zIndex = isCenter ? 20 : 10 - Math.abs(diff);

    return {
      transform: `translate(${translateX}, -50%) scale(${isCenter ? 1 : 0.75})`,
      opacity: Math.abs(diff) >= 3 ? 0 : isCenter ? 1 : 0.4,
      zIndex,
    };
  };

  const ActiveModalComponent = useMemo(
    () => (activeModal ? ModalComponents[activeModal] : null),
    [activeModal],
  );

  return (
    <section className="home-section py-16">
      {/* Hardware Accelerated SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#4DA1FF" offset="0%" />
            <stop stopColor="#1E50FF" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient Glow Background */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-100 w-120 -translate-x-1/2 rounded-full bg-[#4DA1FF]/10 blur-[110px] dark:bg-[#4DA1FF]/16"></div>

      <div className="home-container flex flex-col items-center px-4">
        {/* Header Area */}
        <div className="mb-7 w-full text-center">
          <h2 className="home-heading text-3xl md:text-[2.5rem]">
            <T>Everything You Need,</T>{" "}
            <span className="bg-linear-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent">
              <T>One Tap Away</T>
            </span>
          </h2>

          {/* KYC Status Rendering */}
          <div className="flex items-center justify-center">
            {isLoggedIn && kycStatus === "approved" && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                <FaCheckCircle size={14} /> <T>Verified Account</T>
              </span>
            )}
            {isLoggedIn && kycStatus === "pending" && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 animate-pulse">
                <FaClock size={14} /> <T>Verification Pending</T>
              </span>
            )}
            {isLoggedIn &&
              kycStatus &&
              !["approved", "pending"].includes(kycStatus) && (
                <button
                  onClick={() => router.push("/dashboard/kyc")}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <FaExclamationTriangle size={14} />
                  {kycStatus === "rejected"
                    ? <T>KYC Rejected - Re-apply now</T>
                    : <T>Complete KYC to Unlock Features</T>}
                </button>
              )}
          </div>
        </div>

        {/* 3D Carousel Area */}
        <div className="relative flex h-50 w-full items-center justify-between md:h-65">
          <button
            onClick={handlePrev}
            aria-label="Previous action"
            className="z-30 hidden p-4 text-slate-400 transition hover:text-blue-600 hover:scale-110 dark:hover:text-[#4DA1FF] sm:block"
          >
            <ArrowLeft size={32} />
          </button>

          <div className="relative h-full flex-1 overflow-hidden">
            {/* Center Background Hub (Adds depth) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 shadow-[0_16px_42px_rgba(37,99,235,0.08)] transition-colors dark:bg-[#11203a] md:h-55 md:w-55" />

            {quickActions.map((item, index) => {
              const isCenter = index === activeIndex;
              const isLocked = checkIsLocked(item);
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(index, item)}
                  aria-label={item.name}
                  aria-current={isCenter ? "true" : "false"}
                  className="absolute left-1/2 top-1/2 flex w-35 flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:w-45 focus:outline-none group"
                  style={getItemStyles(index)}
                >
                  {item.points && (
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ease-out
                      ${isCenter ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"}`}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse" />

                        <div className="relative flex flex-col items-center justify-center min-w-[50px] px-3 py-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-amber-500/30 rounded-2xl shadow-[0_8px_16px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

                          <div className="flex items-center gap-1">
                            <span className="text-[12px] font-black bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                              +{item.points}
                            </span>
                            <span className="text-[9px] font-bold text-amber-600/80 dark:text-amber-400/80 tracking-tighter uppercase">
                              <T>Points</T>
                            </span>
                          </div>

                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/80 dark:bg-gray-900/80 border-r border-b border-amber-200/50 dark:border-amber-500/30" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative mb-3 flex items-center justify-center rounded-[1.5rem] transition-all duration-500
                    ${isCenter ? "h-20 w-20 md:h-24 md:w-24 bg-white dark:bg-[#17304f] shadow-[0_8px_24px_rgba(29,78,216,0.14)] border border-blue-100/90 dark:border-blue-300/35" : "h-16 w-16 md:h-22 md:w-22 bg-slate-200/80 dark:bg-slate-700/40"}
                    ${isLocked ? "opacity-85" : ""}
                  `}
                  >
                    <Icon
                      size={isCenter ? 36 : 28}
                      style={
                        isCenter && !isLocked
                          ? { fill: "url(#iconGradient)" }
                          : {}
                      }
                      className={`transition-colors duration-500 ${isCenter && !isLocked ? "" : "text-slate-700 dark:text-slate-200"}`}
                    />

                    {/* Minimalist Lock Indicator */}
                    {isLocked && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <FaLock size={10} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-center font-bold tracking-wide transition-colors duration-500
                    ${isCenter ? "text-[15px] text-slate-800 dark:text-slate-100" : "text-[13px] text-slate-500 dark:text-slate-400"}
                  `}
                  >
                    <T>{item.name}</T>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next action"
            className="z-30 hidden p-4 text-slate-400 transition hover:text-blue-600 hover:scale-110 dark:hover:text-[#4DA1FF] sm:block"
          >
            <ArrowRight size={32} />
          </button>
        </div>

        {/* Modular Modals */}
        {isMounted &&
          isModalOpen &&
          ActiveModalComponent &&
          createPortal(
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/70">
              <div className="relative z-10000 w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_64px_-20px_rgba(15,23,42,0.4)] animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#12233c]">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5 dark:border-white/10 dark:bg-transparent">
                  <h3 className="flex items-center gap-3 text-lg font-extrabold text-slate-800 dark:text-white">
                    {activeModal === "Pay Bill" ? (
                      <FaReceipt className="text-blue-500" />
                    ) : (
                      <FaPaperPlane className="text-blue-500" />
                    )}
                    <T>{activeModal ?? ""}</T>
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-white/10"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
                <div className="p-6">
                  <ActiveModalComponent />
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </section>
  );
};

export default function QuickActions() {
  return (
    <Suspense
      fallback={
        <div className="flex h-100 w-full items-center justify-center bg-[#FCFEFF] dark:bg-[#081325]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      }
    >
      <QuickActionsContent />
    </Suspense>
  );
}
