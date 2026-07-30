-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "authorName" TEXT,
    "originalLocale" TEXT NOT NULL,
    "bodyBn" TEXT,
    "bodyEn" TEXT,
    "bnReviewed" BOOLEAN NOT NULL DEFAULT false,
    "enReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Story_registrantId_idx" ON "Story"("registrantId");
