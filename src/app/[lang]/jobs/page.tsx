import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import JobSeekerMatchForm from "@/components/JobSeekerMatchForm";
import JobPostForm from "@/components/JobPostForm";
import styles from "@/components/JobsBoard.module.css";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.jobs;

  const postings = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <JobSeekerMatchForm dict={dict} locale={locale} />
      <JobPostForm dict={dict} locale={locale} />

      <h2 className={`${styles.sectionTitle} display`}>{t.boardTitle}</h2>
      {postings.length === 0 && <p className={styles.empty}>{t.boardEmpty}</p>}
      {postings.map((p) => (
        <div key={p.id} className={styles.boardCard}>
          <h3 className={styles.matchTitle}>{p.title}</h3>
          <p className={styles.matchMeta}>
            {p.district} · {p.skillsCsv}
          </p>
          <p className={styles.matchDescription}>{p.description}</p>
          <p className={styles.matchContact}>
            {p.postedByName ? `${p.postedByName} · ` : ""}
            {p.contactInfo}
          </p>
        </div>
      ))}
    </div>
  );
}
