"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, User, Banknote, Loader2, Info, XCircle, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import T from "@/components/T";

export default function SendMoneyForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [receiverEmail, setReceiverEmail] = useState("");

const [recipientName, setRecipientName] = useState<string | null>(null);
const [isVerifying, setIsVerifying] = useState(false);
const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  
  const [userCurrency, setUserCurrency] = useState("BDT");
  const [currencySymbol, setCurrencySymbol] = useState("৳");

  // Effect for real-time validation
useEffect(() => {
  const verifyRecipient = async () => {
    // valid email and api no abuse
    if (receiverEmail.includes("@") && receiverEmail.includes(".")) {
      setIsVerifying(true);
      try {
        const res = await fetch(`/api/user/find?email=${receiverEmail.toLowerCase().trim()}`);
        const data = await res.json();

        if (data.success && data.user) {
          setRecipientName(data.user.name);
          setIsValidUser(true);
        } else {
          setRecipientName(null);
          setIsValidUser(false);
        }
      } catch (error) {
        setIsValidUser(false);
      } finally {
        setIsVerifying(false);
      }
    } else {
      setRecipientName(null);
      setIsValidUser(null);
    }
  };

  const timeoutId = setTimeout(verifyRecipient, 500); // Debounce 500ms
  return () => clearTimeout(timeoutId);
}, [receiverEmail]);

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/user/update?email=${session.user.email}`);
          const data = await res.json();
          if (data.currency) {
            setUserCurrency(data.currency);
            setCurrencySymbol(data.currency === "USD" ? "$" : "৳");
          }
        } catch (error) {
          console.error("Currency fetch failed:", error);
        }
      }
    };
    fetchUserCurrency();
  }, [session]);

const handleSend = async () => {
    if (!receiverEmail || !amount) {
      return Swal.fire("Error", "Please fill in all fields", "error");
    }

    if (receiverEmail === session?.user?.email) {
      return Swal.fire("Oops!", "You cannot send money to yourself", "warning");
    }

    if (Number(amount) <= 0) {
      return Swal.fire("Invalid Amount", "Please enter a valid amount", "warning");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          type: "send_money",
          amount: Number(amount),
          currency: userCurrency, 
          receiver: receiverEmail.toLowerCase().trim(),
          description: `Sent to ${receiverEmail}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // --- ADD POINTS LOGIC START ---
        try {
          await fetch("/api/points", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session?.user?.email,
              activityType: "SEND_MONEY", // Matches your backend POINT_CONFIG
            }),
          });
        } catch (pointErr) {
          console.error("Failed to add loyalty points:", pointErr);
        }
        // --- ADD POINTS LOGIC END ---

        Swal.fire({
          icon: "success",
          title: "Transfer Successful!",
          text: `${currencySymbol}${amount} has been sent to ${receiverEmail} and you've earned reward points`,
          confirmButtonColor: "#2563eb",
        });
        
        window.dispatchEvent(new Event("balanceUpdated"));
        if (onSuccess) onSuccess();
      } else {
        Swal.fire("Transfer Failed", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Connection lost. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
        <Info className="text-blue-500 mt-0.5" size={18} />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          <T>Ensure the recipient's email is correct. Once sent, money transfers cannot be reversed.</T>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
  <div className="flex justify-between items-end ml-1">
    <label className="text-sm font-semibold text-gray-500"><T>Recipient Email</T></label>
    {/* Real-time Name Show */}
    {recipientName && (
      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg animate-in fade-in slide-in-from-right-2">
        <T>Pay to:</T> {recipientName}
      </span>
    )}
  </div>

  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
      <User size={20} />
    </div>
    
    <input
      type="email"
      placeholder="user@example.com"
      className={`w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl outline-none transition-all font-medium text-gray-800 dark:text-white
        ${isValidUser === true ? "border-emerald-500/50 bg-emerald-50/10" : 
          isValidUser === false ? "border-red-400/50 bg-red-50/10" : "border-transparent focus:border-blue-500"}`}
      value={receiverEmail}
      onChange={(e) => setReceiverEmail(e.target.value)}
    />

    {/* Right Side Status Icons */}
    <div className="absolute inset-y-0 right-4 flex items-center">
      {isVerifying ? (
        <Loader2 className="animate-spin text-blue-500" size={18} />
      ) : isValidUser === true ? (
        <div className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full animate-in zoom-in">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : isValidUser === false ? (
        <div className="flex items-center justify-center w-6 h-6 bg-red-400 rounded-full animate-in zoom-in">
          <span className="text-white text-[14px] font-bold">!</span>
        </div>
      ) : null}
    </div>
  </div>

  {/* Subtle bottom error if user not found */}
  {isValidUser === false && (
    <p className="text-[11px] text-red-500 font-medium ml-1 animate-in fade-in">
      <T>This user is not registered on NovaPay.</T>
    </p>
  )}
</div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-500 ml-1"><T>Transfer Amount</T></label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Banknote size={20} />
            </div>
            <input
              type="number"
              placeholder="0.00"
              className="w-full pl-12 pr-16 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-2xl text-gray-800 dark:text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute inset-y-0 right-4 flex items-center font-bold text-gray-400">
              {userCurrency} 
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[500, 1000, 2000, 5000].map((val) => (
          <button
            key={val}
            onClick={() => setAmount(val.toString())}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
          >
            +{currencySymbol}{val} 
          </button>
        ))}
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <>
              <Send size={18} /> <T>Send Money Now</T>
            </>
          )}
        </span>
      </button>

      <p className="text-center text-[11px] text-gray-400 font-medium">
        <T>Secure Transaction Powered by NovaPay Engine</T>
      </p>
    </div>
  );
}