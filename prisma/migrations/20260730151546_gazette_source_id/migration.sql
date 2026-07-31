-- AlterTable
ALTER TABLE "GazetteRecord" ADD COLUMN "sourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GazetteRecord_sourceName_sourceId_key" ON "GazetteRecord"("sourceName", "sourceId");

