/*
  Warnings:

  - You are about to drop the `Overdue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Overdue" DROP CONSTRAINT "Overdue_userId_fkey";

-- DropTable
DROP TABLE "public"."Overdue";
