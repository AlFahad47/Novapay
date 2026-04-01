"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Crown, Check, Loader2, Zap, Globe, Calculator, PiggyBank } from "lucide-react";
import { SUBSCRIPTION_PRICES, SubscriptionPlan, ELITE_FEATURES } from "@/types/subscription";
import T from "@/components/T";
import { formatAmount } from "@/lib/utils";

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

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchStatus();
  }, [session]);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="text-yellow-400" size={28} />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100"><T>Elite Subscription</T></h1>
        </div>
        <p className="text-blue-500 dark:text-blue-400 text-sm">
          <T>Unlock all premium features with one simple subscription</T>
        </p>
      </div>

      {/* Active subscription banner */}
      {status?.subscribed && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Crown className="text-yellow-400 shrink-0" size={28} />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300"><T>You are an Elite Member!</T></p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {status.daysLeft} <T>days remaining · Plan:</T> {status.subscription?.plan}
            </p>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <T>What you get</T>
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ELITE_FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature] ?? Check;
            return (
              <li key={feature} className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-blue-500" />
                </span>
                <T>{feature}</T>
              </li>
            );
          })}
          <li className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <Check size={14} className="text-blue-500" />
            </span>
            <T>All future Elite features</T>
          </li>
        </ul>
      </div>

      {/* Plan selector - only visible if not subscribed */}
      {!status?.subscribed && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["monthly", "yearly"] as SubscriptionPlan[]).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`rounded-2xl border-2 p-5 text-left transition-all ${
                  selectedPlan === plan
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-4 ring-blue-500/10"
                    : "border-blue-100 dark:border-blue-800 bg-white dark:bg-[#0c1a2b] hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold capitalize text-blue-800 dark:text-blue-200">
                    {plan}
                  </span>
                  {plan === "yearly" && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      <T>Save 30%</T>
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ৳{formatAmount(SUBSCRIPTION_PRICES[plan])}
                </p>
                <p className="text-xs text-blue-400 mt-0.5">
                  {plan === "monthly" ? <T>per month</T> : <T>per year</T>}
                </p>
              </button>
            ))}
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`rounded-xl p-4 text-sm animate-in zoom-in-95 duration-300 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700"
            }`}>
              <T>{message.text}</T>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full py-4 rounded-2xl bg-[#0070ff] hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {purchasing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Crown size={16} className="text-yellow-300" />
            )}
            {purchasing
              ? <T>Processing payment...</T>
              : <><T>Subscribe for</T> ৳{formatAmount(SUBSCRIPTION_PRICES[selectedPlan])}</>}
          </button>

          <p className="text-center text-[11px] text-blue-400/80">
            <T>Deducted directly from your NovaPay BDT wallet. Subscription is non-refundable.</T>
          </p>
        </div>
      )}
    </div>
  );
}
