-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "trainNumber" TEXT;

-- CreateTable
CREATE TABLE "_JourneyFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JourneyFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JourneyFollowers_B_index" ON "_JourneyFollowers"("B");

-- AddForeignKey
ALTER TABLE "_JourneyFollowers" ADD CONSTRAINT "_JourneyFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourneyFollowers" ADD CONSTRAINT "_JourneyFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
