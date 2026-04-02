"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "@/lib/brandAlert";
import { Button } from "@/components/ui/button";
import T from "@/components/T";
import { formatAmount } from "@/lib/utils";

interface LinkedBank {
  id: string;
  name: string;
  accNo: string;   // This will be masked (e.g., **** 1234)
  balance: number; 
}

export default function AddMoneyForm({ onSuccess }: { onSuccess?: () => void }) { 
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  // Fetch linked banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(
          `/api/user/update?email=${encodeURIComponent(session.user.email)}`,
        );
        const data = await res.json();
              setDbUser(data);

        if (data.linkedBanks) {
          setLinkedBanks(data.linkedBanks);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };
    fetchBanks();
  }, [session?.user?.email]);
  const currencySymbol = dbUser?.currency === "BDT" ? "৳" : "$";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    // 1. Validation
    if (!selectedBankId) {
      return Swal.fire("Required", "Please select a bank account", "warning");
    }
    if (numAmount <= 0) {
      return Swal.fire("Invalid Amount", "Please enter an amount greater than zero", "warning");
    }

    // 2. Client-side Balance Check
    const selectedBank = linkedBanks.find((b) => b.id === selectedBankId);
    if (selectedBank && selectedBank.balance < numAmount) {
      return Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You only have ৳${formatAmount(selectedBank.balance)} in this account.`,
        confirmButtonColor: "#3b82f6",
      });
    }

    setLoading(true);

    // Matches your realistic Backend Payload
    const payload = {
      email: session?.user?.email,
      bankId: selectedBankId,
      amount: numAmount,
      actionType: "add_money",
    };

    try {
      // Step 1: Financial Transaction
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Step 2: Points Update (Fired in background)
        fetch("/api/points", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session?.user?.email,
            activityType: "ADD_MONEY",
          }),
        }).catch((err) => console.error("Points system unreachable:", err));
        // -------------------------------------

        // Close modal first, then show success alert
        if (onSuccess) onSuccess();
        
        setTimeout(() => {
          Swal.fire(
            "Success",
            "Money added successfully and you've earned reward points.",
            "success",
          );
        }, 250);
        
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
        Swal.fire("Transaction Failed", data.error || "Please try again later.", "error");
      }
    } catch (error) {
      Swal.fire("Network Error", "Could not connect to the banking server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-center mb-4">
        <T>Add Money to NovaPay</T>
      </h2>

      {/* Bank Selection Dropdown */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-400">
          <T>Select Bank Account</T>
        </label>
        <select
          className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-blue-500 appearance-none cursor-pointer capitalize transition-all"
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
          required
        >
          <option value=""><T>-- Choose Account --</T></option>
          {linkedBanks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name} (****{bank.accNo.slice(-4)}) - ৳
              {formatAmount(bank.balance)}
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-400"><T>Amount</T></label>
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
        {loading ? <T>Verifying Transaction...</T> : <T>Confirm Add Money</T>}
      </Button>
    </form>
  );
}


