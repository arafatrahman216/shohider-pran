import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import SearchRegistry from "@/components/SearchRegistry";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <SearchRegistry dict={dict} locale={locale} />;
}
