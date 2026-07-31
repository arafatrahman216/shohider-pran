"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./PetitionReviewView.module.css";

type ReviewPetition = {
  id: string;
  title: string;
  ask: string;
  draftText: string | null;
  proposedBy: { fullName: string; district: string };
};

export default function PetitionReviewView({ dict }: { dict: Dictionary }) {
  const t = dict.petitions;
  const [petitions, setPetitions] = useState<ReviewPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/petitions/review")
      .then((res) => res.json())
      .then((data: { petitions: ReviewPetition[] }) => {
        setPetitions(data.petitions);
        setLoading(false);
      });
  }, []);

  async function approve(id: string) {
    setApprovingId(id);
    try {
      await fetch(`/api/petitions/${id}/approve`, { method: "POST" });
      setPetitions((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.reviewTitle}</h1>
      <p className={styles.subtitle}>{t.reviewSubtitle}</p>

      {!loading && petitions.length === 0 && <p className={styles.empty}>{t.reviewEmpty}</p>}

      {petitions.map((p) => (
        <div key={p.id} className={styles.card}>
          <h2 className={`${styles.cardTitle} display`}>{p.title}</h2>
          <p className={styles.meta}>
            {p.proposedBy.fullName} · {p.proposedBy.district}
          </p>
          <div className={styles.textBlock}>
            <p className={styles.textLabel}>{t.askLabelReview}</p>
            <p className={styles.textBody}>{p.ask}</p>
          </div>
          <div className={styles.textBlock}>
            <p className={styles.textLabel}>{t.draftLabel}</p>
            <p className={styles.textBody}>{p.draftText ?? t.noDraftYet}</p>
          </div>
          <button
            type="button"
            className={styles.approveButton}
            disabled={approvingId === p.id}
            onClick={() => approve(p.id)}
          >
            {approvingId === p.id ? t.approving : t.approveButton}
          </button>
        </div>
      ))}
    </div>
  );
}
