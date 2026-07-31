"use client";

import styles from "./AdminLogoutButton.module.css";

export default function AdminLogoutButton({ label }: { label: string }) {
  async function onClick() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <button type="button" className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
}
