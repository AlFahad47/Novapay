// modals/AddMoneyForm.tsx
"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function AddMoneyForm() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [bankNumber, setBankNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // শুধুমাত্র নিজের একাউন্ট থেকে টাকা অ্যাড করার পেলোড
    const payload = {
      email: session?.user?.email,
      type: "add_money_self",
      amount: Number(amount),
      bankNumber: bankNumber,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", data.message, "success");
        setAmount(""); // ফর্ম রিসেট
        setBankNumber("");
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-center mb-4">Add Money from Bank</h2>
      
      {/* Amount Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Amount</label>
        <input 
          type="number" 
          placeholder="Enter Amount" 
          className="w-full p-2 border rounded dark:bg-gray-800 outline-none focus:border-blue-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required 
        />
      </div>

      {/* Own Bank Number Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Your Bank Account Number</label>
        <input 
          type="text" 
          placeholder="e.g. 123456789" 
          className="w-full p-2 border rounded dark:bg-gray-800 outline-none focus:border-blue-500"
          value={bankNumber}
          onChange={(e) => setBankNumber(e.target.value)}
          required 
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold transition-all"
      >
        Add Money
      </button>
    </form>
  );
}