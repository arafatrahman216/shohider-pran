import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import Hero from "@/components/Hero";
import RegistryCounters from "@/components/RegistryCounters";
import ExtendedCalendar from "@/components/ExtendedCalendar";

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
      <RegistryCounters dict={dict} />
      <ExtendedCalendar dict={dict} locale={locale} />
    </>
  );
}
