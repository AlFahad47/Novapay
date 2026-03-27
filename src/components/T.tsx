"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import { getCachedTranslation, setCachedTranslations } from "@/lib/translationCache";

export default function T({ children }: { children: string }) {
  const { locale } = useLocale();
  const [text, setText] = useState(children);

  useEffect(() => {
    if (locale === "en" || !children?.trim()) {
      setText(children);
      return;
    }

    const cached = getCachedTranslation(children, locale);
    if (cached) {
      setText(cached);
      return;
    }

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [children], targetLang: locale }),
    })
      .then((r) => r.json())
      .then((data) => {
        const result = data.translated?.[0] || children;
        setCachedTranslations({ [children]: result }, locale);
        setText(result);
      })
      .catch(() => setText(children));
  }, [children, locale]);

  return <>{text}</>;
}
