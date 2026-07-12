-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT');

-- CreateEnum
CREATE TYPE "Tenure" AS ENUM ('OWNED', 'MANAGED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RENTED', 'UNDER_REPAIR');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CLP', 'UF');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('NONE', 'IPC', 'UF', 'FIXED');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL', 'KHIPU', 'FINTOC');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('ELECTRICITY', 'WATER', 'GAS', 'PROPERTY_TAX', 'CLEANING_LIGHTING', 'COMMON_EXPENSES');

-- CreateEnum
CREATE TYPE "UtilityPayer" AS ENUM ('ADMINISTRATOR', 'TENANT');

-- CreateEnum
CREATE TYPE "UtilityStatus" AS ENUM ('CURRENT', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('REPAIR', 'REMODELING', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "RentAdjustmentStatus" AS ENUM ('SUGGESTED', 'CONFIRMED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('UF', 'IPC');

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "siiRol" TEXT,
    "type" "PropertyType" NOT NULL,
    "tenure" "Tenure" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "dfl2" BOOLEAN NOT NULL DEFAULT false,
    "commissionPct" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "baseAmount" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "adjustmentType" "AdjustmentType" NOT NULL DEFAULT 'NONE',
    "adjustmentPeriodMonths" INTEGER,
    "nextAdjustment" TIMESTAMP(3),
    "depositAmount" DECIMAL(14,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "LeaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amountClp" DECIMAL(14,2) NOT NULL,
    "ufValue" DECIMAL(14,4),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "chargeId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "method" "PaymentMethod" NOT NULL DEFAULT 'MANUAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_accounts" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "UtilityType" NOT NULL,
    "payer" "UtilityPayer" NOT NULL,
    "provider" TEXT,
    "accountNumber" TEXT,
    "status" "UtilityStatus" NOT NULL DEFAULT 'CURRENT',
    "currentAmount" DECIMAL(14,2),
    "dueDate" TIMESTAMP(3),
    "lastPaidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "billableToOwner" BOOLEAN NOT NULL DEFAULT false,
    "receiptUrl" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_adjustments" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "suggestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "previousAmount" DECIMAL(14,2) NOT NULL,
    "suggestedAmount" DECIMAL(14,2) NOT NULL,
    "confirmedAmount" DECIMAL(14,2),
    "ipcAccumulated" DECIMAL(8,4),
    "status" "RentAdjustmentStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicator_values" (
    "id" TEXT NOT NULL,
    "type" "IndicatorType" NOT NULL,
    "date" DATE NOT NULL,
    "value" DECIMAL(14,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicator_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_rut_key" ON "owners"("rut");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_rut_key" ON "tenants"("rut");

-- CreateIndex
CREATE INDEX "leases_propertyId_idx" ON "leases"("propertyId");

-- CreateIndex
CREATE INDEX "leases_tenantId_idx" ON "leases"("tenantId");

-- CreateIndex
CREATE INDEX "charges_leaseId_idx" ON "charges"("leaseId");

-- CreateIndex
CREATE UNIQUE INDEX "charges_leaseId_period_key" ON "charges"("leaseId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "payments_externalRef_key" ON "payments"("externalRef");

-- CreateIndex
CREATE INDEX "payments_leaseId_idx" ON "payments"("leaseId");

-- CreateIndex
CREATE INDEX "payments_chargeId_idx" ON "payments"("chargeId");

-- CreateIndex
CREATE INDEX "utility_accounts_propertyId_idx" ON "utility_accounts"("propertyId");

-- CreateIndex
CREATE INDEX "expenses_propertyId_idx" ON "expenses"("propertyId");

-- CreateIndex
CREATE INDEX "rent_adjustments_leaseId_idx" ON "rent_adjustments"("leaseId");

-- CreateIndex
CREATE INDEX "indicator_values_type_date_idx" ON "indicator_values"("type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "indicator_values_type_date_key" ON "indicator_values"("type", "date");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_adjustments" ADD CONSTRAINT "rent_adjustments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
