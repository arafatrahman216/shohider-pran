"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import styles from "./StoryReviewView.module.css";

type ReviewStory = {
  id: string;
  authorName: string | null;
  originalLocale: "BN" | "EN";
  bodyBn: string | null;
  bodyEn: string | null;
  bnReviewed: boolean;
  enReviewed: boolean;
  registrant: { fullName: string; district: string };
};

export default function StoryReviewView({ dict }: { dict: Dictionary }) {
  const t = dict.stories;
  const [stories, setStories] = useState<ReviewStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stories/review")
      .then((res) => res.json())
      .then((data: { stories: ReviewStory[] }) => {
        setStories(data.stories);
        setLoading(false);
      });
  }, []);

  async function approve(storyId: string, locale: "bn" | "en") {
    setApprovingId(storyId);
    try {
      await fetch(`/api/stories/${storyId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.adminBar}>
        <AdminLogoutButton label={dict.admin.logout} />
      </div>
      <h1 className={`${styles.title} display`}>{t.reviewTitle}</h1>
      <p className={styles.subtitle}>{t.reviewSubtitle}</p>

      {!loading && stories.length === 0 && <p className={styles.empty}>{t.reviewEmpty}</p>}

      {stories.map((s) => {
        const pendingLocale: "bn" | "en" = s.originalLocale === "BN" ? "en" : "bn";
        const originalText = s.originalLocale === "BN" ? s.bodyBn : s.bodyEn;
        const draftText = pendingLocale === "bn" ? s.bodyBn : s.bodyEn;

        return (
          <div key={s.id} className={styles.card}>
            <p className={styles.meta}>
              {s.registrant.fullName} · {s.registrant.district}
            </p>
            <div className={styles.textBlock}>
              <p className={styles.textLabel}>{t.originalLabel}</p>
              <p className={styles.textBody}>{originalText}</p>
            </div>
            <div className={styles.textBlock}>
              <p className={styles.textLabel}>{t.draftTranslationLabel}</p>
              <p className={styles.textBody}>{draftText}</p>
            </div>
            <button
              type="button"
              className={styles.approveButton}
              disabled={approvingId === s.id}
              onClick={() => approve(s.id, pendingLocale)}
            >
              {approvingId === s.id ? t.approving : t.approveButton}
            </button>
          </div>
        );
      })}
    </div>
  );
}
