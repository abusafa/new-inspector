-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "estimatedDuration" INTEGER,
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "workOrderTemplateId" TEXT;

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Equipment',
    "location" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastInspected" TIMESTAMP(3),
    "nextInspectionDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "specifications" JSONB,
    "notes" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAsset" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',

    CONSTRAINT "WorkOrderAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedDuration" INTEGER NOT NULL,
    "defaultAssignee" TEXT,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inspectionTemplateIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checklist" JSONB NOT NULL,
    "notifications" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "WorkOrderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workOrderTemplateId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "assignedGroup" TEXT,
    "location" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "daysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "dayOfMonth" INTEGER,
    "time" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "lastGenerated" TIMESTAMP(3),
    "nextDue" TIMESTAMP(3),
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "overdueCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecurringSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetId_key" ON "Asset"("assetId");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_location_idx" ON "Asset"("location");

-- CreateIndex
CREATE INDEX "WorkOrderAsset_workOrderId_idx" ON "WorkOrderAsset"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderAsset_assetId_idx" ON "WorkOrderAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderAsset_workOrderId_assetId_key" ON "WorkOrderAsset"("workOrderId", "assetId");

-- CreateIndex
CREATE INDEX "WorkOrderTemplate_category_idx" ON "WorkOrderTemplate"("category");

-- CreateIndex
CREATE INDEX "WorkOrderTemplate_isActive_idx" ON "WorkOrderTemplate"("isActive");

-- CreateIndex
CREATE INDEX "WorkOrderTemplate_createdBy_idx" ON "WorkOrderTemplate"("createdBy");

-- CreateIndex
CREATE INDEX "RecurringSchedule_isActive_idx" ON "RecurringSchedule"("isActive");

-- CreateIndex
CREATE INDEX "RecurringSchedule_nextDue_idx" ON "RecurringSchedule"("nextDue");

-- CreateIndex
CREATE INDEX "RecurringSchedule_createdBy_idx" ON "RecurringSchedule"("createdBy");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_assignedTo_idx" ON "WorkOrder"("assignedTo");

-- CreateIndex
CREATE INDEX "WorkOrder_createdBy_idx" ON "WorkOrder"("createdBy");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_workOrderTemplateId_fkey" FOREIGN KEY ("workOrderTemplateId") REFERENCES "WorkOrderTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAsset" ADD CONSTRAINT "WorkOrderAsset_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAsset" ADD CONSTRAINT "WorkOrderAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_workOrderTemplateId_fkey" FOREIGN KEY ("workOrderTemplateId") REFERENCES "WorkOrderTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
