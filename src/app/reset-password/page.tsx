"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import T from "@/components/T";

// Create a component that uses useSearchParams
const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  };

  const strength = calculateStrength(newPassword);
  const strengthColors = ["#E2E8F0", "#EF4444", "#F59E0B", "#10B981", "#22C55E"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Invalid or expired token.");
      }
    } catch (error) {
      toast.error("Internal server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md mx-4">
      <div className="bg-white dark:bg-[#0F172A]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.1)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-[#1E293B] p-8 md:p-10 transition-all duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4DA1FF] to-[#2C64FF] rounded-[1.2rem] mb-5 shadow-[0_10px_25px_rgba(44,100,255,0.4)] rotate-3">
            <KeyRound className="text-white" size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] dark:text-white mb-2 tracking-tight transition-colors">
            <T>Set New Password</T>
          </h1>
          <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">
            <T>Please enter your new password below.</T>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (readonly / prepopulated) */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#2C64FF] dark:text-[#4DA1FF] mb-2 uppercase tracking-widest">
              <T>Email Address</T>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#050B14]/50 focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] focus:ring-4 focus:ring-[#2C64FF]/10 outline-none transition-all text-[#0F172A] dark:text-white font-medium"
            />
          </div>

          {/* Reset Token */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#2C64FF] dark:text-[#4DA1FF] mb-2 uppercase tracking-widest">
              <T>Reset Code (6-Digit)</T>
            </label>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="000000"
              required
              maxLength={6}
              className="w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-transparent focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] focus:ring-4 focus:ring-[#2C64FF]/10 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em] text-[#0F172A] dark:text-white"
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#2C64FF] dark:text-[#4DA1FF] mb-2 uppercase tracking-widest">
              <T>New Password</T>
            </label>
            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-transparent focus-within:border-[#2C64FF] dark:focus-within:border-[#4DA1FF] focus-within:ring-4 focus-within:ring-[#2C64FF]/10 transition-all">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-transparent outline-none text-[#0F172A] dark:text-white font-medium placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex gap-1.5 mb-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: level <= strength ? strengthColors[strength] : "rgba(148, 163, 184, 0.2)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#2C64FF] dark:text-[#4DA1FF] mb-2 uppercase tracking-widest">
              <T>Confirm Password</T>
            </label>
            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-transparent focus-within:border-[#2C64FF] dark:focus-within:border-[#4DA1FF] focus-within:ring-4 focus-within:ring-[#2C64FF]/10 transition-all">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none text-[#0F172A] dark:text-white font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden w-full py-4 rounded-xl border-none outline-none text-white font-bold text-[15px] tracking-widest uppercase cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(44,100,255,0.6)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out group-hover:scale-[1.05]"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-30 rounded-t-xl pointer-events-none"></div>
            <span className="relative z-10 drop-shadow-sm flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <T>Reset Password</T>
              )}
            </span>
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#64748B] dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <T>Back to Sign In</T>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main Component with Suspense Boundary for useSearchParams
const ResetPasswordWrapper: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#050B14] transition-colors duration-700 selection:bg-[#4DA1FF]/30 selection:text-[#2C64FF]">
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#4DA1FF] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.15] dark:opacity-[0.1] animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2C64FF] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-[0.1] dark:opacity-[0.15] animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] -z-10 bg-white/30 dark:bg-transparent transition-colors duration-700"></div>

      {/* Suspense Boundary is required in Next.js 13+ when using useSearchParams */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-[#4DA1FF]/30 border-t-[#2C64FF] rounded-full animate-spin mb-4"></div>
          <p className="text-[#0F172A] dark:text-white font-medium tracking-widest uppercase text-sm animate-pulse">Loading Security Module...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
};

export default ResetPasswordWrapper;