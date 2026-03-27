"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { type Locale, defaultLocale, locales, localeLabels } from "@/i18n/locales";

import en from "@/i18n/messages/en.json";
import bn from "@/i18n/messages/bn.json";
import ar from "@/i18n/messages/ar.json";
import fil from "@/i18n/messages/fil.json";

const messages = { en, bn, ar, fil };

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("novapay-locale") as Locale;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
      document.documentElement.dir = localeLabels[saved].dir;
      document.documentElement.lang = saved;
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("novapay-locale", newLocale);
    document.documentElement.dir = localeLabels[newLocale].dir;
    document.documentElement.lang = newLocale;
  };

  if (!mounted) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
