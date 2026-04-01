"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "@/lib/brandAlert";
import { Button } from "@/components/ui/button";
import T from "@/components/T";

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
      receiver: formData.get("agentNumber"),
      description: "Cash out from Novapay",
    };

    try {
      // 1. Process the main Cash Out Transaction
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        // 2. TRIGGER POINT UPDATE
        // We run this in its own try-catch to prevent point errors
        // from blocking the success message.
        try {
          await fetch("/api/points", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session?.user?.email,
              activityType: "CASH_OUT", // Matches your backend POINT_CONFIG
            }),
          });
        } catch (pointErr) {
          console.error("Loyalty points update failed:", pointErr);
        }

        // 3. Notify User and Refresh
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Cash out successful! Points have been added to your account.",
          confirmButtonColor: "#1E50FF",
        });

        window.location.reload();
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
        <label className="block text-sm font-medium mb-1">
          <T>Agent Number / Email</T>
        </label>
        <input
          name="agentNumber"
          type="text"
          required
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700"
          placeholder="Enter agent info"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1"><T>Amount</T></label>
        <input
          name="amount"
          type="number"
          required
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700"
          placeholder="0.00"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        variant="novapay"
        size="lg"
        className="w-full rounded-xl font-bold"
      >
        {loading ? <T>Processing...</T> : <T>Confirm Cash Out</T>}
      </Button>
    </form>
  );
};

export default CashOutForm;

