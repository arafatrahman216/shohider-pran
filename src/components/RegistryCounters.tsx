"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./RegistryCounters.module.css";

const DURATION_MS = 1400;

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      if (reduced) {
        setValue(target);
        return;
      }
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return value;
}

export default function RegistryCounters({
  dict,
  counts,
  locale,
}: {
  dict: Dictionary;
  counts: { martyrs: number; injured: number; estimatedDeaths: number };
  locale: "bn" | "en";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const formatter = new Intl.NumberFormat("en-US");

  return (
    <section className={styles.section} ref={ref}>
      <h2 className={styles.heading}>{dict.home.counters.heading}</h2>
      <div className={styles.grid}>
        {([
          { key: "martyrs", target: counts.martyrs, label: locale === "bn" ? "সরকারি গেজেটভুক্ত জুলাই শহীদ" : "Officially gazetted July martyrs" },
          { key: "injured", target: counts.injured, label: locale === "bn" ? "সরকারি MIS-এ তালিকাভুক্ত জুলাই যোদ্ধা" : "July fighters listed in the government MIS" },
          { key: "estimatedDeaths", target: counts.estimatedDeaths, label: locale === "bn" ? "UN-এর আনুমানিক মোট নিহত—সর্বোচ্চ" : "UN estimated deaths—up to" },
        ] as const).map((stat) => (
          <Counter
            key={stat.key}
            target={stat.target}
            active={active}
            formatter={formatter}
            label={stat.label}
          />
        ))}
      </div>
      <p className={styles.source}>
        <a href="https://www.bssnews.net/news/386790" target="_blank" rel="noreferrer">
          {locale === "bn"
            ? "সরকারি তথ্য, ১৩ মে ২০২৬: ৮৪৪ শহীদ এবং MIS-এ ১৪,৩৬৯ জুলাই যোদ্ধা"
            : "Government figures, 13 May 2026: 844 martyrs and 14,369 July fighters in the MIS"}
        </a>
        {" · "}
        <a href="https://www.ohchr.org/en/documents/country-reports/ohchr-fact-finding-report-human-rights-violations-and-abuses-related" target="_blank" rel="noreferrer">
          {locale === "bn" ? "OHCHR fact-finding estimate: প্রায় ১,৪০০ নিহত" : "OHCHR fact-finding estimate: approximately 1,400 killed"}
        </a>
        {locale === "bn"
          ? "। সরকারি গেজেটভুক্ত শহীদ এবং UN-এর estimated deaths আলাদা সংজ্ঞার সংখ্যা।"
          : ". The official gazetted-martyr count and UN estimated deaths use different definitions."}
      </p>
    </section>
  );
}

function Counter({
  target,
  active,
  formatter,
  label,
}: {
  target: number;
  active: boolean;
  formatter: Intl.NumberFormat;
  label: string;
}) {
  const value = useCountUp(target, active);
  return (
    <div className={styles.stat}>
      <div className={styles.value}>{formatter.format(value)}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
