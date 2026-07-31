"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthorityIssues.module.css";

export default function AdminLogin({ locale }: { locale: "bn" | "en" }) {
  const bn = locale === "bn";
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function login() {
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.replace(`/${locale}/admin`);
    router.refresh();
  }
  return <div className={styles.wrapper}><section className={styles.card}>
    <h1>{bn ? "অ্যাডমিন লগইন" : "Admin login"}</h1>
    <input className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={bn ? "অ্যাডমিন নাম" : "Admin name"} />
    <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={bn ? "পাসওয়ার্ড" : "Password"} />
    <button className={styles.button} onClick={login}>{bn ? "লগইন" : "Login"}</button>
    {error && <p className={styles.error}>{error}</p>}
  </section></div>;
}
