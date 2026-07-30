import Link from "next/link";
import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import PetitionSignForm from "@/components/PetitionSignForm";
import styles from "@/components/PetitionsList.module.css";

export const dynamic = "force-dynamic";

export default async function PetitionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.petitions;

  const petitions = await prisma.petition.findMany({
    where: { status: "APPROVED" },
    include: { _count: { select: { signatures: true } } },
    orderBy: { approvedAt: "desc" },
  });

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.publicTitle}</h1>
      <p className={styles.subtitle}>{t.publicSubtitle}</p>
      <Link href={`/${locale}/petitions/propose`} className={styles.proposeLink}>
        {t.proposeLink}
      </Link>

      {petitions.length === 0 && <p className={styles.empty}>{t.empty}</p>}

      {petitions.map((p) => (
        <div key={p.id} className={styles.card}>
          <h2 className={`${styles.cardTitle} display`}>{p.title}</h2>
          <p className={styles.letterBody}>{p.draftText ?? p.ask}</p>
          <PetitionSignForm dict={dict} petitionId={p.id} initialCount={p._count.signatures} />
        </div>
      ))}
    </div>
  );
}
