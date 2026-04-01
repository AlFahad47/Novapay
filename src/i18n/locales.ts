export const locales = ["en", "bn", "ar", "fil"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
  en:  { label: "English",  flag: "🇬🇧", dir: "ltr" },
  bn:  { label: "বাংলা",    flag: "🇧🇩", dir: "ltr" },
  ar:  { label: "العربية",  flag: "🇸🇦", dir: "rtl" },
  fil: { label: "Filipino", flag: "🇵🇭", dir: "ltr" },
};

export const defaultLocale: Locale = "en";
