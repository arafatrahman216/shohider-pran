"use client";
import { useRouter } from "next/navigation";
export default function AdminLogout({ locale }: { locale: "bn" | "en" }) {
  const router = useRouter();
  return <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace(`/${locale}/admin/login`); router.refresh(); }}>
    {locale === "bn" ? "লগআউট" : "Logout"}
  </button>;
}
