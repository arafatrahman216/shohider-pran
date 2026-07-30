import "server-only";
import type en from "@/dictionaries/en.json";

export const locales = ["bn", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bn";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  bn: () => import("@/dictionaries/bn.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDictionary = (locale: Locale) => dictionaries[locale]();
