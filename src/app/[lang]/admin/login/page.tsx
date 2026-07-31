import AdminLogin from "@/components/AdminLogin";
import { defaultLocale, isLocale, type Locale } from "@/lib/dictionaries";
export default async function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return <AdminLogin locale={locale} />;
}
