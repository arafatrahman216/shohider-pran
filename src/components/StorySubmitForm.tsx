"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./StorySubmitForm.module.css";

export default function StorySubmitForm({
  dict,
  locale,
  registrantId,
}: {
  dict: Dictionary;
  locale: Locale;
  registrantId: string;
}) {
  const t = dict.stories;
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!text.trim()) {
      setError(t.errorRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrantId,
          locale,
          authorName: authorName || undefined,
          body: text,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setSubmitted(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.wrapper}>
        <h1 className={`${styles.title} display`}>{t.submitTitle}</h1>
        <p className={styles.notice}>{t.submitted}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.submitTitle}</h1>
      <p className={styles.subtitle}>{t.submitSubtitle}</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="story-author">
          {t.authorNameLabel}
        </label>
        <input
          id="story-author"
          className={styles.input}
          value={authorName}
          placeholder={t.authorNamePlaceholder}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="story-body">
          {t.bodyLabel}
        </label>
        <textarea
          id="story-body"
          className={styles.textarea}
          value={text}
          placeholder={t.bodyPlaceholder}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.submitButton} onClick={submit} disabled={submitting}>
        {submitting ? t.submitting : t.submitButton}
      </button>
    </div>
  );
}
