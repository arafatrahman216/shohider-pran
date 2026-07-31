import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import { generateDigest } from "@/lib/digest-agent";
import DigestView from "@/components/DigestView";

export const dynamic = "force-dynamic";

export default async function DigestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const [dict, digest] = await Promise.all([getDictionary(locale), generateDigest()]);

  return <DigestView dict={dict} digest={digest} />;
}
