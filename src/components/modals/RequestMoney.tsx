"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { HandHelping, Mail, Banknote, PenLine, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";

export default function RequestMoneyForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { data: session } = useSession();
  const [targetEmail, setTargetEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!targetEmail || !amount)
      return Swal.fire("Error", "Fill all fields", "error");
    if (targetEmail === session?.user?.email)
      return Swal.fire("Oops", "Can't request from yourself", "warning");

    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        // api
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: session?.user?.email, // req
          receiverEmail: targetEmail.toLowerCase().trim(), // rece
          amount: Number(amount),
          note: note,
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
              activityType: "REQUEST_MONEY", // Matches your backend POINT_CONFIG
            }),
          });
        } catch (pointErr) {
          console.error("Failed to add points:", pointErr);
        }
        // --- ADD POINTS LOGIC END ---

        Swal.fire(
          "Request Sent!",
          `Requested ৳${amount} from ${targetEmail} and you've earned reward points`,
          "success",
        );
        if (onSuccess) onSuccess();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative group">
        <Mail
          className="absolute left-3 top-4 text-gray-400 group-focus-within:text-blue-500"
          size={20}
        />
        <input
          type="email"
          placeholder="From whose email?"
          className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
        />
      </div>

      <div className="relative group">
        <Banknote
          className="absolute left-3 top-4 text-gray-400 group-focus-within:text-emerald-500"
          size={20}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 font-bold text-xl"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="relative group">
        <PenLine className="absolute left-3 top-4 text-gray-400" size={20} />
        <textarea
          placeholder="Add a note (e.g. For dinner bill)"
          className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-400 min-h-[100px]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button
        onClick={handleRequest}
        disabled={loading}
        variant="novapay"
        size="lg"
        className="w-full h-14 rounded-2xl font-bold"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <HandHelping size={20} /> Send Request
          </>
        )}
      </Button>
    </div>
  );
}
