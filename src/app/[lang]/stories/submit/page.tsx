import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import StorySubmitForm from "@/components/StorySubmitForm";

export default async function StorySubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ registrantId?: string }>;
}) {
  const { lang } = await params;
  const { registrantId } = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  if (!registrantId) {
    return <p style={{ padding: "3rem 1.5rem", textAlign: "center" }}>{dict.stories.errorGeneric}</p>;
  }

  return <StorySubmitForm dict={dict} locale={locale} registrantId={registrantId} />;
}
