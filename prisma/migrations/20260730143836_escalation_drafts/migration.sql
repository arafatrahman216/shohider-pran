-- CreateTable
CREATE TABLE "EscalationDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "draftText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    CONSTRAINT "EscalationDraft_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EscalationDraft_registrantId_idx" ON "EscalationDraft"("registrantId");
