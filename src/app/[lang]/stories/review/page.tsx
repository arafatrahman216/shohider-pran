import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import StoryReviewView from "@/components/StoryReviewView";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function StoryReviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  await requireAdminPage(locale);
  const dict = await getDictionary(locale);

  return <StoryReviewView dict={dict} />;
}
