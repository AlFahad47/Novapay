"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;

  image?: string; // ✅ added

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

        return sortOrder === "asc" ? dateB - dateA : dateA - dateB;
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
                  {/* ✅ NAME WITH IMAGE */}
                  <td className="p-3 flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </span>
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

      {/* ✅ MODAL (MATCHED STYLE) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedUser(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.6, opacity: 0, y: 80 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="w-[95%] max-w-lg rounded-3xl bg-white dark:bg-[#0c1a2b] shadow-2xl p-6"
            >
              <div className="text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-20 w-20 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold"
                >
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedUser.name.charAt(0)
                  )}
                </motion.div>

                <h2 className="mt-3 text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Phone" value={selectedUser.phone || "N/A"} />
                <Info label="NID" value={selectedUser.nid || "N/A"} />
                <Info label="Status" value="FRAUD" />
                {/* <Info
                  label="Wallet"
                  value={
                    selectedUser.fraudInfo?.walletFrozen
                      ? "Frozen ❌"
                      : "Active ✅"
                  }
                /> */}
                <Info
                  label="Reason"
                  value={selectedUser.fraudInfo?.reason || "Not provided"}
                />
                <Info
                  label="Created"
                  value={
                    selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString()
                      : "N/A"
                  }
                />
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="mt-6 w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white"
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-50 dark:bg-[#08111f] p-3 rounded-lg"
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </motion.div>
  );
}
