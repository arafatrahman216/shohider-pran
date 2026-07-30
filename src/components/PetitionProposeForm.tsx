"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./PetitionProposeForm.module.css";

export default function PetitionProposeForm({ dict }: { dict: Dictionary }) {
  const t = dict.petitions;
  const [title, setTitle] = useState("");
  const [ask, setAsk] = useState("");
  const [proposerId, setProposerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!title.trim() || !ask.trim() || !proposerId.trim()) {
      setError(t.errorRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedById: proposerId.trim(), title, ask }),
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
        <h1 className={`${styles.title} display`}>{t.proposeTitle}</h1>
        <p className={styles.notice}>{t.submitted}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.proposeTitle}</h1>
      <p className={styles.subtitle}>{t.proposeSubtitle}</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="petition-title">
          {t.titleLabel}
        </label>
        <input
          id="petition-title"
          className={styles.input}
          value={title}
          placeholder={t.titlePlaceholder}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="petition-ask">
          {t.askLabel}
        </label>
        <textarea
          id="petition-ask"
          className={styles.textarea}
          value={ask}
          placeholder={t.askPlaceholder}
          onChange={(e) => setAsk(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="petition-proposer">
          {t.proposerIdLabel}
        </label>
        <input
          id="petition-proposer"
          className={styles.input}
          value={proposerId}
          placeholder={t.proposerIdPlaceholder}
          onChange={(e) => setProposerId(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.submitButton} onClick={submit} disabled={submitting}>
        {submitting ? t.submitting : t.submitButton}
      </button>
    </div>
  );
}
