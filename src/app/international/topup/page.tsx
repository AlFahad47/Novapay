"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, RefreshCw, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { CURRENCY_META, SupportedCurrency } from "@/types/international";
import T from "@/components/T";
import { formatAmount } from "@/lib/utils";

const CURRENCIES = Object.keys(CURRENCY_META) as SupportedCurrency[];

type Step = "form" | "success";

export default function TopUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Access guard
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // User data
  const [mainBalance, setMainBalance] = useState<number>(0);
  const [mainCurrency, setMainCurrency] = useState<string>("BDT");
  const [wallets, setWallets] = useState<Record<string, number>>({});

  // Form state
  const [step, setStep] = useState<Step>("form");
  const [targetCurrency, setTargetCurrency] = useState<SupportedCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [estimatedDeduction, setEstimatedDeduction] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successSummary, setSuccessSummary] = useState<{ deducted: string; added: string; newBalance: number } | null>(null);

  // ── Access Guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`/api/subscription/status?email=${session.user.email}`).then((r) => r.json()),
      fetch(`/api/user/update?email=${session.user.email}`).then((r) => r.json()),
    ])
      .then(([subData, userData]) => {
        const isSubscribed = subData?.subscribed === true;
        const unlocked: string[] = userData?.unlockedFeatures || [];
        if (isSubscribed || unlocked.includes("International Pay")) {
          setHasAccess(true);
          setMainBalance(userData?.balance ?? 0);
          setMainCurrency("BDT");
          setWallets(userData?.wallets ?? {});
        } else {
          router.push("/");
        }
        setAccessChecked(true);
      })
      .catch(() => router.push("/"));
  }, [session, status, router]);

  // ── Live rate preview: fetch estimated deduction when amount changes ──
  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setEstimatedDeduction(null);
      return;
    }

    const debounce = setTimeout(async () => {
      setRateLoading(true);
      try {
        if (mainCurrency === targetCurrency) {
          setEstimatedDeduction(Number(amount));
        } else {
          // Use open.er-api.com to support BDT and all currencies
          const res = await fetch(`https://open.er-api.com/v6/latest/${targetCurrency}`);
          const data = await res.json();
          const rate: number = data.rates?.[mainCurrency];
          if (rate) {
            setEstimatedDeduction(parseFloat((Number(amount) * rate).toFixed(4)));
          }
        }
      } catch {
        setEstimatedDeduction(null);
      } finally {
        setRateLoading(false);
      }
    }, 600); // wait 600ms after user stops typing

    return () => clearTimeout(debounce);
  }, [amount, targetCurrency, mainCurrency]);

  // ── Submit Top Up ─────────────────────────────────────────────────
  async function handleTopUp() {
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transfer/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          targetCurrency,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Top up failed. Please try again.");
        return;
      }

      setSuccessSummary(data.summary);
      setMainBalance(data.summary.newBalance);
      setWallets((prev) => ({
        ...prev,
        [targetCurrency]: (prev[targetCurrency] ?? 0) + Number(amount),
      }));
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("form");
    setAmount("");
    setEstimatedDeduction(null);
    setSuccessSummary(null);
    setError("");
  }

  // ── Loading screen ────────────────────────────────────────────────
  if (!accessChecked || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#04090f]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <RefreshCw size={32} className="animate-spin text-[#0070ff]" />
          <p className="text-sm"><T>Verifying access...</T></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.push("/international")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-blue-400 hover:text-[#0070ff] transition"
        >
          <ArrowLeft size={16} /> <T>Back to International Transfer</T>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0061ff] to-[#0095ff] text-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <PlusCircle size={28} />
            <div>
              <h1 className="text-2xl font-bold"><T>Top Up Wallet</T></h1>
              <p className="text-sm opacity-80"><T>Fund your international wallet from your main balance</T></p>
            </div>
          </div>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-5 border border-gray-200 dark:border-blue-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-[#0070ff]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-blue-400"><T>Main Balance</T></p>
              <p className="text-lg font-bold text-gray-800 dark:text-blue-100">
                {formatAmount(mainBalance)} <span className="text-sm font-medium text-gray-400">{mainCurrency}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Wallet Balances */}
        {Object.keys(wallets).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-5 border border-gray-200 dark:border-blue-800 space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-blue-400"><T>Your Wallets</T></p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(wallets).map(([currency, balance]) => {
                const meta = CURRENCY_META[currency as SupportedCurrency];
                if (!meta) return null;
                return (
                  <div key={currency} className="flex items-center gap-2 bg-gray-50 dark:bg-[#071120] rounded-xl p-3">
                    <img
                      src={`https://flagcdn.com/w40/${meta.countryCode}.png`}
                      alt={currency}
                      className="w-8 h-5 object-cover rounded"
                    />
                    <div>
                      <p className="text-xs text-gray-400">{currency}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-blue-100">
                        {meta.symbol}{(balance as number).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Form ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800 space-y-5"
            >
              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Currency selector */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                  <T>Select Currency to Top Up</T>
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => {
                    setTargetCurrency(e.target.value as SupportedCurrency);
                    setEstimatedDeduction(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {CURRENCY_META[c].flag} {c} - {CURRENCY_META[c].name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                  <T>Amount</T> ({targetCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    {CURRENCY_META[targetCurrency].symbol}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                  />
                </div>
              </div>

              {/* Live deduction preview */}
              {(estimatedDeduction !== null || rateLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm space-y-1"
                >
                  {rateLoading ? (
                    <div className="flex items-center gap-2 text-blue-400">
                      <RefreshCw size={14} className="animate-spin" /> <T>Calculating...</T>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-600 dark:text-blue-300">
                        <span><T>You will receive</T></span>
                        <span className="font-semibold text-[#0070ff]">{CURRENCY_META[targetCurrency].symbol}{Number(amount).toFixed(2)} {targetCurrency}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-blue-300">
                        <span><T>Deducted from main balance</T></span>
                        <span className="font-semibold text-red-500">−{formatAmount(estimatedDeduction)} {mainCurrency}</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTopUp}
                disabled={loading || !amount || Number(amount) <= 0}
                className="w-full flex items-center justify-center gap-2 bg-[#0070ff] hover:bg-[#0061ff] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                {loading ? <T>Processing...</T> : <><T>Top Up</T> {targetCurrency} <T>Wallet</T></>}
              </motion.button>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === "success" && successSummary && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-blue-800 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 size={36} className="text-green-500" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Top Up Successful!</T></h2>

              <div className="bg-gray-50 dark:bg-[#071120] rounded-xl p-4 text-sm space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-blue-400"><T>Added to wallet</T></span>
                  <span className="font-semibold text-green-500">{successSummary.added}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-blue-400"><T>Deducted from balance</T></span>
                  <span className="font-semibold text-red-400">{successSummary.deducted}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-blue-800 pt-2">
                  <span className="text-gray-500 dark:text-blue-400"><T>New main balance</T></span>
                  <span className="font-bold text-gray-800 dark:text-blue-100">{formatAmount(successSummary.newBalance)} {mainCurrency}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 font-medium hover:bg-gray-50 dark:hover:bg-blue-900/30 transition"
                >
                  <T>Top Up Again</T>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/international")}
                  className="flex-1 bg-[#0070ff] hover:bg-[#0061ff] text-white font-semibold py-3 rounded-xl transition"
                >
                  <T>Send Transfer</T>
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

