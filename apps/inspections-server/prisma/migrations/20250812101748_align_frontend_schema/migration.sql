-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "location" TEXT;
