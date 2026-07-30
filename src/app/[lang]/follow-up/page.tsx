import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import FollowUpView from "@/components/FollowUpView";

export default async function FollowUpPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return <FollowUpView dict={dict} />;
}
