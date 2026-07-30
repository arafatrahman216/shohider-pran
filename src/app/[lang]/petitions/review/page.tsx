import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import PetitionReviewView from "@/components/PetitionReviewView";

export default async function PetitionReviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <PetitionReviewView dict={dict} />;
}
