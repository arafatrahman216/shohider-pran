import type { Dictionary } from "@/lib/dictionaries";
import styles from "./Footer.module.css";

function GuardrailIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2l5 2.2v3c0 3.7-2.2 6.3-5 6.8-2.8-.5-5-3.1-5-6.8v-3L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.guardrails}>
        <p className={styles.guardrail}>
          <span className={styles.guardrailMark}><GuardrailIcon /></span>
          {dict.home.guardrail}
        </p>
        <p className={styles.guardrail}>
          <span className={styles.guardrailMark}><GuardrailIcon /></span>
          {dict.footer.guardrailAi}
        </p>
        <p className={styles.guardrail}>
          <span className={styles.guardrailMark}><GuardrailIcon /></span>
          {dict.footer.guardrailNumbers}
        </p>
      </div>
      <p className={styles.bottom}>
        © {year} {dict.footer.rights}
      </p>
    </footer>
  );
}
