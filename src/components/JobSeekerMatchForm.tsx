"use client";

import { useState } from "react";
import { districts } from "@/lib/districts";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import styles from "./JobsBoard.module.css";

type Match = {
  posting: {
    id: string;
    title: string;
    description: string;
    district: string;
    postedByName: string | null;
    contactInfo: string;
  };
  overlapSkills: string[];
};

export default function JobSeekerMatchForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.jobs;
  const [registrantId, setRegistrantId] = useState("");
  const [seekerName, setSeekerName] = useState("");
  const [district, setDistrict] = useState("");
  const [skills, setSkills] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);

  async function findMatches() {
    if (!registrantId.trim() || !seekerName.trim() || !district.trim() || !skills.trim() || !contactInfo.trim()) {
      setError(t.errorRequired);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrantId: registrantId.trim(),
          seekerName,
          district,
          skills,
          contactInfo,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { profile: { id: string } };
      const matchRes = await fetch(`/api/job-seekers/${data.profile.id}/matches`);
      const matchData = (await matchRes.json()) as { matches: Match[] };
      setMatches(matchData.matches);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={`${styles.sectionTitle} display`}>{t.findMatchesTitle}</h2>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="js-registrant">
          {t.registrantIdLabel}
        </label>
        <input
          id="js-registrant"
          className={styles.input}
          value={registrantId}
          placeholder={t.registrantIdPlaceholder}
          onChange={(e) => setRegistrantId(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="js-name">
          {t.seekerNameLabel}
        </label>
        <input
          id="js-name"
          className={styles.input}
          value={seekerName}
          placeholder={t.seekerNamePlaceholder}
          onChange={(e) => setSeekerName(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="js-district">
          {t.districtLabel}
        </label>
        <select
          id="js-district"
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
        <label className={styles.label} htmlFor="js-skills">
          {t.skillsLabel}
        </label>
        <input
          id="js-skills"
          className={styles.input}
          value={skills}
          placeholder={t.skillsPlaceholder}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="js-contact">
          {t.contactLabel}
        </label>
        <input
          id="js-contact"
          className={styles.input}
          value={contactInfo}
          placeholder={t.contactPlaceholder}
          onChange={(e) => setContactInfo(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.submitButton} onClick={findMatches} disabled={submitting}>
        {submitting ? t.finding : t.findButton}
      </button>

      {matches && (
        <div>
          <p className={styles.notice}>{t.matchesHeading}</p>
          {matches.length === 0 && <p className={styles.empty}>{t.noMatches}</p>}
          {matches.map((m) => (
            <div key={m.posting.id} className={styles.matchCard}>
              <h3 className={styles.matchTitle}>{m.posting.title}</h3>
              <p className={styles.matchMeta}>
                {t.matchedOn}: {m.overlapSkills.join(", ")}
              </p>
              <p className={styles.matchDescription}>{m.posting.description}</p>
              <p className={styles.matchContact}>{m.posting.contactInfo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
