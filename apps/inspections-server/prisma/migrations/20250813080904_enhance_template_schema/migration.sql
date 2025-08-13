-- AlterTable
ALTER TABLE "InspectionTemplate" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "equipmentType" TEXT,
ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastModifiedBy" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0.0';

-- CreateIndex
CREATE INDEX "InspectionTemplate_category_idx" ON "InspectionTemplate"("category");

-- CreateIndex
CREATE INDEX "InspectionTemplate_status_idx" ON "InspectionTemplate"("status");

-- CreateIndex
CREATE INDEX "InspectionTemplate_createdBy_idx" ON "InspectionTemplate"("createdBy");

-- CreateIndex
CREATE INDEX "InspectionTemplate_parentId_idx" ON "InspectionTemplate"("parentId");
