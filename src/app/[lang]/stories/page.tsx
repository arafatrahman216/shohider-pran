import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import Link from "next/link";
import styles from "@/components/StoriesList.module.css";

export const dynamic = "force-dynamic";

export default async function StoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.stories;
  const stories = await prisma.story.findMany({
    where: {
      validationStatus: { in: ["VALIDATED", "UNVALIDATED"] },
      ...(locale === "bn" ? { bodyBn: { not: null } } : { bodyEn: { not: null } }),
    },
    include: { registrant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.publicTitle}</h1>
      <p className={styles.subtitle}>{t.publicSubtitle}</p>
      <div className={styles.actions}>
        <Link href={`/${locale}/stories/submit`} className={styles.submitLink}>
          {locale === "bn" ? "আপনার গল্প লিখুন" : "Submit your story"}
        </Link>
      </div>
      {stories.length === 0 && <p className={styles.empty}>{t.empty}</p>}
      {(["VALIDATED", "UNVALIDATED"] as const).map((status) => {
        const group = stories.filter((story) => story.validationStatus === status);
        if (!group.length) return null;
        return (
          <section key={status}>
            <h2 className={styles.sectionTitle}>
              {locale === "bn"
                ? status === "VALIDATED" ? "যাচাইকৃত গল্প" : "এখনো যাচাইকৃত নয়"
                : status === "VALIDATED" ? "Validated stories" : "Not yet validated"}
            </h2>
            {group.map((story) => (
              <article key={story.id} className={styles.storyCard}>
                <p className={styles.storyMeta}>
                  {story.registrant.fullName} · {story.registrant.district}
                </p>
                <p className={styles.storyBody}>{locale === "bn" ? story.bodyBn : story.bodyEn}</p>
                {story.authorName && <p className={styles.storyAuthor}>— {story.authorName}</p>}
                <p className={status === "VALIDATED" ? styles.validatedBadge : styles.unvalidatedBadge}>
                  {locale === "bn"
                    ? status === "VALIDATED" ? "যাচাইকৃত" : "এখনো যাচাইকৃত নয়"
                    : status === "VALIDATED" ? "Validated" : "Not yet validated"}
                  {status === "VALIDATED" && story.validatedBy
                    ? ` · ${locale === "bn" ? "যাচাই করেছেন" : "Validated by"}: ${story.validatedBy}`
                    : ""}
                  {status === "VALIDATED" && story.validationEvidence ? ` · ${story.validationEvidence}` : ""}
                </p>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
