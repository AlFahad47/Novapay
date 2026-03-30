"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, RefreshCw, CheckCircle2, AlertCircle, ArrowDownCircle } from "lucide-react";
import { CURRENCY_META, SupportedCurrency } from "@/types/international";
import T from "@/components/T";

type Step = "form" | "success";

export default function CashOutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Access guard
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // User data
  const [mainBalance, setMainBalance] = useState<number>(0);
  const [wallets, setWallets] = useState<Record<string, number>>({});

  // Form state
  const [step, setStep] = useState<Step>("form");
  const [sourceCurrency, setSourceCurrency] = useState<SupportedCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [estimatedBDT, setEstimatedBDT] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successSummary, setSuccessSummary] = useState<{
    deducted: string;
    added: string;
    newBalance: number;
    newWalletBalance: number;
  } | null>(null);

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
          setWallets(userData?.wallets ?? {});
          // Default to first available wallet with balance
          const availableWallets = Object.entries(userData?.wallets ?? {}).filter(([, b]) => (b as number) > 0);
          if (availableWallets.length > 0) {
            setSourceCurrency(availableWallets[0][0] as SupportedCurrency);
          }
        } else {
          router.push("/");
        }
        setAccessChecked(true);
      })
      .catch(() => router.push("/"));
  }, [session, status, router]);

  // ── Live rate preview ─────────────────────────────────────────────
  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setEstimatedBDT(null);
      return;
    }
    const debounce = setTimeout(async () => {
      setRateLoading(true);
      try {
        if (sourceCurrency === "BDT") {
          setEstimatedBDT(Number(amount));
        } else {
          const res = await fetch(`https://open.er-api.com/v6/latest/${sourceCurrency}`);
          const data = await res.json();
          const rate: number = data.rates?.["BDT"];
          if (rate) {
            setEstimatedBDT(parseFloat((Number(amount) * rate).toFixed(2)));
          }
        }
      } catch {
        setEstimatedBDT(null);
      } finally {
        setRateLoading(false);
      }
    }, 600);
    return () => clearTimeout(debounce);
  }, [amount, sourceCurrency]);

  // ── Submit Cash Out ───────────────────────────────────────────────
  async function handleCashOut() {
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    const walletBal = wallets[sourceCurrency] ?? 0;
    if (Number(amount) > walletBal) {
      setError(`Insufficient ${sourceCurrency} balance. You have ${walletBal} ${sourceCurrency}.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transfer/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          sourceCurrency,
          amount: Number(amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Cash out failed. Please try again.");
        return;
      }
      setSuccessSummary(data.summary);
      setMainBalance(data.summary.newBalance);
      setWallets((prev) => ({
        ...prev,
        [sourceCurrency]: data.summary.newWalletBalance,
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
    setEstimatedBDT(null);
    setSuccessSummary(null);
    setError("");
  }

  // ── Wallets with balance (for selector) ──────────────────────────
  const walletsWithBalance = Object.entries(wallets).filter(([, b]) => (b as number) > 0);

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
          className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <ArrowDownCircle size={28} />
            <div>
              <h1 className="text-2xl font-bold"><T>Cash Out</T></h1>
              <p className="text-sm opacity-80"><T>Convert your foreign wallet balance back to BDT</T></p>
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
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-blue-400"><T>Main BDT Balance</T></p>
              <p className="text-lg font-bold text-gray-800 dark:text-blue-100">
                ৳{mainBalance.toLocaleString()} <span className="text-sm font-medium text-gray-400">BDT</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* No wallets with balance */}
        {walletsWithBalance.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-8 border border-gray-200 dark:border-blue-800 text-center space-y-3"
          >
            <Wallet size={40} className="mx-auto text-gray-300 dark:text-blue-800" />
            <p className="text-gray-500 dark:text-blue-400 text-sm">
              <T>You have no foreign wallet balance to cash out.</T>
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/international/topup")}
              className="px-5 py-2.5 bg-[#0070ff] text-white text-sm font-semibold rounded-xl transition"
            >
              <T>Top Up a Wallet First</T>
            </motion.button>
          </motion.div>
        ) : (
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
                    <T>Select Wallet to Cash Out</T>
                  </label>
                  <select
                    value={sourceCurrency}
                    onChange={(e) => {
                      setSourceCurrency(e.target.value as SupportedCurrency);
                      setAmount("");
                      setEstimatedBDT(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    {walletsWithBalance.map(([currency, balance]) => {
                      const meta = CURRENCY_META[currency as SupportedCurrency];
                      if (!meta) return null;
                      return (
                        <option key={currency} value={currency}>
                          {meta.flag} {currency} — Balance: {meta.symbol}{(balance as number).toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                  {/* Wallet balance hint */}
                  <p className="text-xs text-gray-400 dark:text-blue-500 mt-1">
                    <T>Available:</T> {CURRENCY_META[sourceCurrency]?.symbol}{(wallets[sourceCurrency] ?? 0).toFixed(2)} {sourceCurrency}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                    <T>Amount</T> ({sourceCurrency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      {CURRENCY_META[sourceCurrency]?.symbol}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max={wallets[sourceCurrency] ?? 0}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    />
                  </div>
                  {/* Max button */}
                  <button
                    type="button"
                    onClick={() => setAmount(String((wallets[sourceCurrency] ?? 0).toFixed(2)))}
                    className="text-xs text-[#7c3aed] hover:underline mt-1"
                  >
                    Use max ({CURRENCY_META[sourceCurrency]?.symbol}{(wallets[sourceCurrency] ?? 0).toFixed(2)})
                  </button>
                </div>

                {/* Live BDT preview */}
                {(estimatedBDT !== null || rateLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-sm space-y-1"
                  >
                    {rateLoading ? (
                      <div className="flex items-center gap-2 text-purple-400">
                        <RefreshCw size={14} className="animate-spin" /> <T>Calculating...</T>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-gray-600 dark:text-blue-300">
                          <span><T>You will cash out</T></span>
                          <span className="font-semibold text-red-400">
                            −{CURRENCY_META[sourceCurrency]?.symbol}{Number(amount).toFixed(2)} {sourceCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-blue-300">
                          <span><T>You will receive</T></span>
                          <span className="font-semibold text-green-500">+৳{estimatedBDT?.toLocaleString()} BDT</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCashOut}
                  disabled={loading || !amount || Number(amount) <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <ArrowDownCircle size={18} />}
                  {loading ? <T>Processing...</T> : <T>Cash Out to BDT</T>}
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

                <h2 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Cash Out Successful!</T></h2>

                <div className="bg-gray-50 dark:bg-[#071120] rounded-xl p-4 text-sm space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-blue-400"><T>Cashed out</T></span>
                    <span className="font-semibold text-red-400">{successSummary.deducted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-blue-400"><T>Added to BDT balance</T></span>
                    <span className="font-semibold text-green-500">{successSummary.added}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-blue-800 pt-2">
                    <span className="text-gray-500 dark:text-blue-400"><T>New BDT balance</T></span>
                    <span className="font-bold text-gray-800 dark:text-blue-100">
                      ৳{successSummary.newBalance.toLocaleString()} BDT
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 font-medium hover:bg-gray-50 dark:hover:bg-blue-900/30 transition"
                  >
                    <T>Cash Out Again</T>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/donation")}
                    className="flex-1 bg-[#e63b60] hover:bg-[#cf2f52] text-white font-semibold py-3 rounded-xl transition"
                  >
                    <T>Donate Now</T>
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
