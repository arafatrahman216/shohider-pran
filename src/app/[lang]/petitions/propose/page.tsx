import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import PetitionProposeForm from "@/components/PetitionProposeForm";

export default async function PetitionProposePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <PetitionProposeForm dict={dict} />;
}
