"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

interface LinkedBank {
  id: string;
  name: string;
  accNo: string;   // This will be masked (e.g., **** 1234)
  balance: number; 
}

export default function AddMoneyForm() {
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
<<<<<<< HEAD
        title: "Insufficient Balance",
        text: `You only have ৳${selectedBank.balance.toLocaleString()} in this account.`,
        confirmButtonColor: "#3b82f6",
=======
        title: "Insufficient Bank Balance",
        text: `The selected card only has ${currencySymbol}${selectedBank.balance.toLocaleString()}.`,
        confirmButtonColor: "#3b82f6"
>>>>>>> b4a0b85ceb52933a9593b28007865cde16ef9590
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
<<<<<<< HEAD
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
=======
        }).catch(err => console.error("Points system unreachable:", err));

        // Step 3: Success Feedback
        Swal.fire({
          icon: "success",
          title: "Money Added!",
          text: `${currencySymbol}${numAmount.toLocaleString()} has been transferred to your NovaPay wallet.`,
          confirmButtonColor: "#1E50FF"
        });

        setAmount(""); 
        setSelectedBankId("");
        
        // Refresh local bank data for UI accuracy
        const refreshedRes = await fetch(`/api/user/update?email=${encodeURIComponent(session?.user?.email!)}`);
>>>>>>> b4a0b85ceb52933a9593b28007865cde16ef9590
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
<<<<<<< HEAD
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
=======
    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-black italic">Add Money</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Instant Bank Transfer</p>
        </div>
        
        {/* Bank Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Account</label>
          <select 
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold appearance-none cursor-pointer"
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            required
          >
            <option value="">Choose a card...</option>
            {linkedBanks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} — {bank.accNo} 
              </option>
            ))}
          </select>
>>>>>>> b4a0b85ceb52933a9593b28007865cde16ef9590
        </div>

<<<<<<< HEAD
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
=======
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">{currencySymbol}</span>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full p-4 pl-10 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-2xl transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !amount}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-lg ${
            loading || !amount 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.97] shadow-blue-500/20'
          }`}
        >
          {loading ? "Authorizing..." : "Confirm Transfer"}
        </button>
      </form>
    </div>
>>>>>>> b4a0b85ceb52933a9593b28007865cde16ef9590
  );
}
