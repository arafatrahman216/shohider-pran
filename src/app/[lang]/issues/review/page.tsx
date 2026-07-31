import IssueReviewView from "@/components/IssueReviewView";
import { defaultLocale, isLocale, type Locale } from "@/lib/dictionaries";
import { requireAdminPage } from "@/lib/admin-auth";
export default async function IssueReviewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  await requireAdminPage(locale);
  return <IssueReviewView locale={locale} />;
}
