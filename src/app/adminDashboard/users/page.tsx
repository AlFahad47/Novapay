"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;

  balance?: number;
  bank?: string;
  bankBalance?: number;
  currency?: string;
  points?: number;
  rank?: string;
  totalXP?: number;
  kycStatus?: string;
  updatedAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useState("");

  // ✅ NEW: sort toggle
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();

        setUsers(data?.users || []);
      } catch (error) {
        console.error("Fetch users error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // ✅ filter + dynamic sort
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
          ? dateB - dateA // 🆕 New → Old
          : dateA - dateB; // 📅 Old → New
      });
  }, [users, search, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Users List
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage all registered users
        </p>
      </div>

      {/* 🔥 SEARCH + SORT */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <motion.input
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0c1a2b] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ✅ SORT BUTTON */}
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
        >
          {sortOrder === "asc" ? "Newest ⬇️" : "Oldest ⬆️"}
        </button>
      </div>

      {/* TABLE */}
      <motion.div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0c1a2b] shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#08111f]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setIsOpen(true);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#111c2d]"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
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
                  className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold"
                >
                  {selectedUser.name.charAt(0)}
                </motion.div>

                <h2 className="mt-3 text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="User ID" value={selectedUser._id.slice(-8)} />
                <Info label="Role" value={selectedUser.role} />
                <Info
                  label="Balance"
                  value={`${selectedUser.balance || 0} ${
                    selectedUser.currency || ""
                  }`}
                />
                <Info label="Bank" value={selectedUser.bank || "N/A"} />
                <Info
                  label="Bank Balance"
                  value={`${selectedUser.bankBalance || 0}`}
                />
                <Info label="Points" value={`${selectedUser.points || 0}`} />
                <Info label="Rank" value={selectedUser.rank || "N/A"} />
                <Info label="XP" value={`${selectedUser.totalXP || 0}`} />
                <Info label="KYC" value={selectedUser.kycStatus || "N/A"} />
                <Info
                  label="Created"
                  value={
                    selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString()
                      : "N/A"
                  }
                />
                <Info
                  label="Updated"
                  value={
                    selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleString()
                      : "N/A"
                  }
                />
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
