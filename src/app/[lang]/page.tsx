import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import Hero from "@/components/Hero";
import RegistryCounters from "@/components/RegistryCounters";
import ExtendedCalendar from "@/components/ExtendedCalendar";
import DocumentedArchive from "@/components/DocumentedArchive";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Hero dict={dict} locale={locale} />
      <RegistryCounters dict={dict} locale={locale} counts={{ martyrs: 844, injured: 14369, estimatedDeaths: 1400 }} />
      <DocumentedArchive locale={locale} />
      <ExtendedCalendar dict={dict} locale={locale} />
    </>
  );
}
