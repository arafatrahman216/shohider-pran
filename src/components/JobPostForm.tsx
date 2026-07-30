"use client";

import { useState } from "react";
import { districts } from "@/lib/districts";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./JobsBoard.module.css";

export default function JobPostForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.jobs;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [skills, setSkills] = useState("");
  const [postedByName, setPostedByName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  async function submit() {
    if (!title.trim() || !description.trim() || !district.trim() || !skills.trim() || !contactInfo.trim()) {
      setError(t.errorRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, district, skills, postedByName: postedByName || undefined, contactInfo }),
      });
      if (!res.ok) throw new Error("request failed");
      setPosted(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={`${styles.sectionTitle} display`}>{t.postTitle}</h2>
      <p className={styles.sectionSubtitle}>{t.postSubtitle}</p>

      {posted ? (
        <p className={styles.notice}>{t.posted}</p>
      ) : (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-title">
              {t.jobTitleLabel}
            </label>
            <input
              id="jp-title"
              className={styles.input}
              value={title}
              placeholder={t.jobTitlePlaceholder}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-description">
              {t.descriptionLabel}
            </label>
            <textarea
              id="jp-description"
              className={styles.textarea}
              value={description}
              placeholder={t.descriptionPlaceholder}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-district">
              {t.districtLabel}
            </label>
            <select
              id="jp-district"
              className={styles.select}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">{t.districtPlaceholder}</option>
              {districts.map((d) => (
                <option key={d.value} value={d.en}>
                  {locale === "bn" ? d.bn : d.en}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-skills">
              {t.skillsLabel}
            </label>
            <input
              id="jp-skills"
              className={styles.input}
              value={skills}
              placeholder={t.skillsPlaceholder}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-postedby">
              {t.postedByLabel}
            </label>
            <input
              id="jp-postedby"
              className={styles.input}
              value={postedByName}
              placeholder={t.postedByPlaceholder}
              onChange={(e) => setPostedByName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="jp-contact">
              {t.contactLabel}
            </label>
            <input
              id="jp-contact"
              className={styles.input}
              value={contactInfo}
              placeholder={t.contactPlaceholder}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="button" className={styles.submitButton} onClick={submit} disabled={submitting}>
            {submitting ? t.posting : t.postButton}
          </button>
        </>
      )}
    </div>
  );
}
