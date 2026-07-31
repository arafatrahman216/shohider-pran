"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./AdminLoginForm.module.css";

export default function AdminLoginForm({
  dict,
  locale,
  next,
}: {
  dict: Dictionary;
  locale: Locale;
  next: string;
}) {
  const t = dict.admin.login;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? t.genericError);
        setSubmitting(false);
        return;
      }
      window.location.href = next.startsWith(`/${locale}`) ? next : `/${locale}/admin`;
    } catch {
      setError(t.genericError);
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>
      <label className={styles.label} htmlFor="admin-password">
        {t.passwordLabel}
      </label>
      <input
        id="admin-password"
        type="password"
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={submitting}>
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
