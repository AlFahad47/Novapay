"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Smartphone, Banknote, CheckCircle2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const OPERATORS = [
  { name: "Grameenphone", logo: "GP", color: "bg-blue-500" },
  { name: "Banglalink", logo: "BL", color: "bg-orange-500" },
  { name: "Robi", logo: "Ri", color: "bg-red-500" },
  { name: "Airtel", logo: "Ai", color: "bg-rose-600" },
  { name: "Teletalk", logo: "TT", color: "bg-green-600" },
];

export default function MobileRecharge({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState("Grameenphone");
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    if (!phone || !amount) {
      return Swal.fire("Error", "Please enter phone and amount", "error");
    }
    if (phone.length < 11) {
      return Swal.fire("Invalid Number", "Phone number must be 11 digits", "warning");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          type: "Mobile Recharge",
          amount: Number(amount),
          receiver: phone,
          description: `Mobile Recharge (${operator})`,
          currency: "BDT"
        }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Recharge Successful!",
          text: `৳${amount} sent to ${phone}`,
          showConfirmButton: false,
          timer: 2000
        });
        window.dispatchEvent(new Event("balanceUpdated"));
        if (onSuccess) onSuccess();
      } else {
        Swal.fire("Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Operator Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">Select Operator</label>
        <div className="grid grid-cols-5 gap-2">
          {OPERATORS.map((op) => (
            <button
              key={op.name}
              onClick={() => setOperator(op.name)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-300 ${
                operator === op.name 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105" 
                : "border-transparent bg-gray-50 dark:bg-gray-800/50 opacity-60 hover:opacity-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${op.color}`}>
                {op.logo}
              </div>
              <span className="text-[10px] mt-2 font-medium truncate w-full text-center text-gray-700 dark:text-gray-300">
                {op.name.split(' ')[0]}
              </span>
              {operator === op.name && (
                <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-blue-500 fill-white dark:fill-[#121928]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {/* Phone Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Smartphone size={20} />
          </div>
          <input
            type="tel"
            maxLength={11}
            placeholder="017XXXXXXXX"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-semibold tracking-widest text-gray-800 dark:text-white"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Amount Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Banknote size={20} />
          </div>
          <input
            type="number"
            placeholder="Enter Amount"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-xl text-gray-800 dark:text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center text-sm font-bold text-gray-400">
            BDT
          </div>
        </div>
      </div>

      {/* Quick Amount Suggestions */}
      <div className="flex flex-wrap gap-2">
        {[20, 50, 100, 500].map((val) => (
          <button
            key={val}
            onClick={() => setAmount(val.toString())}
            className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold hover:bg-blue-500 hover:text-white transition-colors"
          >
            ৳{val}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleRecharge}
        disabled={loading}
        className="group relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/30 overflow-hidden active:scale-95 transition-transform disabled:opacity-70"
      >
        <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 -translate-x-full italic" />
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            "Proceed Recharge"
          )}
        </span>
      </button>

      <p className="text-center text-[11px] text-gray-400">
        By proceeding, you agree to our Terms and Service.
      </p>
    </div>
  );
}