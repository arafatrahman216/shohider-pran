import AuthorityIssues from "@/components/AuthorityIssues";
import { defaultLocale, isLocale, type Locale } from "@/lib/dictionaries";
export default async function IssuesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return <AuthorityIssues locale={locale} />;
}
