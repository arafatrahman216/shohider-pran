import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./Hero.module.css";

export default function Hero({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <p className={styles.kicker} style={{ ["--delay" as string]: "0ms" }}>
        <span className={styles.kickerLine} aria-hidden="true" />
        {dict.home.kicker}
      </p>
      <h1
        id="hero-title"
        className={`${styles.title} ${styles.reveal} display`}
        style={{ ["--delay" as string]: "120ms" }}
      >
        {dict.home.title}
      </h1>
      <p className={`${styles.subtitle} ${styles.reveal}`} style={{ ["--delay" as string]: "240ms" }}>
        {dict.home.subtitle}
      </p>
      <div className={`${styles.ctas} ${styles.reveal}`} style={{ ["--delay" as string]: "360ms" }}>
        <Link href={`/${locale}/register`} className={styles.ctaPrimary}>
          {dict.home.ctaPrimary}
        </Link>
        <Link href={`/${locale}/search`} className={styles.ctaSecondary}>
          {dict.home.ctaSecondary}
        </Link>
      </div>
    </section>
  );
}
