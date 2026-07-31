import Link from "next/link";
import AdminLogout from "@/components/AdminLogout";
import { requireAdminPage } from "@/lib/admin-auth";
import { defaultLocale, isLocale, type Locale } from "@/lib/dictionaries";
export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  await requireAdminPage(locale);
  return <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
    <h1>{locale === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin dashboard"}</h1>
    <ul>
      <li><Link href={`/${locale}/stories/review`}>{locale === "bn" ? "গল্প যাচাই" : "Validate stories"}</Link></li>
      <li><Link href={`/${locale}/issues/review`}>{locale === "bn" ? "কর্তৃপক্ষের আবেদন পরিচালনা" : "Manage authority requests"}</Link></li>
      <li><Link href={`/${locale}/petitions/review`}>{locale === "bn" ? "যৌথ চিঠি অনুমোদন" : "Approve petitions"}</Link></li>
      <li><Link href={`/${locale}/follow-up`}>{locale === "bn" ? "ফলো-আপ পরিচালনা" : "Manage follow-ups"}</Link></li>
    </ul>
    <AdminLogout locale={locale} />
  </div>;
}
