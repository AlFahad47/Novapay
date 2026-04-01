"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, RefreshCw, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import T from "@/components/T";
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

export default function AdminCampaignsPage() {
  const { data: session } = useSession();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const res = await fetch("/api/donation/campaigns");
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setFormError("");
    setFormSuccess("");

    if (!title || !goalAmount) {
      setFormError("Title and goal amount are required.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: session?.user?.email,
          title,
          description,
          image,
          goalAmount: Number(goalAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Failed to create campaign.");
        return;
      }

      setFormSuccess("Campaign created successfully!");
      setTitle("");
      setDescription("");
      setImage("");
      setGoalAmount("");
      setShowForm(false);
      fetchCampaigns();
    } catch {
      setFormError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(campaignId: string, currentActive: boolean) {
    try {
      await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: session?.user?.email,
          campaignId,
          active: !currentActive,
        }),
      });
      setCampaigns((prev) =>
        prev.map((c) => (c._id === campaignId ? { ...c, active: !currentActive } : c))
      );
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-blue-100"><T>Donation Campaigns</T></h1>
          <p className="text-sm text-gray-500 dark:text-blue-400 mt-0.5"><T>Create and manage donation campaigns</T></p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setShowForm(!showForm); setFormError(""); setFormSuccess(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e63b60] hover:bg-[#cf2f52] text-white text-sm font-semibold rounded-xl transition"
        >
          <Plus size={16} /> <T>New Campaign</T>
        </motion.button>
      </div>

      {/* Success banner */}
      {formSuccess && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-sm">
          <CheckCircle2 size={16} /> {formSuccess}
        </div>
      )}

      {/* Create Campaign Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 border border-gray-200 dark:border-blue-800 space-y-4"
          >
            <h2 className="font-semibold text-gray-800 dark:text-blue-100"><T>Create New Campaign</T></h2>

            {formError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-blue-400 mb-1"><T>Campaign Title *</T></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Red Crescent Flood Relief"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63b60]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-blue-400 mb-1"><T>Goal Amount (৳) *</T></label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="500000"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63b60]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-blue-400 mb-1"><T>Description</T></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the campaign..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63b60] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-blue-400 mb-1"><T>Image URL (optional)</T></label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-blue-800 bg-gray-50 dark:bg-[#071120] text-gray-800 dark:text-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63b60]"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-blue-900/20 transition"
              >
                <T>Cancel</T>
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e63b60] hover:bg-[#cf2f52] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
              >
                {creating ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                {creating ? <T>Creating...</T> : <T>Create Campaign</T>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-[#e63b60]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-blue-400">
          <Heart size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm"><T>No campaigns yet. Create your first one.</T></p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const progress = campaign.goalAmount > 0
              ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
              : 0;

            return (
              <div
                key={campaign._id}
                className="bg-white dark:bg-[#0c1a2b] rounded-2xl p-5 border border-gray-200 dark:border-blue-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-blue-100 text-sm truncate">
                        <T>{campaign.title}</T>
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${campaign.active ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {campaign.active ? <T>Active</T> : <T>Inactive</T>}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-xs text-gray-400 dark:text-blue-400 mt-0.5 line-clamp-1"><T>{campaign.description}</T></p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggle(campaign._id, campaign.active)}
                    className={`flex-shrink-0 transition ${campaign.active ? "text-green-500 hover:text-gray-400" : "text-gray-400 hover:text-green-500"}`}
                    title={campaign.active ? "Deactivate" : "Activate"}
                  >
                    {campaign.active
                      ? <ToggleRight size={28} />
                      : <ToggleLeft size={28} />
                    }
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#e63b60] to-[#ff6b8a] rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-blue-400">
                    <span>৳{formatAmount(campaign.raisedAmount)} <T>raised</T> · {formatAmount(campaign.donorCount)} <T>donors</T></span>
                    <span><T>Goal</T>: ৳{formatAmount(campaign.goalAmount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

