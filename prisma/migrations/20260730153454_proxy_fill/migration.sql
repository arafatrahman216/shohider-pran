-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Registrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "nidOrBirthReg" TEXT,
    "district" TEXT NOT NULL,
    "fatherOrSpouseName" TEXT,
    "category" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED_SELF_REPORTED',
    "filedByProxy" BOOLEAN NOT NULL DEFAULT false,
    "proxyName" TEXT,
    "proxyRelationship" TEXT,
    "matchedRecordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registrant_matchedRecordId_fkey" FOREIGN KEY ("matchedRecordId") REFERENCES "GazetteRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Registrant" ("category", "createdAt", "district", "fatherOrSpouseName", "fullName", "id", "matchedRecordId", "nidOrBirthReg", "updatedAt", "verificationStatus") SELECT "category", "createdAt", "district", "fatherOrSpouseName", "fullName", "id", "matchedRecordId", "nidOrBirthReg", "updatedAt", "verificationStatus" FROM "Registrant";
DROP TABLE "Registrant";
ALTER TABLE "new_Registrant" RENAME TO "Registrant";
CREATE INDEX "Registrant_fullName_idx" ON "Registrant"("fullName");
CREATE INDEX "Registrant_district_idx" ON "Registrant"("district");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

