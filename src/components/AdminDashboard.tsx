"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import styles from "./AdminDashboard.module.css";

const LINKS = [
  { href: "registrants/review", titleKey: "registrantsReview", hintKey: "registrantsReviewHint" },
  { href: "stories/review", titleKey: "storiesReview", hintKey: "storiesReviewHint" },
  { href: "petitions/review", titleKey: "petitionsReview", hintKey: "petitionsReviewHint" },
  { href: "follow-up", titleKey: "followUp", hintKey: "followUpHint" },
] as const;

export default function AdminDashboard({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.admin.dashboard;
  const [scraping, setScraping] = useState<"dghs" | "jssfbd" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function runScrape(source: "dghs" | "jssfbd") {
    setScraping(source);
    setResult(null);
    try {
      const res = await fetch(`/api/scrape/${source}`, { method: "POST" });
      const data = await res.json();
      setResult(res.ok ? JSON.stringify(data) : (data.error ?? t.scrapeResult));
    } catch {
      setResult(t.scrapeResult);
    } finally {
      setScraping(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.adminBar}>
        <AdminLogoutButton label={dict.admin.logout} />
      </div>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <div className={styles.links}>
        {LINKS.map((link) => (
          <Link key={link.href} href={`/${locale}/${link.href}`} className={styles.linkCard}>
            <span className={styles.linkTitle}>{t[link.titleKey]}</span>
            <span className={styles.linkHint}>{t[link.hintKey]}</span>
          </Link>
        ))}
      </div>

      <div className={styles.scrapeSection}>
        <h2 className={styles.scrapeTitle}>{t.scrapeTitle}</h2>
        <p className={styles.subtitle}>{t.scrapeSubtitle}</p>
        <div className={styles.scrapeButtons}>
          <button
            type="button"
            className={styles.scrapeButton}
            onClick={() => runScrape("dghs")}
            disabled={scraping !== null}
          >
            {scraping === "dghs" ? t.scraping : t.scrapeDghs}
          </button>
          <button
            type="button"
            className={styles.scrapeButton}
            onClick={() => runScrape("jssfbd")}
            disabled={scraping !== null}
          >
            {scraping === "jssfbd" ? t.scraping : t.scrapeJssfbd}
          </button>
        </div>
        {result && <p className={styles.scrapeResult}>{result}</p>}
      </div>
    </div>
  );
}
