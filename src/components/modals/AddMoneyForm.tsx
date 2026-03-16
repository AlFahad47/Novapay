// modals/AddMoneyForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

interface LinkedBank {
  id: string;
  name: string;
  accNo: string;
  balance: number; // Used for the insufficient funds check
}

export default function AddMoneyForm() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch linked banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(
          `/api/user/update?email=${encodeURIComponent(session.user.email)}`,
        );
        const data = await res.json();
        if (data.linkedBanks) {
          setLinkedBanks(data.linkedBanks);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };
    fetchBanks();
  }, [session?.user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);

    // 1. Basic Validation
    if (!selectedBankId) {
      return Swal.fire("Error", "Please select a bank account", "error");
    }
    if (numAmount <= 0) {
      return Swal.fire("Error", "Please enter a valid amount", "error");
    }

    // 2. Insufficient Funds Check
    const selectedBank = linkedBanks.find((b) => b.id === selectedBankId);
    if (selectedBank && selectedBank.balance < numAmount) {
      return Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You only have ৳${selectedBank.balance.toLocaleString()} in this account.`,
        confirmButtonColor: "#3b82f6",
      });
    }

    setLoading(true);

    const payload = {
      email: session?.user?.email,
      bankId: selectedBankId,
      amount: numAmount,
      actionType: "add_money",
    };

    try {
      // Step 1: Execute the financial transaction
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // --- ADDED: POINTS UPDATE TRIGGER ---
        // We trigger this right after the financial transaction is confirmed
        fetch("/api/points", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session?.user?.email,
            activityType: "ADD_MONEY",
          }),
        }).catch((err) => console.error("Points system unreachable:", err));
        // -------------------------------------

        Swal.fire(
          "Success",
          "Money added successfully and you've earned reward points.",
          "success",
        );
        setAmount("");
        setSelectedBankId("");

        // Refresh local bank data so the balance UI is accurate
        const refreshedRes = await fetch(
          `/api/user/update?email=${encodeURIComponent(session?.user?.email!)}`,
        );
        const refreshedData = await refreshedRes.json();
        if (refreshedData.linkedBanks)
          setLinkedBanks(refreshedData.linkedBanks);
      } else {
        Swal.fire("Error", data.error || data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-center mb-4">
        Add Money to NovaPay
      </h2>

      {/* Bank Selection Dropdown */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-400">
          Select Bank Account
        </label>
        <select
          className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-blue-500 appearance-none cursor-pointer capitalize transition-all"
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
          required
        >
          <option value="">-- Choose Account --</option>
          {linkedBanks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name} (****{bank.accNo.slice(-4)}) — ৳
              {bank.balance.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-400">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
            ৳
          </span>
          <input
            type="number"
            placeholder="0.00"
            className="w-full p-3 pl-8 border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-blue-500 transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !amount}
        variant="novapay"
        size="lg"
        className={`w-full rounded-xl font-bold ${
          loading || !amount
            ? "bg-gray-400 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
            : "shadow-blue-500/20"
        }`}
      >
        {loading ? "Verifying Transaction..." : "Confirm Add Money"}
      </Button>
    </form>
  );
}
