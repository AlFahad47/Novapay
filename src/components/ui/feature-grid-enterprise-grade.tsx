"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  Globe2,
  PiggyBank,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import T from "@/components/T";

// 1. Ultra-crisp, scannable copy. No fluff.
const features = [
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send and receive funds in real-time with zero hidden fees.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description:
      "Military-grade 256-bit encryption and biometrics keep your money safe.",
  },
  {
    icon: Wallet,
    title: "Complete Control",
    description:
      "Manage expenses and analyze your spending in one unified dashboard.",
  },
  {
    icon: PiggyBank,
    title: "Smart Savings",
    description:
      "Automate your wealth growth with custom goals and round-up rules.",
  },
  {
    icon: Globe2,
    title: "Global Payments",
    description:
      "Send money across borders instantly with competitive exchange rates.",
  },
  {
    icon: BellRing,
    title: "Proactive Alerts",
    description:
      "Get smart notifications for upcoming bills and suspicious activity.",
  },
];

export default function NovaPayFeaturesSection() {
  return (
    <section className="relative w-full overflow-hidden border-y border-slate-200 bg-[#F8FAFC] py-16 transition-colors duration-700 dark:border-white/5 dark:bg-[#050B14] sm:py-24">
      {/* --- SUBTLE BACKGROUND ARCHITECTURE --- */}
      <div
        className="pointer-events-none absolute inset-0 flex justify-center"
        aria-hidden="true"
      >
        {/* Faded Fintech Grid - Masked to prevent harsh edges */}
        <div
          className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        {/* Core Ambient Glow */}
        <div className="absolute top-0 h-[400px] w-[800px] -translate-y-[30%] rounded-full bg-[#4DA1FF]/10 blur-[100px] dark:bg-[#1E50FF]/15" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-8">
        {/* --- REFINED SECTION HEADER --- */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            <T>Secure your</T>{" "}
            <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent drop-shadow-sm">
              <T>money.</T>
            </span>
          </h2>
          <p className="text-[15px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            <T>Get lightning fast transfers, military-grade security, and total control from one app.</T> <br className="hidden md:block" /> <T>Fast, safe and built for you.</T>
          </p>
        </div>

        {/* --- PREMIUM COMPACT GRID --- */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:bg-white hover:shadow-lg dark:border-white/5 dark:bg-[#0B1221]/60 dark:hover:border-blue-500/30 dark:hover:bg-[#0B1221]"
              >
                {/* Subtle Inner Glow on Hover */}
                <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-500/10" />

                {/* Refined Small Icon Container */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80 ring-1 ring-inset ring-blue-100/50 transition-colors duration-300 group-hover:bg-blue-100/80 dark:bg-blue-500/10 dark:ring-blue-500/20 dark:group-hover:bg-blue-500/20">
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className="text-blue-600 transition-colors dark:text-[#4DA1FF]"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mb-2 text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
                  <T>{feature.title}</T>
                </h3>
                <p className="text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  <T>{feature.description}</T>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
