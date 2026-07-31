import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import Hero from "@/components/Hero";
import RegistryCounters from "@/components/RegistryCounters";
import ExtendedCalendar from "@/components/ExtendedCalendar";
import { getDghsRegistryCounts } from "@/lib/registry-stats";

// Counts must reflect the current DGHS ingest, not whatever was true at
// last deploy — otherwise an admin re-scrape wouldn't show up until the
// next build.
export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const counts = await getDghsRegistryCounts();

  return (
    <>
      <Hero dict={dict} locale={locale} />
      <RegistryCounters dict={dict} counts={counts} />
      <ExtendedCalendar dict={dict} locale={locale} />
    </>
  );
}
