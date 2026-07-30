import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import ThemeToggle from "@/components/ThemeToggle";
import AccessibilityToggle from "@/components/AccessibilityToggle";
import styles from "./Header.module.css";

export default function Header({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const otherLocale: Locale = locale === "bn" ? "en" : "bn";

  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5L3 4v4c0 3.4 2.1 5.9 5 6.5 2.9-.6 5-3.1 5-6.5V4l-5-2.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {dict.nav.brand}
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <AccessibilityToggle dict={dict.a11y} />
        <ThemeToggle dict={dict.theme} />
        <Link href={`/${locale}/stories`} className={styles.localeLink}>
          {dict.stories.navLabel}
        </Link>
        <Link href={`/${otherLocale}`} className={styles.localeLink}>
          {dict.nav.switchLocale}
        </Link>
        <Link href={`/${locale}/register`} className={styles.registerLink}>
          {dict.nav.register}
        </Link>
      </nav>
    </header>
  );
}
