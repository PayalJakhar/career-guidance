-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "targetLevel" TEXT,
ADD COLUMN     "targetRole" TEXT;
