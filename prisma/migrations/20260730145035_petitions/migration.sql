-- CreateTable
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ask" TEXT NOT NULL,
    "draftText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "proposedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    CONSTRAINT "Petition_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PetitionSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petitionId" TEXT NOT NULL,
    "registrantId" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PetitionSignature_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PetitionSignature_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Petition_proposedById_idx" ON "Petition"("proposedById");

-- CreateIndex
CREATE INDEX "PetitionSignature_petitionId_idx" ON "PetitionSignature"("petitionId");

-- CreateIndex
CREATE UNIQUE INDEX "PetitionSignature_petitionId_registrantId_key" ON "PetitionSignature"("petitionId", "registrantId");
