/*
  Warnings:

  - You are about to drop the `_JourneyFollowers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_JourneyFollowers" DROP CONSTRAINT "_JourneyFollowers_A_fkey";

-- DropForeignKey
ALTER TABLE "_JourneyFollowers" DROP CONSTRAINT "_JourneyFollowers_B_fkey";

-- AlterTable
ALTER TABLE "Journey" ALTER COLUMN "isPublic" SET DEFAULT false;

-- DropTable
DROP TABLE "_JourneyFollowers";

-- CreateTable
CREATE TABLE "_UserFollowedJourneys" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFollowedJourneys_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserFollowedJourneys_B_index" ON "_UserFollowedJourneys"("B");

-- AddForeignKey
ALTER TABLE "_UserFollowedJourneys" ADD CONSTRAINT "_UserFollowedJourneys_A_fkey" FOREIGN KEY ("A") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowedJourneys" ADD CONSTRAINT "_UserFollowedJourneys_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
