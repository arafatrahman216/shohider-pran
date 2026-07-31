-- CreateTable
CREATE TABLE "JobSeekerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "seekerName" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "skillsCsv" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobSeekerProfile_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "skillsCsv" TEXT NOT NULL,
    "postedByName" TEXT,
    "contactInfo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "JobSeekerProfile_registrantId_idx" ON "JobSeekerProfile"("registrantId");

-- CreateIndex
CREATE INDEX "JobSeekerProfile_district_idx" ON "JobSeekerProfile"("district");

-- CreateIndex
CREATE INDEX "JobPosting_district_idx" ON "JobPosting"("district");
