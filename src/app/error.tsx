"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#071025]">
      <div className="max-w-2xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{error?.message || "An unexpected error occurred."}</p>

        <div className="inline-flex items-center gap-3 mb-6">
          <button onClick={() => reset()} className="px-4 py-2 rounded bg-blue-600 text-white">Try again</button>
          <a href="/contact" className="px-4 py-2 rounded border border-slate-200 text-slate-700">Contact Support</a>
        </div>

        <div className="mt-6">
          <div className="relative mx-auto w-64 h-20">
            <div className="bar bg-gradient-to-r from-emerald-300 to-emerald-500 rounded h-12 w-full shadow-inner" />
            <div className="spark absolute right-4 top-[-14px] w-8 h-8 rounded-full bg-yellow-400 shadow-lg animate-pulse" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bar{ transform: rotate(-6deg); }
        @keyframes pulse { 0%{ transform: scale(1); }50%{ transform: scale(1.08); }100%{ transform: scale(1); } }
        .animate-pulse{ animation: pulse 1000ms ease-in-out infinite; }
      ` }} />
    </main>
  );
}
