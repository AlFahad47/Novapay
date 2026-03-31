"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Chat", href: "/chat" },
  { label: "Review", href: "/review" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-linear-to-b from-[#f7fbff] via-[#ffffff] to-[#eff5ff] text-slate-800 dark:border-slate-800 dark:from-[#030712] dark:via-[#07101e] dark:to-[#0b1422] dark:text-slate-200">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full border border-blue-200/60 dark:border-blue-500/20" />
      <div className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full border border-cyan-200/60 dark:border-cyan-500/20" />

      <div className="home-container py-14 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <Sparkles size={12} className="text-blue-500" /> Nova Signature
          </p>
          <h3 className="text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl">
            Quietly powerful finance, designed with intent.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            NovaPay brings payments, support and AI guidance into one calm,
            fast experience.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
            >
              {item.label}
              <ArrowUpRight
                size={12}
                className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-center shadow-sm dark:border-slate-700/70 dark:bg-white/5 sm:grid-cols-2">
          <a
            href="mailto:support@novapay.com"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <Mail size={14} /> support@novapay.com
          </a>
          <a
            href="tel:+8801700000000"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <Phone size={14} /> +880 1700-000000
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-5 text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NovaPay. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
              Privacy
            </Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
