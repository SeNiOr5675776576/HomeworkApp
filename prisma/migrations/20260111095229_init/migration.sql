-- AlterTable
ALTER TABLE "Homework" ADD COLUMN     "overdue" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Overdue" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "subject" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Overdue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Overdue" ADD CONSTRAINT "Overdue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
