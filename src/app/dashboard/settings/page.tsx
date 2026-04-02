"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import T from "@/components/T";
import {
  User,
  Shield,
  Bell,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Loader2,
  X,
  Menu,
} from "lucide-react";

type TabType = "profile" | "security" | "notifications";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    bio: "",
    phone: "",
    location: "",
  });

  // Notifications state (will be saved locally)
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: true,
    push: false,
    marketing: false,
  });

  // Fetch live data from MongoDB
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/user/update?email=${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            image: data.image || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: data.bio || "",
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [session]);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading notifications:", e);
      }
    }
  }, []);

  // Save notifications to localStorage
  const handleNotificationChange = (key: string) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    };
    setNotifications(updated);
    localStorage.setItem("notificationPreferences", JSON.stringify(updated));
    setMessage({ type: "success", text: "Notification settings saved!" });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 2MB" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to update database");

      // CRITICAL: Update the session to reflect changes globally (Navbar, etc.)
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: formData.image,
        },
      });

      setMessage({ type: "success", text: "Profile updated everywhere!" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: "Update failed. Try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070d17]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Loader2 className="w-10 h-10 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070d17] via-[#0c1a2b] to-[#051119] text-gray-200 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              <T>Settings</T>
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              <T>Personalize your NovaPay experience</T>
            </p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 rounded-2xl font-bold border text-sm backdrop-blur-md ${
                  message.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-lg shadow-green-500/10"
                    : "bg-red-500/10 border-red-500/30 text-red-400 shadow-lg shadow-red-500/10"
                }`}
              >
                <CheckCircle2 size={18} /> {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar - Scrollable on Mobile */}
          <aside className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User size={20} />}
              label="Profile"
            />
            <TabButton
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              icon={<Shield size={20} />}
              label="Security"
            />
            <TabButton
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
              icon={<Bell size={20} />}
              label="Alerts"
            />
          </aside>

          {/* Form Content */}
          <main className="lg:col-span-9 bg-gradient-to-br from-[#0c1a2b] to-[#051119] border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleUpdate}
                  className="p-6 md:p-10 lg:p-12 space-y-10"
                >
                  {/* Photo Section */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 20 }} className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-700/30">
                    <div className="relative group">
                      <motion.div whileHover={{ scale: 1.05 }} className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-blue-500/30 shadow-2xl relative">
                        <Image
                          src={formData.image || "/dashboard.jfif"}
                          alt="Avatar"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </motion.div>
                      <motion.label whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl cursor-pointer hover:shadow-xl shadow-lg transition-all">
                        <Camera size={22} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </motion.label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {formData.name || "User"}
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold mt-1">
                        <T>Premium Member</T>
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        <T>Click camera icon to update photo</T>
                      </p>
                    </div>
                  </motion.div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <InputField
                        label="Full Name"
                        value={formData.name}
                        icon={<User size={20} />}
                        onChange={(v: string) =>
                          setFormData({ ...formData, name: v })
                        }
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <InputField
                        label="Email Address"
                        value={session?.user?.email || ""}
                        icon={<Mail size={20} />}
                        disabled
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                      <InputField
                        label="Phone Number"
                        value={formData.phone}
                        icon={<Phone size={20} />}
                        onChange={(v: string) =>
                          setFormData({ ...formData, phone: v })
                        }
                        placeholder="+880..."
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                      <InputField
                        label="Location"
                        value={formData.location}
                        icon={<MapPin size={20} />}
                        onChange={(v: string) =>
                          setFormData({ ...formData, location: v })
                        }
                        placeholder="Dhaka, Bangladesh"
                      />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2 space-y-3">
                      <label className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <span>✍️</span>
                        <T>Biography</T>
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="w-full p-4 md:p-5 bg-white/5 border-2 border-slate-700/50 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-32 resize-none transition-all text-sm md:text-base text-white placeholder:text-gray-500 hover:border-slate-600/70"
                        placeholder="Share something about yourself..."
                      />
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-slate-700/30">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-8 py-3 rounded-xl font-semibold text-gray-300 bg-slate-700/20 hover:bg-slate-700/40 transition-all border border-slate-600/50 hover:border-slate-600"
                    >
                      <T>Cancel</T>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <T>Saving...</T>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <T>Save Changes</T>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              ) : activeTab === "security" ? (
                <SecurityTab />
              ) : (
                <NotificationsTab notifications={notifications} onNotificationChange={handleNotificationChange} />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-2xl font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/30"
          : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300 border border-transparent hover:border-slate-700/50"
      }`}
    >
      {icon} <span className="text-sm md:text-base"><T>{label}</T></span>
    </motion.button>
  );
}

function InputField({
  label,
  value,
  icon,
  disabled,
  onChange,
  placeholder,
}: any) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider ml-1">
        <T>{label}</T>
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
          {icon}
        </div>
        <input
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full pl-12 pr-5 py-3 md:py-4 bg-white/5 border-2 border-slate-700/50 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm md:text-base text-white placeholder:text-gray-500 hover:border-slate-600/70"
        />
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 lg:p-12 space-y-8 flex flex-col items-center justify-center min-h-[500px]"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl mb-6"
      >
        🔐
      </motion.div>
      <div className="text-center max-w-md">
        <h3 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <Shield className="text-blue-400" size={28} />
          <T>Security Features</T>
        </h3>
        <p className="text-gray-400 text-lg mb-8">
          <T>We're building advanced security features to protect your account</T>
        </p>

        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-6 mb-6">
          <p className="text-blue-300 font-semibold text-lg">
            <T>Coming Soon</T> ⏳
          </p>
          <p className="text-gray-400 text-sm mt-2">
            <T>Two-Factor Authentication • Password Manager • Login Security • Session Control</T>
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold cursor-pointer"
        >
          <T>Get Notified When Ready</T>
        </motion.div>
      </div>
    </motion.div>
  );
}

function NotificationsTab({ notifications, onNotificationChange }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 lg:p-12 space-y-8"
    >
      <div>
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Bell className="text-blue-400" size={24} />
          <T>Notification Preferences</T>
        </h3>
        <p className="text-gray-400"><T>Control how and when you receive notifications</T></p>
      </div>

      <div className="space-y-4">
        {[
          { key: "email", label: "📧 Email Notifications", desc: "Receive updates via email" },
          { key: "sms", label: "📱 SMS Alerts", desc: "Get text message alerts" },
          { key: "push", label: "🔔 Push Notifications", desc: "Browser push notifications" },
          { key: "marketing", label: "📢 Marketing Emails", desc: "Promotions and offers" },
        ].map((item) => (
          <motion.div
            key={item.key}
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 md:p-5 bg-white/5 border border-slate-700/50 rounded-2xl hover:border-slate-600/70 transition-all"
          >
            <div>
              <p className="font-semibold text-white text-sm md:text-base">{item.label}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
            <button
              onClick={() => onNotificationChange(item.key)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                notifications[item.key as keyof typeof notifications]
                  ? "bg-blue-600"
                  : "bg-slate-600/50"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  notifications[item.key as keyof typeof notifications]
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
