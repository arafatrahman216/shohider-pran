"use client";

import type { Dictionary } from "@/lib/dictionaries";
import type { RegistrantDTO } from "@/lib/registrant-dto";
import styles from "./RegistrationResult.module.css";

export default function RegistrationResult({
  dict,
  registrant,
  submitting,
  uploadState,
  onConfirmCandidate,
  onRejectCandidates,
  onUploadFile,
}: {
  dict: Dictionary;
  registrant: RegistrantDTO;
  submitting: boolean;
  uploadState: "idle" | "uploading" | "done";
  onConfirmCandidate: (gazetteRecordId: string) => void;
  onRejectCandidates: () => void;
  onUploadFile: (file: File) => void;
}) {
  const t = dict.register;

  return (
    <div className={styles.wrapper}>
      {registrant.verificationStatus === "VERIFIED" && (
        <div className={styles.resultCard}>
          <h1 className={`${styles.resultTitle} display`}>{t.result.verifiedTitle}</h1>
          <p className={styles.resultBody}>{t.result.verifiedBody}</p>
          <div className={styles.registrationId}>
            {t.result.registrationId}: {registrant.id}
          </div>
          <WhatsNext t={t} />
        </div>
      )}

      {registrant.verificationStatus === "MATCH_PENDING_CONFIRMATION" && (
        <div className={styles.resultCard}>
          <h1 className={`${styles.resultTitle} display`}>{t.result.candidatesTitle}</h1>
          <p className={styles.resultBody}>{t.result.candidatesBody}</p>
          {registrant.candidates.map((c) => (
            <div key={c.id} className={styles.candidateCard}>
              <strong>{c.gazetteRecord.name}</strong>
              <p className={styles.candidateMeta}>
                {c.gazetteRecord.district ?? "—"} · {c.gazetteRecord.sourceName}
              </p>
              <button
                type="button"
                className={styles.buttonPrimary}
                disabled={submitting}
                onClick={() => onConfirmCandidate(c.gazetteRecord.id)}
              >
                {t.result.confirmCandidate}
              </button>
            </div>
          ))}
          <button type="button" className={styles.buttonGhost} disabled={submitting} onClick={onRejectCandidates}>
            {t.result.noneMatch}
          </button>
        </div>
      )}

      {registrant.verificationStatus === "UNVERIFIED_SELF_REPORTED" && (
        <div className={styles.resultCard}>
          <h1 className={`${styles.resultTitle} display`}>{t.result.notFoundTitle}</h1>
          <p className={styles.resultBody}>{t.result.notFoundBody}</p>
          <div className={styles.registrationId}>
            {t.result.registrationId}: {registrant.id}
          </div>
          <p className={styles.label}>{t.result.uploadLabel}</p>
          <div className={styles.uploadRow}>
            <input
              type="file"
              aria-label={t.result.uploadLabel}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadFile(file);
              }}
            />
            {uploadState === "done" && <span className={styles.candidateMeta}>{t.result.uploadedNote}</span>}
          </div>
          <WhatsNext t={t} />
        </div>
      )}
    </div>
  );
}

function WhatsNext({ t }: { t: Dictionary["register"] }) {
  return (
    <div className={styles.whatsNext}>
      <p className={styles.whatsNextTitle}>{t.result.whatsNext}</p>
      <p className={styles.candidateMeta}>{t.result.whatsNextBody}</p>
    </div>
  );
}
