"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Wallet, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, PlusCircle, ArrowDownCircle, Crown, Lock } from "lucide-react";
import T from "@/components/T";
import { CURRENCY_META, SupportedCurrency, TransferPreview } from "@/types/international";

type Step = "form" | "preview" | "success";

const CURRENCIES = Object.keys(CURRENCY_META) as SupportedCurrency[];

export default function InternationalTransferPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Access guard state
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Wallet balances
  const [wallets, setWallets] = useState<Record<string, number>>({});

  // Form state
  const [step, setStep] = useState<Step>("form");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>("USD");
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>("PHP");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Preview + result state
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Access Guard: check if user has unlocked "International Pay" ──
  useEffect(() => {
    if (status === "loading") return;

    // Not logged in → redirect to login
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    // Check subscription first, then unlockedFeatures
    Promise.all([
      fetch(`/api/subscription/status?email=${session.user.email}`).then((r) => r.json()),
      fetch(`/api/user/update?email=${session.user.email}`).then((r) => r.json()),
    ])
      .then(([subData, userData]) => {
        const isSubscribed = subData?.subscribed === true;
        const unlocked: string[] = userData?.unlockedFeatures || [];
        if (isSubscribed || unlocked.includes("International Pay")) {
          setHasAccess(true);
          setWallets(userData?.wallets ?? {});
        }
        setAccessChecked(true);
      })
      .catch(() => setAccessChecked(true));
  }, [session, status, router]);

  // ── Step 1: Fetch preview (rate + fee) before confirming ──────────
  async function handlePreview() {
    setError("");

    if (!recipientEmail || !amount || Number(amount) <= 0) {
      setError("Please fill in all fields correctly.");
      return;
    }
    if (fromCurrency === toCurrency) {
      setError("Please select two different currencies.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/exchange-rate?from=${fromCurrency}&to=${toCurrency}`);
      const data = await res.json();

      if (!res.ok || !data.rates?.[toCurrency]) {
        setError("Could not fetch exchange rate. Try again.");
        return;
      }

      const rate: number = data.rates[toCurrency];
      const amountSent = Number(amount);
      const fee = parseFloat(((amountSent * 2) / 100).toFixed(4));
      const totalDeducted = parseFloat((amountSent + fee).toFixed(4));
      const amountReceived = parseFloat((amountSent * rate).toFixed(4));

      setPreview({ amountSent, fromCurrency, amountReceived, toCurrency, rate, fee, feePercent: 2, totalDeducted });
      setStep("preview");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Confirm and execute the transfer ──────────────────────
  async function handleConfirm() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/transfer/international", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: session?.user?.email,
          recipientEmail,
          fromCurrency,
          toCurrency,
          amount: Number(amount),
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Transfer failed.");
        setStep("form");
        return;
      }

      setTransactionId(data.transactionId);
      // Update wallet balance locally so UI reflects the deduction
      setWallets((prev) => ({
        ...prev,
        [fromCurrency]: Math.max(0, (prev[fromCurrency] ?? 0) - (preview?.totalDeducted ?? 0)),
      }));
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  // ── Reset everything ──────────────────────────────────────────────
  function handleReset() {
    setStep("form");
    setRecipientEmail("");
    setAmount("");
    setDescription("");
    setPreview(null);
    setTransactionId("");
    setError("");
  }

  // ── Loading screen ────────────────────────────────────────────────
  if (!accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#04090f]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <RefreshCw size={32} className="animate-spin text-[#0070ff]" />
          <p className="text-sm"><T>Verifying access...</T></p>
        </div>
      </div>
    );
  }

  // ── Locked screen ─────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#04090f] px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Lock size={28} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Elite Feature</T></h2>
          <p className="text-sm text-gray-500 dark:text-blue-400">
            <T>International Pay is available for Elite subscribers or users who have unlocked this feature.</T>
          </p>
          <Link
            href="/dashboard/subscription"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0070ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Crown size={14} className="text-yellow-300" />
            Get Elite Subscription
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-blue-400 hover:text-[#0070ff] transition"
        >
          <ArrowLeft size={16} /> <T>Back to Home</T>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0061ff] to-[#0095ff] text-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Globe size={28} />
            <div>
              <h1 className="text-2xl font-bold"><T>International Transfer</T></h1>
              <p className="text-sm opacity-80"><T>Send money across borders with live exchange rates</T></p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Balances */}
        {Object.keys(wallets).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-5 border border-gray-200 dark:border-blue-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-blue-400"><T>Your Wallets</T></p>
              <div className="flex items-center gap-3">
                <Link href="/international/topup" className="text-xs text-[#0070ff] font-semibold hover:underline flex items-center gap-1">
                  <PlusCircle size={13} /> Top Up
                </Link>
                <Link href="/international/cashout" className="text-xs text-[#7c3aed] font-semibold hover:underline flex items-center gap-1">
                  <ArrowDownCircle size={13} /> Cash Out
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(wallets).map(([currency, balance]) => {
                const meta = CURRENCY_META[currency as SupportedCurrency];
                if (!meta) return null;
                return (
                  <div key={currency} className="bg-gray-50 dark:bg-[#071120] rounded-xl p-3 text-center">
                    <img
                      src={`https://flagcdn.com/w40/${meta.countryCode}.png`}
                      alt={currency}
                      className="w-8 h-5 object-cover rounded mx-auto mb-1"
                    />
                    <p className="text-xs font-bold text-gray-700 dark:text-blue-200">{currency}</p>
                    <p className="text-sm font-semibold text-[#0070ff]">{meta.symbol}{(balance as number).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* No wallets yet - prompt to top up */}
        {Object.keys(wallets).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
              <Wallet size={16} />
              <span><T>You have no international wallet balance yet.</T></span>
            </div>
            <Link href="/international/topup" className="text-xs font-bold text-[#0070ff] hover:underline whitespace-nowrap flex items-center gap-1">
              <PlusCircle size={13} /> Top Up Now
            </Link>
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Form ── */}
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

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                  <T>Recipient Email</T>
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                />
              </div>

              {/* Currency selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                    <T>From Currency</T>
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as SupportedCurrency)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {CURRENCY_META[c].flag} {c} - {CURRENCY_META[c].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                    <T>To Currency</T>
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {CURRENCY_META[c].flag} {c} - {CURRENCY_META[c].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                  <T>Amount</T> ({fromCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    {CURRENCY_META[fromCurrency].symbol}
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

              {/* Description (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-blue-300 mb-1">
                  <T>Note</T> <span className="text-gray-400">(<T>optional</T>)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Family support, Business payment..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0070ff]"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePreview}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0070ff] hover:bg-[#0061ff] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? <T>Fetching Rate...</T> : <T>Preview Transfer</T>}
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === "preview" && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-blue-800 space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-blue-200"><T>Confirm Transfer</T></h2>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <Row label="Recipient" value={recipientEmail} />
                <Row label="You Send" value={`${CURRENCY_META[preview.fromCurrency].symbol}${Number(preview.amountSent).toFixed(2)} ${preview.fromCurrency}`} highlight />
                <Row label="Exchange Rate" value={`1 ${preview.fromCurrency} = ${preview.rate} ${preview.toCurrency}`} />
                <Row label="FX Fee (2%)" value={`${CURRENCY_META[preview.fromCurrency].symbol}${Number(preview.fee).toFixed(2)} ${preview.fromCurrency}`} />
                <Row label="Total Deducted" value={`${CURRENCY_META[preview.fromCurrency].symbol}${Number(preview.totalDeducted).toFixed(2)} ${preview.fromCurrency}`} />
                <div className="border-t border-gray-200 dark:border-blue-800 pt-3">
                  <Row label="Recipient Gets" value={`${CURRENCY_META[preview.toCurrency].symbol}${Number(preview.amountReceived).toFixed(2)} ${preview.toCurrency}`} highlight />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 font-medium hover:bg-gray-50 dark:hover:bg-blue-900/30 transition"
                >
                  <T>Back</T>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0070ff] hover:bg-[#0061ff] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {loading ? <T>Processing...</T> : <T>Confirm & Send</T>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === "success" && preview && (
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

              <h2 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Transfer Successful!</T></h2>
              <p className="text-gray-500 dark:text-blue-300 text-sm">
                <T>You sent</T> <strong>{CURRENCY_META[preview.fromCurrency].symbol}{Number(preview.amountSent).toFixed(2)} {preview.fromCurrency}</strong> →{" "}
                <strong>{CURRENCY_META[preview.toCurrency].symbol}{Number(preview.amountReceived).toFixed(2)} {preview.toCurrency}</strong>
              </p>

              <div className="bg-gray-50 dark:bg-[#071120] rounded-xl p-3 text-xs text-gray-400 dark:text-blue-400 font-mono break-all">
                {transactionId}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full bg-[#0070ff] hover:bg-[#0061ff] text-white font-semibold py-3 rounded-xl transition"
              >
                <T>Make Another Transfer</T>
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Wallet info hint + Top Up / Cash Out links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between gap-2 text-sm text-gray-500 dark:text-blue-400 bg-white dark:bg-[#0c1a2b] rounded-xl p-4 border border-gray-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2">
            <Wallet size={16} />
            <span><T>Need to fund your wallet first?</T></span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/international/topup"
              className="flex items-center gap-1 text-[#0070ff] font-semibold hover:underline whitespace-nowrap text-sm"
            >
              <PlusCircle size={15} /> Top Up
            </Link>
            <Link
              href="/international/cashout"
              className="flex items-center gap-1 text-[#7c3aed] font-semibold hover:underline whitespace-nowrap text-sm"
            >
              <ArrowDownCircle size={15} /> Cash Out
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ── Small helper component ────────────────────────────────────────────
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 dark:text-blue-400"><T>{label}</T></span>
      <span className={`font-medium ${highlight ? "text-[#0070ff] dark:text-[#00b4ff] text-base" : "text-gray-800 dark:text-blue-100"}`}>
        {value}
      </span>
    </div>
  );
}

