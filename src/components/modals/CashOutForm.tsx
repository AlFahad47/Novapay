"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

const CashOutForm = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: session?.user?.email,
      type: "cashout",
      amount: formData.get("amount"),
      receiver: formData.get("agentNumber"), // এজেন্টের নাম্বার বা ইমেইল
      description: "Cash out from Novapay",
    };

    try {
      const res = await fetch("/api/transactions", { // আপনার সঠিক API পাথ দিন
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Cash out successful!", "success");
        window.location.reload(); // ব্যালেন্স আপডেট দেখানোর জন্য
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Agent Number / Email</label>
        <input name="agentNumber" type="text" required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" placeholder="Enter agent info" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input name="amount" type="number" required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700" placeholder="0.00" />
      </div>
      <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
        {loading ? "Processing..." : "Confirm Cash Out"}
      </button>
    </form>
  );
};

export default CashOutForm;