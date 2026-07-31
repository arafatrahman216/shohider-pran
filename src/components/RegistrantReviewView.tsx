"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import styles from "./RegistrantReviewView.module.css";

type ReviewDocument = {
  id: string;
  fileName: string;
  fileUrl: string;
  screeningStatus: "PENDING" | "SCREENED" | "SCREENING_FAILED";
  screeningNote: string | null;
};

type ReviewRegistrant = {
  id: string;
  fullName: string;
  district: string;
  category: "SHOHID" | "AHOTO";
  filedByProxy: boolean;
  proxyName: string | null;
  proxyRelationship: string | null;
  documents: ReviewDocument[];
};

export default function RegistrantReviewView({ dict }: { dict: Dictionary }) {
  const t = dict.registrantReview;
  const [registrants, setRegistrants] = useState<ReviewRegistrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/registrants/pending")
      .then((res) => res.json())
      .then((data: { registrants: ReviewRegistrant[] }) => {
        setRegistrants(data.registrants);
        setLoading(false);
      });
  }, []);

  async function act(id: string, action: "admin-verify" | "admin-reject") {
    setActingId(id);
    try {
      await fetch(`/api/registrants/${id}/${action}`, { method: "POST" });
      setRegistrants((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.adminBar}>
        <AdminLogoutButton label={dict.admin.logout} />
      </div>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      {!loading && registrants.length === 0 && <p className={styles.empty}>{t.empty}</p>}

      {registrants.map((r) => (
        <div key={r.id} className={styles.card}>
          <div className={styles.meta}>
            <h2 className={styles.name}>{r.fullName}</h2>
            <p>
              <span className={styles.metaLabel}>{t.registrationId}: </span>
              <span className="mono">{r.id}</span>
            </p>
            <p>
              <span className={styles.metaLabel}>{t.district}: </span>
              {r.district}
            </p>
            <p>
              <span className={styles.metaLabel}>{t.category}: </span>
              {r.category}
            </p>
            {r.filedByProxy && (
              <p className={styles.proxyNote}>
                {t.proxyFiled
                  .replace("{name}", r.proxyName ?? "—")
                  .replace("{relationship}", r.proxyRelationship ?? "—")}
              </p>
            )}
          </div>

          <div className={styles.documents}>
            <p className={styles.documentsLabel}>{t.documentsLabel}</p>
            {r.documents.length === 0 && <p className={styles.empty}>{t.noDocuments}</p>}
            {r.documents.map((doc) => (
              <div key={doc.id} className={styles.documentRow}>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={styles.docLink}>
                  {t.viewDocument}: {doc.fileName}
                </a>
                {doc.screeningStatus === "PENDING" && (
                  <p className={styles.screeningPending}>{t.screeningPending}</p>
                )}
                {doc.screeningStatus === "SCREENING_FAILED" && (
                  <p className={styles.screeningFailed}>{t.screeningFailed}</p>
                )}
                {doc.screeningStatus === "SCREENED" && doc.screeningNote && (
                  <div className={styles.screeningNote}>
                    <p className={styles.textLabel}>{t.screeningNoteLabel}</p>
                    <p>{doc.screeningNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.verifyButton}
              onClick={() => act(r.id, "admin-verify")}
              disabled={actingId === r.id}
            >
              {actingId === r.id ? t.verifying : t.verifyButton}
            </button>
            <button
              type="button"
              className={styles.rejectButton}
              onClick={() => act(r.id, "admin-reject")}
              disabled={actingId === r.id}
            >
              {actingId === r.id ? t.rejecting : t.rejectButton}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
