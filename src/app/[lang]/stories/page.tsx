import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import styles from "@/components/StoriesList.module.css";

export const dynamic = "force-dynamic";

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.stories;

  const stories = await prisma.story.findMany({
    where:
      locale === "bn"
        ? { bodyBn: { not: null }, bnReviewed: true }
        : { bodyEn: { not: null }, enReviewed: true },
    include: { registrant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.publicTitle}</h1>
      <p className={styles.subtitle}>{t.publicSubtitle}</p>

      {stories.length === 0 && <p className={styles.empty}>{t.empty}</p>}

      {stories.map((s) => {
        const body = locale === "bn" ? s.bodyBn : s.bodyEn;
        const categoryLabel =
          s.registrant.category === "SHOHID"
            ? dict.register.steps.category.shohid
            : dict.register.steps.category.ahoto;
        return (
          <div key={s.id} className={styles.storyCard}>
            <p className={styles.storyMeta}>
              {s.registrant.fullName} · {s.registrant.district} · {categoryLabel}
            </p>
            <p className={styles.storyBody}>{body}</p>
            {s.authorName && <p className={styles.storyAuthor}>— {s.authorName}</p>}
          </div>
        );
      })}
    </div>
  );
}
