"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Securing your connection...",
  "Encrypting financial data...",
  "Syncing your wallets...",
  "Preparing NovaPay dashboard...",
];

export default function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);

  // 1. Handle Scroll Locking & Timer Cleanup
  useEffect(() => {
    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Cycle messages every 2.5s
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    // Strict cleanup on unmount
    return () => {
      clearInterval(timer);
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-white/80 backdrop-blur-2xl transition-colors duration-500 dark:bg-[#050B14]/85"
      // A11y: Declare this as a polite live region so screen readers announce changes
      role="status"
      aria-live="polite"
    >
      {/* Dynamic Screen Reader Announcement */}
      <span className="sr-only">
        {LOADING_MESSAGES[messageIndex]}
      </span>

      {/* Ambient Hardware-Accelerated Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/15" />
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="relative flex flex-col items-center gap-8 rounded-[2rem] border border-white/60 bg-white/50 p-10 shadow-[0_20px_80px_-20px_rgba(30,80,255,0.15)] backdrop-blur-xl transition-all dark:border-slate-700/30 dark:bg-[#0B1221]/50 dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
        
        {/* Spinner Module */}
        <NovaSpinner />

        {/* Typography & Messaging */}
        <div className="flex w-64 flex-col items-center text-center">
          <h2 className="mb-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            NovaPay
          </h2>
          
          {/* Orchestrated Text Crossfade */}
          <div className="relative h-5 w-full overflow-hidden">
            {LOADING_MESSAGES.map((msg, idx) => {
              // Directional animation logic:
              // Past messages go UP (-translate-y-4)
              // Current message is CENTER (translate-y-0)
              // Future messages come from DOWN (translate-y-4)
              let translateClass = "translate-y-4 opacity-0"; 
              if (idx === messageIndex) translateClass = "translate-y-0 opacity-100";
              else if (idx < messageIndex) translateClass = "-translate-y-4 opacity-0";

              return (
                <p
                  key={msg}
                  className={`absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] dark:text-slate-400 ${translateClass}`}
                  aria-hidden="true" // Hidden from SRs to avoid duplicate reading
                >
                  {msg}
                </p>
              );
            })}
          </div>
        </div>

        {/* Indeterminate Progress Bar */}
        <div className="h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
          <div 
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF]"
            style={{
              animation: "nova-progress 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite"
            }}
          />
        </div>

        {/* Isolated Keyframes to avoid tailwind.config.js modifications */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes nova-progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `
        }} />
      </div>
    </div>
  );
}

/**
 * Extracted Spinner Component for modularity.
 * Uses SVG stroke-dasharray for hardware-accelerated, perfectly rounded spinning tails.
 */
function NovaSpinner() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Soft pulsing aura */}
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
      
      {/* SVG Spinner */}
      <svg
        className="absolute inset-0 h-full w-full animate-spin text-transparent"
        viewBox="0 0 50 50"
        style={{ animationDuration: "1.2s" }} // Slightly faster spin feels more responsive
      >
        <defs>
          <linearGradient id="novaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4DA1FF" />
            <stop offset="100%" stopColor="#1E50FF" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          className="opacity-20"
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke="#4DA1FF"
          strokeWidth="2.5"
        />
        {/* Tail */}
        <circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke="url(#novaGradient)"
          strokeWidth="2.5"
          strokeDasharray="90 150"
          strokeLinecap="round"
        />
      </svg>

      {/* Core Icon */}
      <div className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner dark:bg-[#0F172A]">
        <Sparkles 
          className="h-6 w-6 text-blue-500 animate-pulse" 
          strokeWidth={2.5} 
          style={{ animationDuration: "2s" }}
        />
      </div>
    </div>
  );
}