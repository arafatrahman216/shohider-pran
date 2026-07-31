"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { districts } from "@/lib/districts";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./SearchRegistry.module.css";

type Result = {
  id: string;
  fullName: string;
  district: string;
  category: "SHOHID" | "AHOTO";
};

export default function SearchRegistry({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.search;
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [searching, setSearching] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() && !district) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (name.trim()) params.set("q", name.trim());
      if (district) params.set("district", district);
      const res = await fetch(`/api/registry/search?${params.toString()}`);
      const data = (await res.json()) as { registrants: Result[] };
      setResults(data.registrants);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor="search-name">
          {t.nameLabel}
        </label>
        <input
          id="search-name"
          className={styles.input}
          value={name}
          placeholder={t.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
        />

        <label className={styles.label} htmlFor="search-district">
          {t.districtLabel}
        </label>
        <select
          id="search-district"
          className={styles.select}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">{t.districtPlaceholder}</option>
          {districts.map((d) => (
            <option key={d.value} value={d.en}>
              {locale === "bn" ? d.bn : d.en}
            </option>
          ))}
        </select>

        <button type="submit" className={styles.button} disabled={searching}>
          {searching ? t.searching : t.searchButton}
        </button>
      </form>

      {results === null && <p className={styles.hint}>{t.emptyPrompt}</p>}

      {results !== null && results.length === 0 && (
        <div className={styles.noResults}>
          <p>{t.noResults}</p>
          <Link href={`/${locale}/register`} className={styles.registerCta}>
            {t.registerCta}
          </Link>
        </div>
      )}

      {results !== null && results.length > 0 && (
        <ul className={styles.results}>
          {results.map((r) => (
            <li key={r.id} className={styles.resultRow}>
              <span className={styles.resultName}>{r.fullName}</span>
              <span className={styles.resultMeta}>
                {r.district} · {t.resultCategory}: {r.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
