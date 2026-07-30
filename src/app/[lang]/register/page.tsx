import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import RegisterWizard from "@/components/RegisterWizard";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <RegisterWizard dict={dict} locale={locale} />;
}
