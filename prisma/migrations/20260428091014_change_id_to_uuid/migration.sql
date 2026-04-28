/*
  Warnings:

  - The primary key for the `bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `conversations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `facilities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `maintenances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `room_facilities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `rooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `length` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_room_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_room_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "room_facilities" DROP CONSTRAINT "room_facilities_facility_id_fkey";

-- DropForeignKey
ALTER TABLE "room_facilities" DROP CONSTRAINT "room_facilities_room_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_verified_by_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pkey",
ALTER COLUMN "booking_id" DROP DEFAULT,
ALTER COLUMN "booking_id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "room_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id");
DROP SEQUENCE "bookings_booking_id_seq";

-- AlterTable
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_pkey",
ALTER COLUMN "conversation_id" DROP DEFAULT,
ALTER COLUMN "conversation_id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id");
DROP SEQUENCE "conversations_conversation_id_seq";

-- AlterTable
ALTER TABLE "facilities" DROP CONSTRAINT "facilities_pkey",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "facility_id" DROP DEFAULT,
ALTER COLUMN "facility_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "facilities_pkey" PRIMARY KEY ("facility_id");
DROP SEQUENCE "facilities_facility_id_seq";

-- AlterTable
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey",
ALTER COLUMN "invoice_id" DROP DEFAULT,
ALTER COLUMN "invoice_id" SET DATA TYPE TEXT,
ALTER COLUMN "booking_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id");
DROP SEQUENCE "invoices_invoice_id_seq";

-- AlterTable
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_pkey",
ALTER COLUMN "maintenance_id" DROP DEFAULT,
ALTER COLUMN "maintenance_id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "room_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "maintenances_pkey" PRIMARY KEY ("maintenance_id");
DROP SEQUENCE "maintenances_maintenance_id_seq";

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
ALTER COLUMN "message_id" DROP DEFAULT,
ALTER COLUMN "message_id" SET DATA TYPE TEXT,
ALTER COLUMN "conversation_id" SET DATA TYPE TEXT,
ALTER COLUMN "sender_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id");
DROP SEQUENCE "messages_message_id_seq";

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "notification_id" DROP DEFAULT,
ALTER COLUMN "notification_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id");
DROP SEQUENCE "notifications_notification_id_seq";

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
ALTER COLUMN "profile_id" DROP DEFAULT,
ALTER COLUMN "profile_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id");
DROP SEQUENCE "profiles_profile_id_seq";

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
ALTER COLUMN "review_id" DROP DEFAULT,
ALTER COLUMN "review_id" SET DATA TYPE TEXT,
ALTER COLUMN "booking_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id");
DROP SEQUENCE "reviews_review_id_seq";

-- AlterTable
ALTER TABLE "room_facilities" DROP CONSTRAINT "room_facilities_pkey",
ALTER COLUMN "room_id" SET DATA TYPE TEXT,
ALTER COLUMN "facility_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "room_facilities_pkey" PRIMARY KEY ("room_id", "facility_id");

-- AlterTable
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_pkey",
ADD COLUMN     "area" DECIMAL(65,30),
ADD COLUMN     "length" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'm',
ADD COLUMN     "width" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "room_id" DROP DEFAULT,
ALTER COLUMN "room_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("room_id");
DROP SEQUENCE "rooms_room_id_seq";

-- AlterTable
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey",
ALTER COLUMN "transaction_id" DROP DEFAULT,
ALTER COLUMN "transaction_id" SET DATA TYPE TEXT,
ALTER COLUMN "invoice_id" SET DATA TYPE TEXT,
ALTER COLUMN "verified_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id");
DROP SEQUENCE "transactions_transaction_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "hashed_rt" TEXT,
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");
DROP SEQUENCE "users_user_id_seq";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
