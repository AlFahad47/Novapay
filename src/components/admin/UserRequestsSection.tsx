"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  User as UserIcon,
} from "lucide-react";
import Swal from "@/lib/brandAlert";
import { Button } from "@/components/ui/button";

type User = {
  name: string;
  email: string;
  role?: string;
  country?: string;
  kycStatus?: string;
};

export default function UserRequestsSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/kyc");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch Users Error:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const pendingUsers = users.filter(
    (u) => u.kycStatus === "pending" || u.kycStatus === "Pending",
  );

  const handleAction = async (
    email: string,
    action: "Accepted" | "Rejected" | "Fraud",
  ) => {
    const result = await Swal.fire({
      title: `Confirm ${action}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor:
        action === "Accepted"
          ? "#22c55e"
          : action === "Rejected"
            ? "#ef4444"
            : "#f97316",
      confirmButtonText: `Yes, ${action}`,
    });

    if (!result.isConfirmed) return;

    try {
      await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status: action }),
      });

      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, kycStatus: action } : u)),
      );

      Swal.fire({
        title: `User ${action}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700 border-green-300";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "Fraud":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "pending":
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading user data...
      </div>
    );

  return (
    <div className="space-y-10">
      {/* ========================= */}
      {/* 🔵 PENDING KYC SECTION */}
      {/* ========================= */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Pending KYC Verification
          </h3>

          <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            {pendingUsers.length} Pending
          </span>
        </div>

        {pendingUsers.length === 0 && (
          <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500">
            No users are waiting for KYC approval.
          </div>
        )}

        <div className="grid gap-6">
          {pendingUsers.map((user) => (
            <motion.div
              key={user.email}
              layout
              className="p-6 rounded-2xl bg-white dark:bg-[#0c1a2b] shadow-lg border border-gray-100 dark:border-blue-900"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon size={18} />
                    <h4 className="font-semibold text-lg">{user.name}</h4>
                  </div>

                  <p className="text-sm text-gray-500">{user.email}</p>

                  <div className="flex gap-3 mt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      {user.role || "User"}
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(
                        user.kycStatus,
                      )}`}
                    >
                      {user.kycStatus}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => handleAction(user.email, "Accepted")}
                    variant="success"
                    className="rounded-xl"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>

                  <Button
                    onClick={() => handleAction(user.email, "Rejected")}
                    variant="destructive"
                    className="rounded-xl"
                  >
                    <XCircle size={16} />
                    Reject
                  </Button>

                  <Button
                    onClick={() => handleAction(user.email, "Fraud")}
                    variant="warning"
                    className="rounded-xl"
                  >
                    <AlertTriangle size={16} />
                    Mark Fraud
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* 🟣 COLLAPSIBLE USER LIST */}
      {/* ========================= */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1a2b] shadow-lg border p-6">
        <Button
          onClick={() => setShowAllUsers(!showAllUsers)}
          variant="ghost"
          className="flex w-full justify-between items-center h-auto px-0 py-0"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield size={18} />
            All Registered Users
          </h3>

          {showAllUsers ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </Button>

        <AnimatePresence>
          {showAllUsers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              {users.map((user) => (
                <div
                  key={user.email}
                  className="flex justify-between items-center p-4 rounded-xl border bg-gray-50 dark:bg-[#0a1624]"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      {user.role || "User"}
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(
                        user.kycStatus,
                      )}`}
                    >
                      {user.kycStatus || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

