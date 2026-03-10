"use client";
import React, { useState } from "react";
import { FaLightbulb, FaWater, FaWifi, FaTv } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

const BillForm = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("Electricity");
  const [consumerId, setConsumerId] = useState("");
  const [amount, setAmount] = useState("");

  const billTypes = [
    { name: "Electricity", icon: FaLightbulb, color: "text-yellow-500" },
    { name: "Water", icon: FaWater, color: "text-blue-500" },
    { name: "Internet", icon: FaWifi, color: "text-orange-500" },
    { name: "TV/DTH", icon: FaTv, color: "text-purple-500" },
  ];

 const handlePayBill = async () => {
    // validation
    if (!consumerId || !amount) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    if (!session?.user?.email) {
      Swal.fire("Error", "User not authenticated", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Process the main Transaction (POST)
      const response = await fetch("/api/transactions", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          type: "bill_payment",
          amount: amount,
          currency: "BDT",
          status: "completed",
          sender: "Wallet",
          receiver: selectedType,
          description: `Bill payment for ${selectedType} (ID: ${consumerId})`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. TRIGGER POINT UPDATE (PATCH)
        // We use a separate try-catch so that if points fail, 
        // the user still knows their bill was paid.
        try {
          await fetch("/api/points", { 
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              activityType: "BILL_PAYMENT", // Matches your POINT_CONFIG key
            }),
          });
        } catch (pointError) {
          console.error("Point update failed:", pointError);
        }

        Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          text: `${selectedType} bill of ৳${amount} paid successfully. Points added!`,
          confirmButtonColor: "#1E50FF",
        });

        // Form reset
        setConsumerId("");
        setAmount("");
      } else {
        throw new Error(data.message || "Failed to process payment");
      }
    } catch (error: any) {
      Swal.fire("Failed", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bill Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        {billTypes.map((bill) => (
          <button
            key={bill.name}
            onClick={() => setSelectedType(bill.name)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
              selectedType === bill.name
                ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
            }`}
          >
            <bill.icon className={`text-xl mb-2 ${bill.color}`} />
            <span className="text-xs font-medium dark:text-gray-200">{bill.name}</span>
          </button>
        ))}
      </div>

      {/* Input Fields */}
      <div className="space-y-3 mt-4">
        <input
          type="text"
          value={consumerId}
          onChange={(e) => setConsumerId(e.target.value)}
          placeholder="Consumer ID / Account No"
          className="w-full p-3 rounded-xl border dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-3 rounded-xl border dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        
        <button
          onClick={handlePayBill}
          disabled={loading}
          className={`w-full py-3 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-opacity ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Processing..." : `Pay ${selectedType} Bill`}
        </button>
      </div>
    </div>
  );
};

export default BillForm;