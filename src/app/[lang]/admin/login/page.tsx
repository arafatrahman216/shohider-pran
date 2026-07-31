import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import AdminLoginForm from "@/components/AdminLoginForm";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { lang } = await params;
  const { next } = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <AdminLoginForm dict={dict} locale={locale} next={next ?? `/${locale}`} />;
}
