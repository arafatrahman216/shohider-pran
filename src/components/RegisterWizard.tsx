"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { districts } from "@/lib/districts";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import type { DocumentDTO, RegistrantDTO, UploadState } from "@/lib/registrant-dto";
import {
  clearDraft,
  getDraftSnapshot,
  getServerDraftSnapshot,
  saveDraft,
  subscribeDraft,
  type RegistrationDraft,
} from "@/lib/registration-draft";
import { queueRegistration } from "@/lib/offline-queue";
import RegistrationResult from "./RegistrationResult";
import styles from "./RegisterWizard.module.css";

type Category = "SHOHID" | "AHOTO";

type FormState = {
  isProxy: boolean | null;
  proxyName: string;
  proxyRelationship: string;
  category: Category | null;
  fullName: string;
  nid: string;
  district: string;
  guardian: string;
};

type StepId =
  | "proxy"
  | "proxyName"
  | "proxyRelationship"
  | "category"
  | "fullName"
  | "nid"
  | "district"
  | "guardian"
  | "review";

function getSteps(isProxy: boolean | null): StepId[] {
  return [
    "proxy",
    ...(isProxy ? (["proxyName", "proxyRelationship"] as StepId[]) : []),
    "category",
    "fullName",
    "nid",
    "district",
    "guardian",
    "review",
  ];
}

const initialForm: FormState = {
  isProxy: null,
  proxyName: "",
  proxyRelationship: "",
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
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [draftChoiceMade, setDraftChoiceMade] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const draftRaw = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getServerDraftSnapshot);
  const draft: RegistrationDraft<FormState> | null = (() => {
    if (!draftRaw) return null;
    try {
      return JSON.parse(draftRaw) as RegistrationDraft<FormState>;
    } catch {
      return null;
    }
  })();
  const showResumeBanner = Boolean(draft) && !draftChoiceMade;

  useEffect(() => {
    if (showResumeBanner) return;
    if (JSON.stringify(form) === JSON.stringify(initialForm) && stepIndex === 0) return;
    saveDraft(form, stepIndex);
  }, [form, stepIndex, showResumeBanner]);

  function resumeDraft() {
    if (draft) {
      setForm(draft.form);
      setStepIndex(draft.stepIndex);
    }
    setDraftChoiceMade(true);
  }

  function discardDraft() {
    clearDraft();
    setDraftChoiceMade(true);
  }

  const steps = getSteps(form.isProxy);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isOptionalStep = step === "nid" || step === "guardian" || step === "proxyRelationship";
  const requiredStepValue =
    step === "proxy"
      ? form.isProxy === null
        ? ""
        : "set"
      : step === "proxyName"
        ? form.proxyName
        : step === "category"
          ? form.category ?? ""
          : step === "fullName"
            ? form.fullName
            : form.district;

  function goNext(requireValue?: string) {
    if (requireValue !== undefined && !requireValue.trim()) {
      setError(t.errorRequired);
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
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
    const payload = {
      category: form.category,
      fullName: form.fullName,
      district: form.district,
      nidOrBirthReg: form.nid || undefined,
      fatherOrSpouseName: form.guardian || undefined,
      proxyName: form.isProxy ? form.proxyName || undefined : undefined,
      proxyRelationship: form.isProxy ? form.proxyRelationship || undefined : undefined,
    };
    try {
      const res = await fetch("/api/registrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error || "request failed");
      }
      const data = (await res.json()) as { registrant: RegistrantDTO };
      clearDraft();
      setRegistrant(data.registrant);
    } catch (err) {
      if (err instanceof TypeError) {
        // A genuine network failure (offline), not an HTTP error response —
        // save it instead of losing it, and sync automatically once back
        // online (Section 1's offline-first requirement).
        await queueRegistration(payload);
        clearDraft();
        setQueuedOffline(true);
      } else {
        setError(err instanceof Error ? err.message : t.errorGeneric);
      }
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
    setUploadState({ status: "uploading" });
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/registrants/${registrant.id}/documents`, { method: "POST", body });
    const data = (await res.json()) as { document: DocumentDTO };
    setUploadState({ status: "done", document: data.document });
  }

  if (queuedOffline) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.resumeBanner}>
          <p className={styles.question}>{t.offlineQueued.title}</p>
          <p className={styles.hint}>{t.offlineQueued.body}</p>
        </div>
      </div>
    );
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

  if (showResumeBanner && draft) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.resumeBanner}>
          <p className={styles.question}>{t.draft.question}</p>
          <p className={styles.hint}>
            {t.draft.savedAt.replace("{date}", new Date(draft.savedAt).toLocaleString())}
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.buttonSecondary} onClick={discardDraft}>
              {t.draft.startOver}
            </button>
            <button type="button" className={styles.buttonPrimary} onClick={resumeDraft}>
              {t.draft.resume}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.progress}>
        {t.stepOf.replace("{current}", String(stepIndex + 1)).replace("{total}", String(steps.length))}
      </p>

      {stepIndex === 0 && (
        <p className={styles.hint}>
          {t.switchToChat} <Link href={`/${locale}/register/chat`}>{t.switchToChatLink}</Link>
        </p>
      )}

      {step === "proxy" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.proxy.question}</h1>
          <div className={styles.choices}>
            <button
              type="button"
              className={`${styles.choice} ${form.isProxy === false ? styles.choiceSelected : ""}`}
              onClick={() => setForm({ ...form, isProxy: false })}
            >
              {t.steps.proxy.forSelf}
            </button>
            <button
              type="button"
              className={`${styles.choice} ${form.isProxy === true ? styles.choiceSelected : ""}`}
              onClick={() => setForm({ ...form, isProxy: true })}
            >
              {t.steps.proxy.forSomeoneElse}
            </button>
          </div>
        </>
      )}

      {step === "proxyName" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.proxyName.question}</h1>
          <input
            className={styles.input}
            value={form.proxyName}
            placeholder={t.steps.proxyName.placeholder}
            onChange={(e) => setForm({ ...form, proxyName: e.target.value })}
            autoFocus
          />
        </>
      )}

      {step === "proxyRelationship" && (
        <>
          <h1 className={`${styles.question} display`}>{t.steps.proxyRelationship.question}</h1>
          <input
            className={styles.input}
            value={form.proxyRelationship}
            placeholder={t.steps.proxyRelationship.placeholder}
            onChange={(e) => setForm({ ...form, proxyRelationship: e.target.value })}
          />
        </>
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
            {form.isProxy && (
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>{t.steps.review.filedByProxy}</span>
                <span>
                  {form.proxyName}
                  {form.proxyRelationship ? ` (${form.proxyRelationship})` : ""}
                </span>
              </div>
            )}
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
