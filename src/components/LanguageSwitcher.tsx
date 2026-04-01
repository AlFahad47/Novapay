"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale } from "@/providers/LocaleProvider";
import { localeLabels, locales, type Locale } from "@/i18n/locales";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = localeLabels[locale];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-full border border-sky-200/70 dark:border-sky-400/25 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl text-slate-700 dark:text-slate-100 shadow-[0_8px_22px_-14px_rgba(2,132,199,0.75)] hover:shadow-[0_12px_28px_-16px_rgba(2,132,199,0.9)] hover:-translate-y-0.5 transition-all duration-300"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-inner">
          <Globe size={13} className="group-hover:rotate-12 transition-transform duration-300" />
        </span>
        <span className="hidden sm:inline font-semibold tracking-tight">{current.flag} {current.label}</span>
        <span className="sm:hidden font-semibold">{current.flag}</span>
        <ChevronDown
          size={14}
          className={`text-slate-500 dark:text-slate-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 dark:bg-[#0c1a2b]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/70 rounded-2xl shadow-2xl z-30 overflow-hidden">
          {locales.map((lang) => {
            const info = localeLabels[lang as Locale];
            const isActive = locale === lang;
            return (
              <button
                key={lang}
                onClick={() => { setLocale(lang as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition
                  ${isActive
                    ? "bg-sky-50 dark:bg-sky-900/25 text-sky-700 dark:text-sky-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  }`}
              >
                <span className="text-lg">{info.flag}</span>
                <span>{info.label}</span>
                {isActive && (
                  <Check size={15} className="ml-auto text-sky-600 dark:text-sky-300" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
