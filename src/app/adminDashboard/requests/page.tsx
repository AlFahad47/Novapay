"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  kycDetails: any;
};

export default function AdminRequestsPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function loadRequests() {
    const res = await fetch("/api/admin/requests");
    const data = await res.json();
    setUsers(data.users);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadRequests();
  }

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          KYC Requests
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Review and verify user identity submissions
        </p>
      </div>

      {/* NO REQUESTS */}
      {users.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No pending requests
        </div>
      )}

      {/* REQUEST LIST */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition"
          >
            {/* USER INFO */}
            <div className="space-y-2 mb-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {user.name}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Phone: {user.kycDetails?.phone || "N/A"}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 mt-4">
              {/* APPROVE */}
              <button
                onClick={() => updateStatus(user._id, "approved")}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg transition"
              >
                <CheckCircle size={16} />
                Approve
              </button>

              {/* REJECT */}
              <button
                onClick={() => updateStatus(user._id, "rejected")}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded-lg transition"
              >
                <XCircle size={16} />
                Reject
              </button>

              {/* FRAUD */}
              <button
                onClick={() => updateStatus(user._id, "fraud")}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition"
              >
                <AlertTriangle size={16} />
                Fraud
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}