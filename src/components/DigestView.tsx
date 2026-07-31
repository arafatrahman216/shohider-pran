import type { Dictionary } from "@/lib/dictionaries";
import type { Digest } from "@/lib/digest-agent";
import styles from "./DigestView.module.css";

export default function DigestView({ dict, digest }: { dict: Dictionary; digest: Digest }) {
  const t = dict.digest;
  const { stats } = digest;

  return (
    <div className={styles.wrapper}>
      <h1 className={`${styles.title} display`}>{t.title}</h1>
      <p className={styles.subtitle}>{t.subtitle}</p>

      <div className={styles.summaryCard}>
        <p className={styles.summaryText}>{digest.summary ?? t.noSummary}</p>
        <p className={styles.generatedAt}>
          {t.generatedAt}: {new Date(digest.generatedAt).toLocaleString()}
        </p>
      </div>

      <h2 className={`${styles.sectionHeading} display`}>{t.stats.heading}</h2>
      <div className={styles.statGrid}>
        <Stat value={stats.totalRegistrants} label={t.stats.total} />
        <Stat value={stats.verified} label={t.stats.verified} />
        <Stat value={stats.pendingConfirmation} label={t.stats.pendingConfirmation} />
        <Stat value={stats.selfReported} label={t.stats.selfReported} />
        <Stat value={stats.rejected} label={t.stats.rejected} />
        <Stat value={stats.newLast7Days} label={t.stats.newLast7Days} />
      </div>

      <h2 className={`${styles.sectionHeading} display`}>{t.districts.heading}</h2>
      {stats.byDistrict.length === 0 ? (
        <p className={styles.subtitle}>{t.districts.empty}</p>
      ) : (
        <div className={styles.districtList}>
          {stats.byDistrict.map((d) => (
            <div key={d.district} className={styles.districtRow}>
              <span>{d.district}</span>
              <span className={styles.districtCount}>{d.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
