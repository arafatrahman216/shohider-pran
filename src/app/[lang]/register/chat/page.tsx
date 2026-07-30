import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import IntakeChat from "@/components/IntakeChat";

export default async function RegisterChatPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <IntakeChat dict={dict} locale={locale} />;
}
