"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;

  kycStatus?: string;
  accountStatus?: string;

  phone?: string;
  nid?: string;

  fraudInfo?: {
    walletFrozen?: boolean;
    reason?: string;
    markedBy?: string;
    markedAt?: string;
  };
};

export default function FraudUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchFraudUsers() {
      try {
        const res = await fetch("/api/admin/fraud-users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFraudUsers();
  }, []);

  // 🔥 FILTER + SORT
  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return sortOrder === "asc"
          ? dateB - dateA // New → Old
          : dateA - dateB; // Old → New
      });
  }, [users, search, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
            🚨 Fraud Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Users flagged for suspicious or fraudulent activity
          </p>
        </div>

        {/* 🔍 SEARCH + SORT */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b1220] text-sm outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {sortOrder === "asc" ? "Newest ⬇️" : "Oldest ⬆️"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1220] shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-red-50 dark:bg-red-950/30">
              <tr className="text-gray-700 dark:text-gray-300">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-red-50/60 dark:hover:bg-red-900/20 transition"
                >
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                      FRAUD
                    </span>
                  </td>

                  <td className="p-3 text-gray-500 dark:text-gray-400">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (UNCHANGED) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.7, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140 }}
              className="w-[92%] max-w-md rounded-3xl bg-white dark:bg-[#0b1220] p-6 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <h2 className="text-xl font-bold text-red-600 mb-3">
                Fraud Details
              </h2>

              <div className="space-y-2 text-sm">
                <p>
                  <b>Name:</b> {selectedUser.name}
                </p>
                <p>
                  <b>Email:</b> {selectedUser.email}
                </p>
                <p>
                  <b>Phone:</b> {selectedUser.phone || "N/A"}
                </p>
                <p>
                  <b>NID:</b> {selectedUser.nid || "N/A"}
                </p>
                <p>
                  <b>Status:</b> FRAUD
                </p>

                <p>
                  <b>Wallet:</b>{" "}
                  {selectedUser.fraudInfo?.walletFrozen
                    ? "Frozen ❌"
                    : "Active ✅"}
                </p>

                <p>
                  <b>Reason:</b>{" "}
                  {selectedUser.fraudInfo?.reason || "Not provided"}
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
