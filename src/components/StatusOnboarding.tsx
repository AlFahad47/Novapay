// components/StatusOnboarding.tsx
import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Timer, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  status: string | null;
  onClose: () => void;
}

const StatusOnboarding: React.FC<Props> = ({ status, onClose }) => {
  const isApproved = status === "approved";
  const isPending = status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[2rem] p-8 shadow-2xl border border-[#4DA1FF]/20 overflow-hidden"
      >
        {/* Background Decorative Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4DA1FF]/10 rounded-full blur-3xl" />

        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          <X size={20} />
        </Button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 rotate-12 shadow-xl ${
              isApproved
                ? "bg-green-500 shadow-green-500/20"
                : isPending
                  ? "bg-orange-500 shadow-orange-500/20"
                  : "bg-[#1E50FF] shadow-blue-500/20"
            }`}
          >
            <div className="-rotate-12 text-white">
              {isApproved ? (
                <ShieldCheck size={40} />
              ) : isPending ? (
                <Timer size={40} />
              ) : (
                <ShieldAlert size={40} />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">
            {isApproved
              ? "Account Verified!"
              : isPending
                ? "Review in Progress"
                : "Complete Your Profile"}
          </h2>

          <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed mb-8">
            {isApproved
              ? "Your account is fully secured. You can now send money, request funds, and manage your assets without limits."
              : isPending
                ? "Our team is currently reviewing your documents. This usually takes 24-48 hours. We'll notify you once it's done."
                : "To start using NovaPay's  features like Send Money and Wallet, you need to complete your KYC verification."}
          </p>

          <div className="w-full space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4DA1FF] mb-4 text-left border-b border-[#4DA1FF]/10 pb-2">
              Next Steps & Terms
            </h4>
            <ul className="text-left space-y-3 mb-8">
              {[
                isApproved
                  ? "Access all dashboard widgets"
                  : "Submit valid National ID/Passport",
                "Verify Your Identity for Limit Increase",
                "Do not share your PIN with anyone",
              ].map((term, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4DA1FF] mt-1.5" />
                  {term}
                </li>
              ))}
            </ul>

            <Button
              asChild
              onClick={onClose}
              variant="novapay"
              size="lg"
              className="w-full rounded-2xl font-bold"
            >
              <Link href="/dashboard/kyc">
                {isApproved
                  ? "Get Started"
                  : isPending
                    ? "I Understand"
                    : "Verify Now"}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusOnboarding;
