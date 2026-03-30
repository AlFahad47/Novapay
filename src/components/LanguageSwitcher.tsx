"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
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
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl
          bg-white/10 hover:bg-white/20 border border-white/20
          text-white transition-all duration-200"
        aria-label="Switch language"
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44
          bg-white dark:bg-[#0c1a2b]
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-xl z-[999] overflow-hidden">
          {locales.map((lang) => {
            const info = localeLabels[lang as Locale];
            const isActive = locale === lang;
            return (
              <button
                key={lang}
                onClick={() => { setLocale(lang as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition
                  ${isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <span className="text-lg">{info.flag}</span>
                <span>{info.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
