import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import StoryReviewView from "@/components/StoryReviewView";

export default async function StoryReviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <StoryReviewView dict={dict} />;
}
