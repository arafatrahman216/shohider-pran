import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <AdminDashboard dict={dict} locale={locale} />;
}
