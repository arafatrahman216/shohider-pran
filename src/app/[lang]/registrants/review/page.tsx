import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import RegistrantReviewView from "@/components/RegistrantReviewView";

export default async function RegistrantReviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <RegistrantReviewView dict={dict} />;
}
