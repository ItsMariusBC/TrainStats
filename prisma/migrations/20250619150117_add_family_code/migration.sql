-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "isFamilyCode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
