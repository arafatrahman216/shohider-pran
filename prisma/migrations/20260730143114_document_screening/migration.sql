-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrantId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screeningStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "screeningNote" TEXT,
    "screenedAt" DATETIME,
    CONSTRAINT "Document_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "Registrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("fileName", "fileUrl", "id", "registrantId", "uploadedAt") SELECT "fileName", "fileUrl", "id", "registrantId", "uploadedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE INDEX "Document_registrantId_idx" ON "Document"("registrantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
