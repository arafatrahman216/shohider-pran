"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./FollowUpView.module.css";

type FollowUpDraft = {
  id: string;
  draftText: string;
  status: "DRAFT" | "SENT";
  createdAt: string;
  daysOpen: number;
  registrant: {
    id: string;
    fullName: string;
    district: string;
    category: "SHOHID" | "AHOTO";
    createdAt: string;
  };
};

export default function FollowUpView({ dict }: { dict: Dictionary }) {
  const t = dict.followUp;
  const [drafts, setDrafts] = useState<FollowUpDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ scanned: number; drafted: number } | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  function loadDrafts() {
    return fetch("/api/follow-up")
      .then((res) => res.json())
      .then((data: { drafts: FollowUpDraft[] }) => {
        setDrafts(data.drafts);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetch("/api/follow-up")
      .then((res) => res.json())
      .then((data: { drafts: FollowUpDraft[] }) => {
        setDrafts(data.drafts);
        setLoading(false);
      });
  }, []);

  async function scan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/follow-up/scan", { method: "POST" });
      const data = (await res.json()) as { scanned: number; drafted: number };
      setScanResult(data);
      await loadDrafts();
    } finally {
      setScanning(false);
    }
  }

  async function markSent(draftId: string) {
    setSendingId(draftId);
    try {
      await fetch(`/api/follow-up/${draftId}/send`, { method: "POST" });
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <div className={styles.scanRow}>
        <button type="button" className={styles.scanButton} onClick={scan} disabled={scanning}>
          {scanning ? t.scanning : t.scanButton}
        </button>
        {scanResult && (
          <span className={styles.scanResult}>
            {t.scanResult
              .replace("{scanned}", String(scanResult.scanned))
              .replace("{drafted}", String(scanResult.drafted))}
          </span>
        )}
      </div>

      {!loading && drafts.length === 0 && <p className={styles.empty}>{t.empty}</p>}

      {drafts.map((d) => (
        <div key={d.id} className={styles.draftCard}>
          <div className={styles.meta}>
            <span>
              <span className={styles.metaLabel}>{t.registrationId}: </span>
              {d.registrant.id}
            </span>
            <span>
              <span className={styles.metaLabel}>{t.district}: </span>
              {d.registrant.district}
            </span>
            <span>
              <span className={styles.metaLabel}>{t.category}: </span>
              {d.registrant.category === "SHOHID"
                ? dict.register.steps.category.shohid
                : dict.register.steps.category.ahoto}
            </span>
            <span>
              <span className={styles.metaLabel}>{t.daysOpen}: </span>
              {d.daysOpen}
            </span>
          </div>
          <div className={styles.draftText}>{d.draftText}</div>
          <button
            type="button"
            className={styles.sendButton}
            disabled={sendingId === d.id}
            onClick={() => markSent(d.id)}
          >
            {sendingId === d.id ? t.sending : t.sendButton}
          </button>
          <p className={styles.sentNote}>{t.sentNote}</p>
        </div>
      ))}
    </div>
  );
}
