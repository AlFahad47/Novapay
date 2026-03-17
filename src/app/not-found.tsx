"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home, Activity } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure router.back() is only available after client hydration to prevent React mismatch errors.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050B14] font-sans selection:bg-blue-500/30">
      
      {/* --- HARDWARE-ACCELERATED CSS ANIMATIONS --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .fintech-grid {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `,
        }}
      />

      {/* --- BACKGROUND ARCHITECTURE --- */}
      {/* Grid Pattern with fading edges */}
      <div className="absolute inset-0 z-0 fintech-grid pointer-events-none"></div>
      
      {/* Subtle Scanline for that "System Active" feel */}
      <div className="absolute inset-0 z-0 h-32 w-full bg-gradient-to-b from-transparent via-[#4DA1FF]/5 to-transparent opacity-50 blur-sm animate-scanline pointer-events-none"></div>

      {/* Core Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 z-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1E50FF]/15 blur-[120px] pointer-events-none"></div>

      {/* --- FOREGROUND UI --- */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        
        {/* Massive 404 Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none -z-10">
          <h1 className="text-[18rem] md:text-[24rem] font-black leading-none tracking-tighter text-white/[0.02]">
            404
          </h1>
        </div>

        {/* Premium Glassmorphic Terminal */}
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0B1221]/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-12">
          
          {/* Top highlight border for 3D realism */}
          <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#4DA1FF]/50 to-transparent"></div>

          {/* Iconography */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 shadow-[inset_0_0_20px_rgba(77,161,255,0.2)]">
            <ShieldAlert className="h-10 w-10 text-[#4DA1FF]" strokeWidth={1.5} />
          </div>

          {/* Messaging */}
          <h2 className="mb-3 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Connection Lost
          </h2>
          <p className="mb-10 text-sm font-medium leading-relaxed text-slate-400">
            The encrypted node you are trying to reach does not exist on the NovaPay network. Your funds and data remain completely secure.
          </p>

          {/* Action Architecture */}
          <div className="flex w-full flex-col gap-3">
            {/* Primary Rescue Action */}
            <Link
              href="/dashboard"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(44,100,255,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(44,100,255,0.5)] border border-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 group-hover:scale-105"></div>
              <Home size={18} className="relative text-white" />
              <span className="relative text-[15px] font-bold tracking-wide text-white">
                Return to Dashboard
              </span>
            </Link>

            {/* Secondary Escape Action (Go Back) */}
            {mounted ? (
              <button
                onClick={() => router.back()}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-[15px] font-bold tracking-wide text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft
                  size={18}
                  className="text-slate-400 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-white"
                />
                Go Back Previous Page
              </button>
            ) : (
              // Placeholder to prevent layout shift before hydration
              <div className="h-[58px] w-full rounded-xl border border-transparent"></div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}