"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import styles from "./StoryReviewView.module.css";

type ReviewStory = {
  id: string; authorName: string | null; bodyBn: string | null; bodyEn: string | null;
  registrant: { fullName: string; district: string; verificationStatus: string };
};

export default function StoryReviewView({ dict }: { dict: Dictionary }) {
  const bn = dict.nav.register !== "Register";
  const [stories, setStories] = useState<ReviewStory[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, { by: string; evidence: string; note: string }>>({});
  useEffect(() => {
    fetch("/api/stories/review").then((r) => r.json()).then((d) => setStories(d.stories ?? []));
  }, []);
  function field(id: string) { return fields[id] ?? { by: "", evidence: "", note: "" }; }
  function setField(id: string, key: "by" | "evidence" | "note", value: string) {
    setFields((old) => ({ ...old, [id]: { ...field(id), [key]: value } }));
  }
  async function decide(id: string, status: "VALIDATED" | "UNVALIDATED") {
    setBusy(id);
    const f = field(id);
    const res = await fetch(`/api/stories/${id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, validatedBy: f.by, validationEvidence: f.evidence, validationNote: f.note }),
    });
    if (res.ok) setStories((old) => old.filter((s) => s.id !== id));
    setBusy(null);
  }
  return <div className={styles.wrapper}>
    <h1 className={`${styles.title} display`}>{bn ? "গল্প যাচাই" : "Story validation"}</h1>
    <p className={styles.subtitle}>{bn ? "প্রমাণ দেখে গল্পটি যাচাইকৃত বা এখনো যাচাইকৃত নয় হিসেবে প্রকাশ করুন।" : "Review the evidence, then publish as validated or not yet validated."}</p>
    {!stories.length && <p className={styles.empty}>{bn ? "অপেক্ষমাণ কোনো গল্প নেই।" : "No stories await review."}</p>}
    {stories.map((s) => <article className={styles.card} key={s.id}>
      <p className={styles.meta}>{s.registrant.fullName} · {s.registrant.district} · {s.registrant.verificationStatus}</p>
      <p className={styles.textBody}>{s.bodyBn ?? s.bodyEn}</p>
      <input className={styles.input} value={field(s.id).by} onChange={(e) => setField(s.id, "by", e.target.value)}
        placeholder={bn ? "কে যাচাই করেছেন (ঐচ্ছিক)" : "Validated by (optional)"} />
      <input className={styles.input} value={field(s.id).evidence} onChange={(e) => setField(s.id, "evidence", e.target.value)}
        placeholder={bn ? "প্রমাণ: CCTV/নথি/সাক্ষী (ঐচ্ছিক)" : "Evidence: CCTV/document/witness (optional)"} />
      <textarea className={styles.input} value={field(s.id).note} onChange={(e) => setField(s.id, "note", e.target.value)}
        placeholder={bn ? "পর্যালোচনা নোট (ঐচ্ছিক)" : "Review note (optional)"} />
      <div className={styles.actions}>
        <button className={styles.approveButton} disabled={busy === s.id} onClick={() => decide(s.id, "VALIDATED")}>{bn ? "যাচাইকৃত" : "Validated"}</button>
        <button className={styles.secondaryButton} disabled={busy === s.id} onClick={() => decide(s.id, "UNVALIDATED")}>{bn ? "এখনো যাচাইকৃত নয়" : "Not yet validated"}</button>
      </div>
    </article>)}
  </div>;
}
