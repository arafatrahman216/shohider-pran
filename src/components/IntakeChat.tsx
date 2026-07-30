"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import type { DocumentDTO, RegistrantDTO, UploadState } from "@/lib/registrant-dto";
import RegistrationResult from "./RegistrationResult";
import styles from "./IntakeChat.module.css";

type ChatMessage = { role: "user" | "model"; text: string };

type ProposedRegistration = {
  category: "SHOHID" | "AHOTO";
  fullName: string;
  district: string;
  nidOrBirthReg?: string;
  fatherOrSpouseName?: string;
  proxyName?: string;
  proxyRelationship?: string;
};

export default function IntakeChat({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.intake;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "model", text: t.starterMessage }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<ProposedRegistration | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registrant, setRegistrant] = useState<RegistrantDTO | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: nextMessages }),
      });
      if (res.status === 503) {
        setUnavailable(true);
        return;
      }
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { reply: string | null; proposed: ProposedRegistration | null };
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply as string }]);
      }
      if (data.proposed) {
        setProposed(data.proposed);
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSending(false);
    }
  }

  async function confirmAndSubmit() {
    if (!proposed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/registrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposed),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { registrant: RegistrantDTO };
      setRegistrant(data.registrant);
      setProposed(null);
    } catch {
      setError(dict.register.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCandidate(gazetteRecordId: string) {
    if (!registrant) return;
    setSubmitting(true);
    try {
      await fetch(`/api/registrants/${registrant.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gazetteRecordId }),
      });
      const record = registrant.candidates.find((c) => c.gazetteRecord.id === gazetteRecordId)?.gazetteRecord;
      setRegistrant({ ...registrant, verificationStatus: "VERIFIED", matchedRecord: record ?? null, candidates: [] });
    } finally {
      setSubmitting(false);
    }
  }

  async function rejectCandidates() {
    if (!registrant) return;
    setSubmitting(true);
    try {
      await fetch(`/api/registrants/${registrant.id}/reject`, { method: "POST" });
      setRegistrant({ ...registrant, verificationStatus: "UNVERIFIED_SELF_REPORTED", candidates: [] });
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadDocument(file: File) {
    if (!registrant) return;
    setUploadState({ status: "uploading" });
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/registrants/${registrant.id}/documents`, { method: "POST", body });
    const data = (await res.json()) as { document: DocumentDTO };
    setUploadState({ status: "done", document: data.document });
  }

  if (registrant) {
    return (
      <RegistrationResult
        dict={dict}
        locale={locale}
        registrant={registrant}
        submitting={submitting}
        uploadState={uploadState}
        onConfirmCandidate={confirmCandidate}
        onRejectCandidates={rejectCandidates}
        onUploadFile={uploadDocument}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.switchLink}>
        {t.switchToForm}{" "}
        <Link href={`/${locale}/register`}>{t.switchToFormLink}</Link>
      </p>

      {unavailable && <p className={styles.notice}>{t.unavailable}</p>}

      {!unavailable && (
        <>
          <div className={styles.thread}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleModel}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className={styles.thinking}>{t.thinking}</div>}
          </div>

          {proposed && (
            <div className={styles.confirmCard}>
              <h2 className={styles.confirmTitle}>{t.confirmTitle}</h2>
              {proposed.proxyName && (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmLabel}>{dict.register.steps.review.filedByProxy}</span>
                  <span>
                    {proposed.proxyName}
                    {proposed.proxyRelationship ? ` (${proposed.proxyRelationship})` : ""}
                  </span>
                </div>
              )}
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>{dict.register.steps.review.category}</span>
                <span>
                  {proposed.category === "SHOHID"
                    ? dict.register.steps.category.shohid
                    : dict.register.steps.category.ahoto}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>{dict.register.steps.review.name}</span>
                <span>{proposed.fullName}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>{dict.register.steps.review.district}</span>
                <span>{proposed.district}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>{dict.register.steps.review.nid}</span>
                <span>{proposed.nidOrBirthReg || dict.register.steps.review.notProvided}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>{dict.register.steps.review.guardian}</span>
                <span>{proposed.fatherOrSpouseName || dict.register.steps.review.notProvided}</span>
              </div>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.buttonPrimary}
                  disabled={submitting}
                  onClick={confirmAndSubmit}
                >
                  {submitting ? dict.register.submitting : t.confirmButton}
                </button>
                <button type="button" className={styles.buttonGhost} onClick={() => setProposed(null)}>
                  {t.editButton}
                </button>
              </div>
            </div>
          )}

          {error && <p className={styles.notice}>{error}</p>}

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              placeholder={t.placeholder}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={sending || Boolean(proposed)}
            />
            <button
              type="button"
              className={styles.sendButton}
              onClick={send}
              disabled={sending || !input.trim() || Boolean(proposed)}
            >
              {t.send}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
