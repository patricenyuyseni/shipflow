-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "senderPhone" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "packageWeight" DOUBLE PRECISION NOT NULL,
    "packageLength" DOUBLE PRECISION NOT NULL,
    "packageWidth" DOUBLE PRECISION NOT NULL,
    "packageHeight" DOUBLE PRECISION NOT NULL,
    "currentLocation" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "estimatedDelivery" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingHistory" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "previousStatus" "ShipmentStatus",
    "newStatus" "ShipmentStatus" NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingCounter" (
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrackingCounter_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_createdAt_idx" ON "Shipment"("createdAt");

-- CreateIndex
CREATE INDEX "TrackingHistory_shipmentId_createdAt_idx" ON "TrackingHistory"("shipmentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingHistory" ADD CONSTRAINT "TrackingHistory_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingHistory" ADD CONSTRAINT "TrackingHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
