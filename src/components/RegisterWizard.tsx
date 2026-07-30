"use client";

import { useState } from "react";
import Link from "next/link";
import { districts } from "@/lib/districts";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import type { RegistrantDTO } from "@/lib/registrant-dto";
import RegistrationResult from "./RegistrationResult";
import styles from "./RegisterWizard.module.css";

type Category = "SHOHID" | "AHOTO";

type FormState = {
  category: Category | null;
  fullName: string;
  nid: string;
  district: string;
  guardian: string;
};

type StepId = "category" | "fullName" | "nid" | "district" | "guardian" | "review";
const STEPS: StepId[] = ["category", "fullName", "nid", "district", "guardian", "review"];

const initialForm: FormState = {
  category: null,
  fullName: "",
  nid: "",
  district: "",
  guardian: "",
};

export default function RegisterWizard({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.register;
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registrant, setRegistrant] = useState<RegistrantDTO | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">("idle");

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isOptionalStep = step === "nid" || step === "guardian";
  const requiredStepValue =
    step === "category" ? form.category ?? "" : step === "fullName" ? form.fullName : form.district;

  function goNext(requireValue?: string) {
    if (requireValue !== undefined && !requireValue.trim()) {
      setError(t.errorRequired);
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    if (!form.category || !form.fullName.trim() || !form.district.trim()) {
      setError(t.errorRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/registrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          fullName: form.fullName,
          district: form.district,
          nidOrBirthReg: form.nid || undefined,
          fatherOrSpouseName: form.guardian || undefined,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { registrant: RegistrantDTO };
      setRegistrant(data.registrant);
    } catch {
      setError(t.errorGeneric);
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
      setRegistrant({
        ...registrant,
        verificationStatus: "VERIFIED",
        matchedRecord: record ?? null,
        candidates: [],
      });
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
    setUploadState("uploading");
    const body = new FormData();
    body.append("file", file);
    await fetch(`/api/registrants/${registrant.id}/documents`, { method: "POST", body });
    setUploadState("done");
  }

  if (registrant) {
    return (
      <RegistrationResult
        dict={dict}
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
      <p className={styles.progress}>
        {t.stepOf.replace("{current}", String(stepIndex + 1)).replace("{total}", String(STEPS.length))}
      </p>

      {stepIndex === 0 && (
        <p className={styles.hint}>
          {t.switchToChat} <Link href={`/${locale}/register/chat`}>{t.switchToChatLink}</Link>
        </p>
      )}

      {step === "category" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.category.question}</h1>
          <div className={styles.choices}>
            <button
              type="button"
              className={`${styles.choice} ${form.category === "SHOHID" ? styles.choiceSelected : ""}`}
              onClick={() => setForm({ ...form, category: "SHOHID" })}
            >
              {t.steps.category.shohid}
            </button>
            <button
              type="button"
              className={`${styles.choice} ${form.category === "AHOTO" ? styles.choiceSelected : ""}`}
              onClick={() => setForm({ ...form, category: "AHOTO" })}
            >
              {t.steps.category.ahoto}
            </button>
          </div>
        </>
      )}

      {step === "fullName" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.fullName.question}</h1>
          <input
            className={styles.input}
            value={form.fullName}
            placeholder={t.steps.fullName.placeholder}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            autoFocus
          />
        </>
      )}

      {step === "nid" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.nid.question}</h1>
          <p className={styles.hint}>{t.steps.nid.hint}</p>
          <input
            className={styles.input}
            value={form.nid}
            placeholder={t.steps.nid.placeholder}
            onChange={(e) => setForm({ ...form, nid: e.target.value })}
          />
        </>
      )}

      {step === "district" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.district.question}</h1>
          <select
            className={styles.select}
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          >
            <option value="">{t.steps.district.placeholder}</option>
            {districts.map((d) => (
              <option key={d.value} value={d.en}>
                {locale === "bn" ? d.bn : d.en}
              </option>
            ))}
          </select>
        </>
      )}

      {step === "guardian" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.guardian.question}</h1>
          <p className={styles.hint}>{t.steps.guardian.hint}</p>
          <input
            className={styles.input}
            value={form.guardian}
            placeholder={t.steps.guardian.placeholder}
            onChange={(e) => setForm({ ...form, guardian: e.target.value })}
          />
        </>
      )}

      {step === "review" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.review.question}</h1>
          <div className={styles.reviewList}>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>{t.steps.review.category}</span>
              <span>
                {form.category === "SHOHID" ? t.steps.category.shohid : t.steps.category.ahoto}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>{t.steps.review.name}</span>
              <span>{form.fullName}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>{t.steps.review.nid}</span>
              <span>{form.nid || t.steps.review.notProvided}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>{t.steps.review.district}</span>
              <span>{form.district || t.steps.review.notProvided}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>{t.steps.review.guardian}</span>
              <span>{form.guardian || t.steps.review.notProvided}</span>
            </div>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.buttonSecondary} onClick={goBack} disabled={stepIndex === 0}>
          {t.back}
        </button>
        <div className={styles.actionsRight}>
          {isOptionalStep && (
            <button type="button" className={styles.buttonGhost} onClick={() => goNext()}>
              {t.skip}
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => goNext(isOptionalStep ? undefined : requiredStepValue)}
            >
              {t.next}
            </button>
          )}
          {isLast && (
            <button type="button" className={styles.buttonPrimary} onClick={submit} disabled={submitting}>
              {submitting ? t.submitting : t.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
