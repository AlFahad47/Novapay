"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Crown, Check, Loader2, Zap, Globe, Calculator, PiggyBank, Users, TrendingUp } from "lucide-react";
import { SUBSCRIPTION_PRICES, SubscriptionPlan, ELITE_FEATURES } from "@/types/subscription";

const FEATURE_ICONS: Record<string, React.ElementType> = {
  "International Pay": Globe,
  "Split Bill": Calculator,
  "Micro Saving": PiggyBank,
};

interface SubscriptionStatus {
  subscribed: boolean;
  subscription: {
    plan: string;
    expiresAt: string;
    amount: number;
  } | null;
  daysLeft: number | null;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("monthly");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [adminStats, setAdminStats] = useState<{ subscribers: number; revenue: number } | null>(null);

  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!session?.user?.email) return;
    if (isAdmin) {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((data) => {
          const stats = data.stats || [];
          const subscribers = stats.find((s: any) => s.title === "Subscribers")?.value ?? 0;
          const revenue = stats.find((s: any) => s.title === "Subscription Revenue")?.value ?? 0;
          setAdminStats({ subscribers, revenue });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetchStatus();
    }
  }, [session, isAdmin]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscription/status?email=${session?.user?.email}`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ subscribed: false, subscription: null, daysLeft: null });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!session?.user?.email) return;
    setPurchasing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/subscription/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email, plan: selectedPlan }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Subscription activated! All Elite features are now unlocked.", type: "success" });
        fetchStatus();
      } else {
        setMessage({ text: data.message || "Something went wrong.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  // Admin view — show subscription revenue stats
  if (isAdmin) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <Crown className="text-yellow-400" size={24} />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Subscription Overview</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
              <Users size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-blue-400">Total Subscribers</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{adminStats?.subscribers ?? 0}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp size={22} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-blue-400">Subscription Revenue</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">৳{(adminStats?.revenue ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="text-yellow-400" size={28} />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Elite Subscription</h1>
        </div>
        <p className="text-blue-500 dark:text-blue-400 text-sm">
          Unlock all premium features with one simple subscription
        </p>
      </div>

      {/* Active subscription banner */}
      {status?.subscribed && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 flex items-center gap-4">
          <Crown className="text-yellow-400 shrink-0" size={28} />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">You are an Elite Member!</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {status.daysLeft} days remaining · Plan: {status.subscription?.plan}
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 space-y-4">
        <h2 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          What you get
        </h2>
        <ul className="space-y-3">
          {ELITE_FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature] ?? Check;
            return (
              <li key={feature} className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-blue-500" />
                </span>
                {feature}
              </li>
            );
          })}
          <li className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <Check size={14} className="text-blue-500" />
            </span>
            All future Elite features
          </li>
        </ul>
      </div>

      {/* Plan selector */}
      {!status?.subscribed && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["monthly", "yearly"] as SubscriptionPlan[]).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`rounded-2xl border-2 p-5 text-left transition-all ${
                  selectedPlan === plan
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-blue-100 dark:border-blue-800 bg-white dark:bg-[#0c1a2b]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold capitalize text-blue-800 dark:text-blue-200">
                    {plan}
                  </span>
                  {plan === "yearly" && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      Save 30%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ৳{SUBSCRIPTION_PRICES[plan].toLocaleString()}
                </p>
                <p className="text-xs text-blue-400 mt-0.5">
                  {plan === "monthly" ? "per month" : "per year"}
                </p>
              </button>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-xl p-4 text-sm ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700"
            }`}>
              {message.text}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full py-3.5 rounded-2xl bg-[#0070ff] hover:bg-blue-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Crown size={16} className="text-yellow-300" />
            )}
            {purchasing
              ? "Processing..."
              : `Subscribe for ৳${SUBSCRIPTION_PRICES[selectedPlan].toLocaleString()}`}
          </button>

          <p className="text-center text-xs text-blue-400">
            Payment is deducted from your BDT wallet balance.
          </p>
        </div>
      )}
    </div>
  );
}
