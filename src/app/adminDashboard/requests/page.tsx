"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import T from "@/components/T";
import Swal from "sweetalert2";

type KycDetails = {
  phone?: string;
  status?: string;
  nid?: string;
};

type User = {
  _id: string;
  name: string;
  email: string;

  image?: string; // ✅ ADDED

  kycDetails?: KycDetails;
};

export default function AdminRequestsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1); // ✅ PAGINATION
  const usersPerPage = 6;

  async function loadRequests() {
    try {
      const res = await fetch("/api/admin/requests");

      if (!res.ok) throw new Error("Failed to fetch requests");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading requests:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load KYC requests",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return users.slice(start, start + usersPerPage);
  }, [users, currentPage]);

  async function updateStatus(id: string, status: string) {
    const action =
      status === "approved"
        ? "Approve"
        : status === "rejected"
          ? "Reject"
          : "Mark as Fraud";

    const result = await Swal.fire({
      title: `${action} this user?`,
      text: "This action will update the KYC status.",
      icon: status === "fraud" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor:
        status === "approved"
          ? "#16a34a"
          : status === "rejected"
            ? "#eab308"
            : "#ef4444",
      confirmButtonText: action,
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(id);

      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text: `User successfully ${action.toLowerCase()}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      loadRequests();
    } catch (error) {
      console.error("Update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong.",
      });
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          <T>KYC Requests</T>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          <T>Review and verify user identity submissions</T>
        </p>
      </div>

      {/* EMPTY */}
      {users.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <T>No pending requests</T>
        </div>
      )}

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedUsers.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <div className="relative bg-white dark:bg-[#0c1a2b] rounded-2xl p-6 shadow-xl hover:shadow-2xl transition">
              {/* HEADER */}
              <div className="flex items-center gap-4 mb-4">
                {/* ✅ PROFILE IMAGE */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* BASIC INFO */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <Info label="User ID" value={user._id.slice(-6)} />
                <Info label="Phone" value={user.kycDetails?.phone || "N/A"} />
                <Info label="Email" value={user.email} />
                <Info
                  label="Status"
                  value={user.kycDetails?.status || "pending"}
                />
              </div>

              {/* KYC DETAILS */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-[#08111f] dark:to-[#0f1f35] border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  <T>KYC DETAILS</T>
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info
                    label="NID Number"
                    value={user.kycDetails?.nid || "Not Provided"}
                  />
                  <Info label="Phone" value={user.kycDetails?.phone || "N/A"} />
                </div>
              </div>

              {/* STATUS BADGE */}
              {user.kycDetails?.status && (
                <div className="mt-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium
                    ${
                      user.kycDetails.status === "approved"
                        ? "bg-green-500/20 text-green-600"
                        : user.kycDetails.status === "rejected"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : user.kycDetails.status === "fraud"
                            ? "bg-red-500/20 text-red-600"
                            : "bg-gray-400/20 text-gray-600"
                    }`}
                  >
                    {user.kycDetails.status.toUpperCase()}
                  </span>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 mt-5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={processing === user._id}
                  onClick={() => updateStatus(user._id, "approved")}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg"
                >
                  <CheckCircle size={16} />
                  <T>Approve</T>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={processing === user._id}
                  onClick={() => updateStatus(user._id, "rejected")}
                  className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded-lg"
                >
                  <XCircle size={16} />
                  <T>Reject</T>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={processing === user._id}
                  onClick={() => updateStatus(user._id, "fraud")}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg"
                >
                  <AlertTriangle size={16} />
                  <T>Fraud</T>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ PAGINATION UI */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-[#111c2d]"
        >
          <T>Prev</T>
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-[#111c2d]"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-[#111c2d]"
        >
          <T>Next</T>
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-50 dark:bg-[#08111f] p-3 rounded-lg"
    >
      <p className="text-xs text-gray-500"><T>{label}</T></p>
      <p className="font-medium break-words">{value}</p>
    </motion.div>
  );
}
