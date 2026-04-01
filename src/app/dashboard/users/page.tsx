"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "@/lib/brandAlert";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Globe, CreditCard, Landmark, X, Lock } from "lucide-react";
import T from "@/components/T";

type UserType = {
  name?: string;
  email?: string;
  country?: string;
  currency?: string;
  idNo?: string;
  phone?: string;
  nid?: string;
  bank?: string;
  image?: string;
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`relative bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-blue-700/50 rounded-2xl shadow-md dark:shadow-blue-900/40 p-6 transition ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserType>({});
  const [loading, setLoading] = useState(true);

  // Fetch User Data from MongoDB
  const fetchUserData = async () => {
    if (session?.user?.email) {
      try {
        const res = await fetch(`/api/kyc?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const dbData = await res.json();
        const kyc = dbData.kycDetails || {};

        setUserData({
          name: dbData.name || kyc.fullName || session?.user?.name || "User",
          email: dbData.email || session?.user?.email || "",
          image: dbData.image || session?.user?.image || "",
          phone: kyc.phone || "Not Set",
          country: kyc.nationality || "Not Set",
          currency: dbData.currency || "BDT",
          idNo: kyc.idNumber || "Not Set",
          nid: kyc.idNumber || "Not Set",
          bank: dbData.bank || "Not Linked", // Fetching bank field from root level
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Save changes including Bank Account Info
  const handleSave = async () => {
    try {
      // Show loading state while processing
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          fullName: userData.name, 
          phone: userData.phone,
          nationality: userData.country,
          idNumber: userData.idNo,
          currency: userData.currency,
          bank: userData.bank, // Passing bank data to backend
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        await Swal.fire({
          title: "Profile Updated!",
          text: "Your information has been saved successfully.",
          icon: "success",
          confirmButtonColor: "#0095ff",
          background: "#0c1a2b",
          color: "#fff",
        });
        fetchUserData(); // Refresh dashboard with new data
      } else {
        Swal.fire("Error", "Failed to save changes", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Connection lost", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[#04090f] dark:text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-xl font-bold"><T>Loading Profile...</T></p>
    </div>
  );

  return (
    <motion.div
      className="min-h-screen p-8 bg-gray-50 dark:bg-[#04090f] text-gray-800 dark:text-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-8"
      >
        <T>User Dashboard</T>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center gap-4">
            {userData.image ? (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Image
                  src={userData.image}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-4 border-blue-500 dark:border-[#0095ff]"
                  priority
                />
              </motion.div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#0095ff] to-[#0061ff] flex items-center justify-center text-white text-3xl font-bold">
                {userData.name?.charAt(0) || "U"}
              </div>
            )}

            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p className="text-gray-500 dark:text-blue-300">{userData.email}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0095ff] hover:bg-[#0070ff] text-white rounded-xl transition shadow-lg shadow-blue-500/20"
            >
              <T>Edit Profile</T>
            </motion.button>
          </div>
        </Card>

        <div className="lg:col-span-2 grid gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> <T>Personal Information</T>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <Info icon={User} label="Full Name" value={userData.name || "Not provided"} />
              <Info icon={Mail} label="Email" value={userData.email || "Not provided"} />
              <Info icon={Phone} label="Phone" value={userData.phone || "Not provided"} />
              <Info icon={Globe} label="Country" value={userData.country || "Not provided"} />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> <T>Financial Details</T>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <Info icon={CreditCard} label="Currency" value={userData.currency || "Not provided"} />
              <Info icon={User} label="NID / ID Number" value={userData.idNo || "Not provided"} />
              <Info icon={Landmark} label="Bank Account" value={userData.bank || "Not provided"} />
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-blue-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl pointer-events-auto overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white"><T>Update Profile</T></h2>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-blue-900/40 rounded-full transition">
                    <X className="w-6 h-6 text-gray-500 dark:text-blue-300" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input label="Full Name" name="name" value={userData.name || ""} onChange={handleChange} />
                  <Input label="Phone Number" name="phone" value={userData.phone || ""} onChange={handleChange} />
                  <Input label="Country/Nationality" name="country" value={userData.country || ""} onChange={handleChange} />
                  
                  {/* NID Input - Read Only  */}
                  <div className="relative">
                    <Input label="ID / NID Number (Locked)" name="idNo" value={userData.idNo || ""} onChange={() => {}} readOnly={true} />
                    <Lock className="absolute right-3 top-9 w-4 h-4 text-gray-400" />
                  </div>

                  <Input label="Currency" name="currency" value={userData.currency || ""} onChange={handleChange} />
                  <Input label="Bank Account Info" name="bank" value={userData.bank || ""} onChange={handleChange} />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="mt-8 w-full bg-[#0095ff] hover:bg-[#0070ff] text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-500/30"
                >
                  <T>Save Changes</T>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-blue-900/20 border border-gray-200 dark:border-blue-700/40">
      <div className="p-2 bg-white dark:bg-[#0c1a2b] rounded-lg shadow-sm">
        <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-gray-500 dark:text-blue-300 text-xs font-medium uppercase tracking-wider"><T>{label}</T></p>
        <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, readOnly = false }: { label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; readOnly?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600 dark:text-blue-300 mb-1 block"><T>{label}</T></label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-[#0095ff] ${
          readOnly 
            ? "bg-gray-200 dark:bg-blue-900/40 cursor-not-allowed text-gray-500 border-transparent" 
            : "bg-gray-50 dark:bg-blue-900/10 border-gray-300 dark:border-blue-700/40 text-gray-800 dark:text-white"
        }`}
      />
    </div>
  );
}
