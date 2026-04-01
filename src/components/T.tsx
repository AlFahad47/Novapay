"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import { getCachedTranslation, setCachedTranslations } from "@/lib/translationCache";
import en from "@/i18n/messages/en.json";
import bn from "@/i18n/messages/bn.json";
import ar from "@/i18n/messages/ar.json";
import fil from "@/i18n/messages/fil.json";

const LANG_MAP: Record<string, string> = {
  bn: "bn",
  ar: "ar",
  fil: "tl",
};

const MESSAGES = { en, bn, ar, fil };
const inflightTranslations = new Map<string, Promise<string>>();

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

interface NestedMessages {
  [key: string]: string | NestedMessages;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getByPath(source: NestedMessages, path: string[]): string | null {
  let current: unknown = source;

  for (const key of path) {
    if (!isObject(current) || !(key in current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
}

function buildLocaleDictionary(locale: keyof typeof MESSAGES): Record<string, string> {
  const output: Record<string, string> = {};

  const walk = (node: NestedMessages, path: string[] = []) => {
    Object.entries(node).forEach(([key, value]) => {
      const nextPath = [...path, key];

      if (typeof value === "string") {
        const translated = getByPath(MESSAGES[locale] as NestedMessages, nextPath);
        if (translated && translated !== value) {
          output[normalizeText(value)] = translated;
        }
        return;
      }

      walk(value as NestedMessages, nextPath);
    });
  };

  walk(MESSAGES.en as NestedMessages);
  return output;
}

const LOCALE_DICTIONARY: Record<string, Record<string, string>> = {
  bn: buildLocaleDictionary("bn"),
  ar: buildLocaleDictionary("ar"),
  fil: buildLocaleDictionary("fil"),
};

function shouldSkipTranslation(text: string): boolean {
  const trimmed = normalizeText(text);
  if (!trimmed) return true;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const isUrl = /^https?:\/\//i.test(trimmed);
  const isOnlySymbolsOrNumbers = /^[\d\s.,:/+\-()%$৳€£¥]+$/.test(trimmed);

  return isEmail || isUrl || isOnlySymbolsOrNumbers;
}

async function translateWithApi(text: string, locale: string): Promise<string> {
  const targetLang = LANG_MAP[locale] || locale;
  const normalized = normalizeText(text);
  const requestKey = `${locale}::${normalized}`;

  if (inflightTranslations.has(requestKey)) {
    return inflightTranslations.get(requestKey)!;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(normalized)}`;

  const request = fetch(url)
    .then((r) => r.json())
    .then((data) => data[0]?.map((item: string[]) => item[0]).join("") || text)
    .catch(() => text)
    .finally(() => {
      inflightTranslations.delete(requestKey);
    });

  inflightTranslations.set(requestKey, request);
  return request;
}

export default function T({ children }: { children: string }) {
  const { locale } = useLocale();
  const [text, setText] = useState(children);

  useEffect(() => {
    let cancelled = false;
    const normalizedChildren = normalizeText(children || "");

    const run = async () => {
      if (locale === "en" || !normalizedChildren || shouldSkipTranslation(normalizedChildren)) {
        if (!cancelled) setText(children);
        return;
      }

      const localDictionary = LOCALE_DICTIONARY[locale]?.[normalizedChildren];
      if (localDictionary) {
        if (!cancelled) setText(localDictionary);
        return;
      }

      const cached = getCachedTranslation(normalizedChildren, locale);
      if (cached && normalizeText(cached) !== normalizedChildren) {
        if (!cancelled) setText(cached);
        return;
      }

      const result = await translateWithApi(normalizedChildren, locale);
      if (cancelled) return;

      if (normalizeText(result) !== normalizedChildren) {
        setCachedTranslations({ [normalizedChildren]: result }, locale);
      }

      setText(result);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [children, locale]);

  return <>{text}</>;
}

