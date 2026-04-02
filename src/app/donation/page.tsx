"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Target, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, X, Crown, Lock } from "lucide-react";
import T from "@/components/T";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAmount } from "@/lib/utils";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  image: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  active: boolean;
}

export default function DonationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Access guard
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // User BDT balance + international wallets
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userWallets, setUserWallets] = useState<Record<string, number>>({});

  // Donate modal state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ transactionId: string; campaignTitle: string; amount: number } | null>(null);

  // ── Access Guard: subscription check ─────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }
    fetch(`/api/subscription/status?email=${session.user.email}`)
      .then((r) => r.json())
      .then((data) => {
        setHasAccess(data?.subscribed === true);
        setAccessChecked(true);
      })
      .catch(() => setAccessChecked(true));
  }, [session, status, router]);

  // ── Fetch campaigns + user balance (only if access granted) ───────
  useEffect(() => {
    if (!hasAccess || !session?.user?.email) return;
    Promise.all([
      fetch("/api/donation/campaigns").then((r) => r.json()),
      fetch(`/api/user/update?email=${session.user.email}`).then((r) => r.json()),
    ]).then(([campaignData, userData]) => {
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      setUserBalance(userData?.balance ?? 0);
      setUserWallets(userData?.wallets ?? {});
      setLoadingCampaigns(false);
    }).catch(() => setLoadingCampaigns(false));
  }, [hasAccess, session]);

  function openModal(campaign: Campaign) {
    setSelectedCampaign(campaign);
    setAmount("");
    setError("");
    setSuccess(null);
  }

  function closeModal() {
    setSelectedCampaign(null);
    setAmount("");
    setError("");
    setSuccess(null);
  }

  async function handleDonate() {
    if (!session?.user?.email) {
      setError("Please log in to donate.");
      return;
    }
    if (!amount || Number(amount) < 10) {
      setError("Minimum donation is ৳10.");
      return;
    }
    if (Number(amount) > userBalance) {
      const hasForeignWallet = Object.values(userWallets).some((b) => (b as number) > 0);
      if (hasForeignWallet) {
        setError("CASHOUT_NEEDED");
      } else {
        setError("Insufficient BDT balance. Please add funds to your account.");
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/donation/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          campaignId: selectedCampaign?._id,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Donation failed. Please try again.");
        return;
      }

      // Update campaign in local state
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === selectedCampaign?._id
            ? { ...c, raisedAmount: c.raisedAmount + Number(amount), donorCount: c.donorCount + 1 }
            : c
        )
      );

      setUserBalance((prev) => prev - Number(amount));
      setSuccess({
        transactionId: data.transactionId,
        campaignTitle: data.campaignTitle,
        amount: data.amount,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const QUICK_AMOUNTS = [50, 100, 200, 500];

  // ── Verifying access ──────────────────────────────────────────────
  if (!accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#04090f]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <RefreshCw size={32} className="animate-spin text-[#e63b60]" />
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
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
            <Lock size={28} className="text-[#e63b60]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Elite Feature</T></h2>
          <p className="text-sm text-gray-500 dark:text-blue-400">
            <T>Donation is available for Elite subscribers. Subscribe to unlock and support campaigns.</T>
          </p>
          <Link
            href="/dashboard/subscription"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e63b60] hover:bg-[#cf2f52] text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Crown size={14} className="text-yellow-300" />
            <T>Get Elite Subscription</T>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-blue-400 hover:text-[#0070ff] transition">
          <ArrowLeft size={16} /> <T>Back to Home</T>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#e63b60] to-[#ff6b8a] text-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Heart size={28} />
            <div>
              <h1 className="text-2xl font-bold"><T>Donate</T></h1>
              <p className="text-sm opacity-80"><T>Support campaigns and make a difference today</T></p>
            </div>
          </div>
        </motion.div>

        {/* Campaign List */}
        {loadingCampaigns ? (
          <div className="flex justify-center py-16">
            <RefreshCw size={28} className="animate-spin text-[#e63b60]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-blue-400">
            <Heart size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm"><T>No active campaigns right now. Check back soon.</T></p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {campaigns.map((campaign, i) => {
              const progress = campaign.goalAmount > 0
                ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
                : 0;

              return (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px rgba(230,59,96,0.18)" }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-[#111c2e] rounded-2xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden shadow-sm cursor-pointer"
                >
                  {/* Campaign image */}
                  {campaign.image ? (
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-pink-100 to-red-100 dark:from-[#2a0d1a] dark:to-[#1a0a1f] flex items-center justify-center">
                      <Heart size={40} className="text-[#e63b60] opacity-60" />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-gray-800 dark:text-blue-100 text-sm leading-snug">
                      <T>{campaign.title}</T>
                    </h3>

                    {campaign.description && (
                      <p className="text-xs text-gray-500 dark:text-blue-400 line-clamp-2">
                        <T>{campaign.description}</T>
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-gray-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.07 }}
                          className="h-full bg-gradient-to-r from-[#e63b60] to-[#ff6b8a] rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-blue-400">
                        <span className="font-semibold text-[#e63b60]">
                          ৳{formatAmount(campaign.raisedAmount)} <T>raised</T>
                        </span>
                        <span><T>of</T> ৳{formatAmount(campaign.goalAmount)}</span>
                      </div>
                    </div>

                    {/* Donor count */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-blue-500">
                      <Users size={12} />
                      <span>{formatAmount(campaign.donorCount)} <T>people donated</T></span>
                    </div>

                    {/* Donate button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openModal(campaign)}
                      className="w-full flex items-center justify-center gap-2 bg-[#e63b60] hover:bg-[#cf2f52] text-white text-sm font-semibold py-2.5 rounded-xl transition"
                    >
                      <Heart size={14} /> <T>Donate Now</T>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Donate Modal ── */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-blue-800 space-y-5"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-blue-100 text-base leading-snug">
                    <T>{selectedCampaign.title}</T>
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-blue-400 mt-0.5">
                    ৳{formatAmount(selectedCampaign.raisedAmount)} <T>raised so far</T>
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-blue-200 transition">
                  <X size={18} />
                </button>
              </div>

              {/* Success state */}
              {success ? (
                <div className="text-center space-y-3 py-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 size={30} className="text-green-500" />
                  </motion.div>
                  <h3 className="font-bold text-gray-800 dark:text-blue-100"><T>Thank you!</T></h3>
                  <p className="text-sm text-gray-500 dark:text-blue-400">
                    <T>You donated</T> <strong className="text-[#e63b60]">৳{formatAmount(success.amount)}</strong> <T>to</T> {success.campaignTitle}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{success.transactionId}</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={closeModal}
                    className="w-full bg-[#e63b60] hover:bg-[#cf2f52] text-white font-semibold py-2.5 rounded-xl transition text-sm"
                  >
                    <T>Done</T>
                  </motion.button>
                </div>
              ) : (
                <>
                  {error && error === "CASHOUT_NEEDED" ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-sm space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                        <AlertCircle size={15} /> <T>Insufficient BDT balance</T>
                      </div>
                      <p className="text-amber-700 dark:text-amber-300 text-xs">
                        <T>You have foreign currency in your international wallets. Cash out to BDT first, then donate.</T>
                      </p>
                      <a
                        href="/international/cashout"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:underline"
                      >
                        <T>Go to Cash Out</T> →
                      </a>
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm">
                      <AlertCircle size={15} /> {error}
                    </div>
                  ) : null}

                  {/* BDT Balance info */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#071120] rounded-xl px-3 py-2.5 border border-gray-200 dark:border-blue-900">
                    <span className="text-xs text-gray-500 dark:text-blue-400"><T>Your BDT Balance</T></span>
                    <span className="text-sm font-bold text-gray-800 dark:text-blue-100">৳{formatAmount(userBalance)}</span>
                  </div>

                  {/* Quick amounts */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-blue-400 mb-2"><T>Quick select</T></p>
                    <div className="grid grid-cols-4 gap-2">
                      {QUICK_AMOUNTS.map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(String(q))}
                          className={`py-2 rounded-xl text-sm font-semibold border transition ${
                            amount === String(q)
                              ? "bg-[#e63b60] text-white border-[#e63b60]"
                              : "bg-gray-50 dark:bg-[#071120] text-gray-700 dark:text-blue-200 border-gray-200 dark:border-blue-800 hover:border-[#e63b60]"
                          }`}
                        >
                          ৳{q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-blue-400 mb-1">
                      <T>Or enter amount (৳)</T>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="৳ 0"
                      min="10"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-[#e63b60] text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1"><T>Minimum ৳10</T></p>
                  </div>

                  {/* Goal info */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-blue-500 bg-gray-50 dark:bg-[#071120] rounded-xl p-3">
                    <Target size={13} />
                    <span><T>Goal</T>: ৳{formatAmount(selectedCampaign.goalAmount)}</span>
                    <span>·</span>
                    <span>{formatAmount(selectedCampaign.donorCount)} <T>donors</T></span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDonate}
                    disabled={loading || !amount || Number(amount) < 10}
                    className="w-full flex items-center justify-center gap-2 bg-[#e63b60] hover:bg-[#cf2f52] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm"
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Heart size={16} />}
                    {loading ? <T>Processing...</T> : <><T>Donate</T> ৳{formatAmount(amount || "0")}</>}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

