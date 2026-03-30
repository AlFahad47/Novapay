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
    <div className="min-h-screen bg-[#070d17] text-gray-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              <T>Settings</T>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              <T>Manage your global profile settings</T>
            </p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold border text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <CheckCircle2 size={16} /> {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar - Scrollable on Mobile */}
          <aside className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User size={18} />}
              label="Profile"
            />
            <TabButton
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              icon={<Shield size={18} />}
              label="Security"
            />
            <TabButton
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
              icon={<Bell size={18} />}
              label="Alerts"
            />
          </aside>

          {/* Form Content */}
          <main className="lg:col-span-9 bg-[#0c1a2b] border border-gray-800 rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleUpdate}
                  className="p-6 md:p-10 lg:p-12 space-y-8 md:space-y-10"
                >
                  {/* Photo Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                    <div className="relative group">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden ring-4 ring-blue-500/20 shadow-2xl relative">
                        <Image
                          src={formData.image || "/dashboard.jfif"}
                          alt="Avatar"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <label className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-xl cursor-pointer hover:bg-blue-500 transition-all shadow-lg hover:scale-110 active:scale-90">
                        <Camera size={20} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl md:text-2xl font-bold text-white">
                        {formData.name || "User"}
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wider font-semibold">
                        <T>Administrator</T>
                      </p>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <InputField
                      label="Full Name"
                      value={formData.name}
                      icon={<User size={18} />}
                      onChange={(v: string) =>
                        setFormData({ ...formData, name: v })
                      }
                    />
                    <InputField
                      label="Email Address"
                      value={session?.user?.email || ""}
                      icon={<Mail size={18} />}
                      disabled
                    />
                    <InputField
                      label="Phone Number"
                      value={formData.phone}
                      icon={<Phone size={18} />}
                      onChange={(v: string) =>
                        setFormData({ ...formData, phone: v })
                      }
                      placeholder="+880..."
                    />
                    <InputField
                      label="Location"
                      value={formData.location}
                      icon={<MapPin size={18} />}
                      onChange={(v: string) =>
                        setFormData({ ...formData, location: v })
                      }
                      placeholder="Dhaka, Bangladesh"
                    />

                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide">
                        <T>Biography</T>
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="w-full p-4 md:p-5 bg-gray-900/50 border border-gray-700 rounded-2xl md:rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-32 resize-none transition-all text-sm md:text-base"
                        placeholder="Describe yourself..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl md:rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Save size={20} />
                      )}
                      <T>Save Changes</T>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <div className="p-20 text-center opacity-50 font-bold italic">
                  <T>Feature coming soon...</T>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// Reusable Components with Responsive Styles
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
      }`}
    >
      {icon} <span className="text-sm md:text-base"><T>{label}</T></span>
    </button>
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
    <div className="space-y-2">
      <label className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide ml-1">
        <T>{label}</T>
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
        <input
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full pl-12 pr-5 py-3 md:py-4 bg-gray-900/50 border border-gray-700 rounded-xl md:rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-40 text-sm md:text-base"
        />
      </div>
    </div>
  );
}
