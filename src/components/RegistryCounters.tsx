"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { DghsRegistryCounts } from "@/lib/registry-stats";
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
}: {
  dict: Dictionary;
  counts: DghsRegistryCounts;
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
  const stats = [
    { key: "martyrs" as const, target: counts.martyrs },
    { key: "injured" as const, target: counts.injured },
  ];

  return (
    <section className={styles.section} ref={ref}>
      <h2 className={styles.heading}>{dict.home.counters.heading}</h2>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <Counter
            key={stat.key}
            target={stat.target}
            active={active}
            formatter={formatter}
            label={dict.home.counters[stat.key]}
          />
        ))}
      </div>
      <p className={styles.source}>{dict.home.counters.source}</p>
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
