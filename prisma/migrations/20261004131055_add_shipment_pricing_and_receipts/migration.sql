/*
  Warnings:

  - A unique constraint covering the columns `[receiptNumber]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ServiceLevel" AS ENUM ('STANDARD', 'EXPRESS', 'PRIORITY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "serviceLevel" "ServiceLevel" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_receiptNumber_key" ON "Shipment"("receiptNumber");

-- CreateIndex
CREATE INDEX "Shipment_paymentStatus_idx" ON "Shipment"("paymentStatus");
