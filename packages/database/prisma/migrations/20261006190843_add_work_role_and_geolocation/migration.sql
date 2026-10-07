-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "workRoleId" UUID;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "WorkRole" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "WorkRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkRole_organizationId_idx" ON "WorkRole"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkRole_organizationId_name_key" ON "WorkRole"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workRoleId_fkey" FOREIGN KEY ("workRoleId") REFERENCES "WorkRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRole" ADD CONSTRAINT "WorkRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
