ALTER TABLE "Story" ADD COLUMN "validationStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Story" ADD COLUMN "validatedBy" TEXT;
ALTER TABLE "Story" ADD COLUMN "validationEvidence" TEXT;
ALTER TABLE "Story" ADD COLUMN "validationNote" TEXT;
ALTER TABLE "Story" ADD COLUMN "validatedAt" DATETIME;

CREATE TABLE "AuthorityIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueId" TEXT NOT NULL,
    "registrantId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "authorityName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuthorityIssue_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AuthorityIssue_issueId_key" ON "AuthorityIssue"("issueId");
CREATE INDEX "AuthorityIssue_registrantId_idx" ON "AuthorityIssue"("registrantId");
CREATE INDEX "AuthorityIssue_status_idx" ON "AuthorityIssue"("status");

CREATE TABLE "AuthorityIssueUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthorityIssueUpdate_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "AuthorityIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "AuthorityIssueUpdate_issueId_idx" ON "AuthorityIssueUpdate"("issueId");
