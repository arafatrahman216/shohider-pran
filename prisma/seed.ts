// Local dev seed data ONLY. These are placeholder names for testing the
// matching flow — never real registry data. Real gazette_records must come
// from the scraper module (Section 5), never be hand-authored.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const SEED_SOURCE = "seed_dev_placeholder";

async function main() {
  await prisma.matchCandidate.deleteMany();
  await prisma.document.deleteMany();
  await prisma.registrant.deleteMany();
  await prisma.gazetteRecord.deleteMany();

  await prisma.gazetteRecord.createMany({
    data: [
      {
        name: "Rahim Uddin Molla",
        category: "SHOHID",
        district: "Dhaka",
        fatherName: "Karim Uddin Molla",
        sourceName: SEED_SOURCE,
        sourceUrl: "https://example.invalid/seed",
      },
      {
        name: "Nasrin Akter",
        category: "AHOTO",
        district: "Chattogram",
        fatherName: "Abdur Rob",
        sourceName: SEED_SOURCE,
        sourceUrl: "https://example.invalid/seed",
      },
      {
        name: "Shariful Islam",
        category: "SHOHID",
        district: "Rangpur",
        fatherName: "Mofizul Islam",
        sourceName: SEED_SOURCE,
        sourceUrl: "https://example.invalid/seed",
      },
      {
        name: "Momtaz Begum",
        category: "AHOTO",
        district: "Cumilla",
        spouseName: "Jahangir Alam",
        sourceName: SEED_SOURCE,
        sourceUrl: "https://example.invalid/seed",
        needsReview: true,
      },
    ],
  });

  console.log("Seeded", await prisma.gazetteRecord.count(), "gazette_records (placeholder dev data)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
