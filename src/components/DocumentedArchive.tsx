import styles from "./DocumentedArchive.module.css";
import Image from "next/image";

const sources = {
  amnestyAbuSayed: "https://www.amnesty.org/en/latest/news/2024/07/bangladesh-witness-testimony-video-and-photographic-analysis-confirm-police-used-unlawful-force-against-protesters/",
  amnestyYamin: "https://www.amnesty.org/en/latest/news/2024/07/bangladesh-further-video-and-photographic-analysis-confirm-police-unlawfully-used-lethal-and-less-lethal-weapons-against-protesters/",
  ohchr: "https://www.ohchr.org/sites/default/files/2024-08/OHCHR-Preliminary-Analysis-of-Recent-Protests-and-Unrest-in-Bangladesh-16082024_2.pdf",
  photo1: "https://commons.wikimedia.org/wiki/File:Student_Civil_Uprising_2024.jpg",
  photo2: "https://commons.wikimedia.org/wiki/File:Student_protest_against_Hasina_at_Rangpur_Sadar_2.jpg",
};

export default function DocumentedArchive({ locale }: { locale: "bn" | "en" }) {
  const bn = locale === "bn";
  return (
    <section className={styles.section}>
      <p className={styles.warning}>
        {bn
          ? "বিষয়বস্তু সতর্কতা: linked source-এ মৃত্যু, গুরুতর আঘাত ও পুলিশি সহিংসতার যাচাইকৃত দৃশ্য থাকতে পারে।"
          : "Content warning: linked sources may contain verified footage of death, serious injury, and police violence."}
      </p>
      <h2>{bn ? "নথিভুক্ত জুলাই: যাচাইকৃত প্রতিবেদন ও দৃশ্য" : "Documented July: verified reports and images"}</h2>
      <p className={styles.intro}>
        {bn
          ? "এগুলো পরিবারের জমা দেওয়া ‘আমার গল্প’ নয়। প্রতিটি summary প্রকাশিত তদন্তের ভিত্তিতে লেখা এবং মূল source-এর সঙ্গে যুক্ত।"
          : "These are not family-submitted Amar Golpo stories. Every summary is based on a published investigation and links to its original source."}
      </p>
      <div className={styles.grid}>
        <article className={styles.card}>
          <a href={sources.photo2} target="_blank" rel="noreferrer">
            <Image width={900} height={600} src="https://commons.wikimedia.org/wiki/Special:FilePath/Student%20protest%20against%20Hasina%20at%20Rangpur%20Sadar%202.jpg?width=900" alt={bn ? "রংপুরে ২০২৪ সালের ছাত্র প্রতিবাদ" : "Student protest in Rangpur in 2024"} />
          </a>
          <div className={styles.body}>
            <h3>{bn ? "আবু সাঈদ হত্যাকাণ্ড: video ও satellite verification" : "The killing of Abu Sayed: video and satellite verification"}</h3>
            <p>{bn ? "Amnesty International দুটি video যাচাই ও satellite imagery দিয়ে অবস্থান নির্ণয় করে জানায়, ১৬ জুলাই রংপুরে পুলিশ প্রায় ১৫ মিটার দূর থেকে নিরস্ত্র আবু সাঈদের দিকে shotgun ছোড়ে।" : "Amnesty International verified two videos and used satellite imagery to geolocate police firing shotguns at unarmed Abu Sayed from about 15 metres away in Rangpur on 16 July."}</p>
            <a href={sources.amnestyAbuSayed} target="_blank" rel="noreferrer">{bn ? "Amnesty-এর যাচাইকরণ ও video দেখুন" : "Read Amnesty's verification and view video"}</a>
            <small>{bn ? "ছবি: Wikimedia Commons; file page-এ license/author দেওয়া আছে।" : "Photo: Wikimedia Commons; author and licence on file page."}</small>
          </div>
        </article>
        <article className={styles.card}>
          <a href={sources.photo1} target="_blank" rel="noreferrer">
            <Image width={900} height={600} src="https://commons.wikimedia.org/wiki/Special:FilePath/Student%20Civil%20Uprising%202024.jpg?width=900" alt={bn ? "২০২৪ সালের ছাত্র-জনতার প্রতিবাদ" : "Student-public protest in 2024"} />
          </a>
          <div className={styles.body}>
            <h3>{bn ? "সাভারে ইয়ামিন এবং ঢাকায় অস্ত্র ব্যবহারের যাচাইকৃত video" : "Verified footage of Yamin in Savar and weapons used in Dhaka"}</h3>
            <p>{bn ? "Amnesty Crisis Evidence Lab ইয়ামিনের দেহ APC থেকে ফেলে দেওয়া, BRAC University-তে enclosed space-এ tear gas এবং Rampura-তে assault rifle ব্যবহারের footage যাচাই করেছে।" : "Amnesty's Crisis Evidence Lab verified footage involving Yamin's body being dropped from an APC, tear gas fired into an enclosed BRAC University area, and an assault rifle fired in Rampura."}</p>
            <a href={sources.amnestyYamin} target="_blank" rel="noreferrer">{bn ? "সতর্কতাসহ verified footage analysis খুলুন" : "Open the verified footage analysis (warning)"}</a>
            <small>{bn ? "ছবি: Wikimedia Commons; file page-এ license/author দেওয়া আছে।" : "Photo: Wikimedia Commons; author and licence on file page."}</small>
          </div>
        </article>
        <article className={styles.card}>
          <div className={styles.report}>
            <span>UN</span>
          </div>
          <div className={styles.body}>
            <h3>{bn ? "জাতিসংঘের মানবাধিকার প্রতিবেদন" : "United Nations human-rights report"}</h3>
            <p>{bn ? "OHCHR-এর preliminary analysis বলেছে, শুরুতে শান্তিপূর্ণ ছাত্র আন্দোলনের পর নিরাপত্তা বাহিনীর গুরুতর মানবাধিকার লঙ্ঘন ঘটে; শত শত নিহত, অন্তত ৩২ শিশু এবং হাজারো আহত হওয়ার তথ্য তারা নথিবদ্ধ করে।" : "OHCHR's preliminary analysis reported serious human-rights violations by security forces after initially peaceful student protests, with hundreds believed killed, at least 32 children, and thousands injured."}</p>
            <a href={sources.ohchr} target="_blank" rel="noreferrer">{bn ? "মূল OHCHR PDF পড়ুন" : "Read the original OHCHR PDF"}</a>
          </div>
        </article>
      </div>
    </section>
  );
}
