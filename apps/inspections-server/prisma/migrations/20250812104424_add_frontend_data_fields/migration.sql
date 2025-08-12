/*
  Warnings:

  - A unique constraint covering the columns `[inspectionId]` on the table `Inspection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `InspectionTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workOrderId]` on the table `WorkOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inspectionId` to the `Inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `InspectionTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InspectionTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workOrderId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "inspectionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InspectionTemplate" ADD COLUMN     "templateId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "supervisor" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workOrderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_inspectionId_key" ON "Inspection"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplate_templateId_key" ON "InspectionTemplate"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_workOrderId_key" ON "WorkOrder"("workOrderId");
