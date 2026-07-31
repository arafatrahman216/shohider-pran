"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./PetitionsList.module.css";

export default function PetitionSignForm({
  dict,
  petitionId,
  initialCount,
}: {
  dict: Dictionary;
  petitionId: string;
  initialCount: number;
}) {
  const t = dict.petitions;
  const [registrantId, setRegistrantId] = useState("");
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [count, setCount] = useState(initialCount);
  const [signed, setSigned] = useState(false);

  async function sign() {
    if (!registrantId.trim()) return;
    setSigning(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrantId: registrantId.trim() }),
      });
      const data = (await res.json()) as { signatureCount?: number; error?: string };
      if (res.status === 404) {
        setMessage(t.signErrorNotFound);
      } else if (res.status === 409) {
        setMessage(t.signErrorDuplicate);
      } else if (!res.ok) {
        setMessage(t.signErrorGeneric);
      } else {
        setCount(data.signatureCount ?? count + 1);
        setSigned(true);
        setMessage(t.signSuccess);
      }
    } catch {
      setMessage(t.signErrorGeneric);
    } finally {
      setSigning(false);
    }
  }

  return (
    <div>
      <p className={styles.signatureCount}>
        {count} {t.signaturesLabel}
      </p>
      {!signed && (
        <div className={styles.signRow}>
          <input
            className={styles.input}
            value={registrantId}
            placeholder={t.signPlaceholder}
            onChange={(e) => setRegistrantId(e.target.value)}
          />
          <button type="button" className={styles.signButton} onClick={sign} disabled={signing}>
            {signing ? t.signing : t.signButton}
          </button>
        </div>
      )}
      {message && <p className={styles.signMessage}>{message}</p>}
    </div>
  );
}
