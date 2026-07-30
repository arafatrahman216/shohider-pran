"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { julyTimeline } from "@/lib/july-timeline";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./ExtendedCalendar.module.css";

const FINAL_DAY = 36;

export default function ExtendedCalendar({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [selected, setSelected] = useState(FINAL_DAY);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const day = julyTimeline[selected - 1];

  function focusChip(index: number) {
    const el = chipRefs.current[index];
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(index + 1, julyTimeline.length - 1);
      setSelected(julyTimeline[next].day);
      focusChip(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(index - 1, 0);
      setSelected(julyTimeline[prev].day);
      focusChip(prev);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="calendar-heading">
      <div className={styles.sectionHead}>
        <p className={styles.subheading}>{dict.home.calendar.subheading}</p>
        <h2 id="calendar-heading" className={`${styles.heading} display`}>
          {dict.home.calendar.heading}
        </h2>
        <p className={styles.intro}>{dict.home.calendar.intro}</p>
      </div>

      <div className={styles.strip} role="listbox" aria-label={dict.home.calendar.heading}>
        {julyTimeline.map((d, i) => {
          const isFinal = d.day === FINAL_DAY;
          const isSelected = d.day === selected;
          return (
            <button
              key={d.day}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={[
                styles.chip,
                isSelected ? styles.chipSelected : "",
                isFinal ? styles.chipFinal : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ ["--delay" as string]: `${i * 22}ms` }}
              onClick={() => setSelected(d.day)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className={styles.chipDay}>{d.bnDigits}</span>
              <span className={styles.chipWeekday}>
                {locale === "bn" ? d.weekdayBn : d.weekdayEn}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.detail} aria-live="polite">
        <div className={styles.detailHead}>
          <span className={styles.detailDate}>
            {day.bnDigits} {locale === "bn" ? "জুলাই" : "July"} · {day.gregorian}
          </span>
          <span className={styles.detailWeekday}>
            {locale === "bn" ? day.weekdayBn : day.weekdayEn}
          </span>
        </div>
        <p className={styles.detailText}>{locale === "bn" ? day.bn : day.en}</p>
        <p className={styles.detailText} style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
          {dict.home.calendar.sourceNote}
        </p>
        {selected === FINAL_DAY && (
          <Link href={`/${locale}/register`} className={styles.detailCta}>
            {dict.home.ctaPrimary}
          </Link>
        )}
      </div>
    </section>
  );
}
