"use client";
import { useState } from "react";
import styles from "./AuthorityIssues.module.css";

type Issue = { issueId: string; status: string; subject: string; recipientName: string; authorityName: string; updates: { id: string; status: string; note: string; updatedBy: string | null; createdAt: string }[] };
export default function AuthorityIssues({ locale }: { locale: "bn" | "en" }) {
  const bn = locale === "bn";
  const [form, setForm] = useState({ applicantName: "", registrantId: "", recipientName: "", authorityName: "", subject: "", details: "" });
  const [track, setTrack] = useState({ issueId: "", registrantId: "" });
  const [created, setCreated] = useState<string | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  async function submit() {
    setError("");
    const res = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setCreated(data.issue.issueId);
  }
  async function lookup() {
    setError(""); setIssue(null);
    const q = new URLSearchParams(track);
    const res = await fetch(`/api/issues?${q}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setIssue(data.issue);
  }
  return <div className={styles.wrapper}>
    <h1>{bn ? "কর্তৃপক্ষের কাছে আবেদন" : "Request to an authority"}</h1>
    <p>{bn ? "সরকারি কর্মকর্তা বা যেকোনো দায়িত্বশীল উচ্চ কর্তৃপক্ষের কাছে বিষয়টি পৌঁছাতে আবেদন করুন।" : "Submit a request to a government officer or any responsible higher authority."}</p>
    <section className={styles.card}>
      <h2>{bn ? "নতুন আবেদন" : "New request"}</h2>
      {(["applicantName", "registrantId", "recipientName", "authorityName", "subject"] as const).map((key) =>
        <input key={key} className={styles.input} value={form[key]} onChange={(e) => set(key, e.target.value)}
          placeholder={{ applicantName: bn ? "আবেদনকারীর নাম" : "Applicant name", registrantId: bn ? "রেজিস্ট্রেশন আইডি" : "Registration ID", recipientName: bn ? "যার কাছে পাঠাবেন—তার নাম" : "Recipient person's name", authorityName: bn ? "পদবী/কর্তৃপক্ষ/প্রতিষ্ঠান" : "Designation/authority/organization", subject: bn ? "বিষয়" : "Subject" }[key]} />)}
      <textarea className={styles.input} value={form.details} onChange={(e) => set("details", e.target.value)} placeholder={bn ? "বিস্তারিত অনুরোধ" : "Request details"} />
      <button className={styles.button} onClick={submit}>{bn ? "আবেদন জমা দিন" : "Submit request"}</button>
      {created && <p className={styles.success}>{bn ? "আপনার Issue ID:" : "Your Issue ID:"} <strong>{created}</strong></p>}
    </section>
    <section className={styles.card}>
      <h2>{bn ? "আবেদনের আপডেট দেখুন" : "Track your request"}</h2>
      <input className={styles.input} value={track.issueId} onChange={(e) => setTrack({ ...track, issueId: e.target.value })} placeholder="Issue ID" />
      <input className={styles.input} value={track.registrantId} onChange={(e) => setTrack({ ...track, registrantId: e.target.value })} placeholder={bn ? "রেজিস্ট্রেশন আইডি" : "Registration ID"} />
      <button className={styles.button} onClick={lookup}>{bn ? "অবস্থা দেখুন" : "Check status"}</button>
      {issue && <div><h3>{issue.subject}</h3><p>{issue.recipientName} · {issue.authorityName} · <strong>{issue.status}</strong></p>
        {issue.updates.map((u) => <p className={styles.update} key={u.id}><strong>{u.status}</strong> — {u.note}{u.updatedBy ? ` · ${u.updatedBy}` : ""}</p>)}</div>}
    </section>
    {error && <p className={styles.error}>{error}</p>}
  </div>;
}
