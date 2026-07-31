"use client";
import { useEffect, useState } from "react";
import styles from "./AuthorityIssues.module.css";

type Item = { id: string; issueId: string; status: string; applicantName: string; recipientName: string; authorityName: string; subject: string; details: string; registrant: { fullName: string; verificationStatus: string } };
const statuses = ["SUBMITTED", "VERIFIED", "FORWARDED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
export default function IssueReviewView({ locale }: { locale: "bn" | "en" }) {
  const bn = locale === "bn";
  const [items, setItems] = useState<Item[]>([]);
  const [edits, setEdits] = useState<Record<string, { status: string; note: string; by: string }>>({});
  const load = () => fetch("/api/issues/review").then((r) => r.json()).then((d) => setItems(d.issues ?? []));
  useEffect(() => { void load(); }, []);
  function edit(id: string) { return edits[id] ?? { status: "VERIFIED", note: "", by: "" }; }
  function change(id: string, key: "status" | "note" | "by", value: string) { setEdits((e) => ({ ...e, [id]: { ...edit(id), [key]: value } })); }
  async function update(id: string) {
    const e = edit(id);
    const res = await fetch(`/api/issues/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.status, note: e.note, updatedBy: e.by }) });
    if (res.ok) void load();
  }
  return <div className={styles.wrapper}><h1>{bn ? "আবেদন পরিচালনা" : "Manage authority requests"}</h1>
    {items.map((i) => <article className={styles.card} key={i.id}>
      <h2>{i.subject}</h2><p><strong>{i.issueId}</strong> · {i.status}</p>
      <p>{i.applicantName} / {i.registrant.fullName} ({i.registrant.verificationStatus})</p>
      <p>{i.recipientName} · {i.authorityName}</p><p>{i.details}</p>
      <select className={styles.input} value={edit(i.id).status} onChange={(e) => change(i.id, "status", e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
      <input className={styles.input} value={edit(i.id).note} onChange={(e) => change(i.id, "note", e.target.value)} placeholder={bn ? "আপডেট নোট" : "Update note"} />
      <input className={styles.input} value={edit(i.id).by} onChange={(e) => change(i.id, "by", e.target.value)} placeholder={bn ? "আপডেটকারী/কর্তৃপক্ষ (ঐচ্ছিক)" : "Updated by/authority (optional)"} />
      <button className={styles.button} onClick={() => update(i.id)}>{bn ? "আপডেট করুন" : "Update"}</button>
    </article>)}
  </div>;
}
