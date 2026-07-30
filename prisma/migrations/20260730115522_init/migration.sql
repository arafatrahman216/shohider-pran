-- CreateTable
CREATE TABLE "GazetteRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "district" TEXT,
    "fatherName" TEXT,
    "spouseName" TEXT,
    "nid" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Registrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "nidOrBirthReg" TEXT,
    "district" TEXT NOT NULL,
    "fatherOrSpouseName" TEXT,
    "category" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED_SELF_REPORTED',
    "matchedRecordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registrant_matchedRecordId_fkey" FOREIGN KEY ("matchedRecordId") REFERENCES "GazetteRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "gazetteRecordId" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchCandidate_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchCandidate_gazetteRecordId_fkey" FOREIGN KEY ("gazetteRecordId") REFERENCES "GazetteRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GazetteRecord_name_idx" ON "GazetteRecord"("name");

-- CreateIndex
CREATE INDEX "GazetteRecord_district_idx" ON "GazetteRecord"("district");

-- CreateIndex
CREATE INDEX "Registrant_fullName_idx" ON "Registrant"("fullName");

-- CreateIndex
CREATE INDEX "Registrant_district_idx" ON "Registrant"("district");

-- CreateIndex
CREATE INDEX "MatchCandidate_registrantId_idx" ON "MatchCandidate"("registrantId");

-- CreateIndex
CREATE INDEX "Document_registrantId_idx" ON "Document"("registrantId");
