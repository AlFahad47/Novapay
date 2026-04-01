"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import T from "@/components/T";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        
        // Development mode: Show reset token
        if (data.resetToken) {
          toast.success(`Reset Code: ${data.resetToken}`, { duration: 10000 });
        }
        
        // Redirect to reset password page
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("A server error occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#050B14] via-[#0F172A] to-[#1E293B]">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2C64FF]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4DA1FF]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_80px_rgba(44,100,255,0.3)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4DA1FF] to-[#2C64FF] rounded-full mb-4 shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#050B14] mb-2"><T>Forgot your password?</T></h1>
            <p className="text-slate-600"><T>Enter your email and we will send a reset code</T></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <T>Email Address</T>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#2C64FF] focus:ring-4 focus:ring-[#2C64FF]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full py-3.5 rounded-xl border-none outline-none text-white font-bold text-lg tracking-wide cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(44,100,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out hover:scale-105"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-30 rounded-t-xl pointer-events-none"></div>
              <span className="relative z-10 drop-shadow-sm">
                {loading ? <T>Sending...</T> : <T>Send Reset Code</T>}
              </span>
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#2C64FF] font-bold hover:underline transition-all"
            >
              <ArrowLeft size={18} />
              <T>Back to Login Page</T>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
