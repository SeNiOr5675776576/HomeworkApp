-- CreateTable
CREATE TABLE "Setting" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scheduleTime" TEXT NOT NULL DEFAULT '0 7',
    "homeworkEnabled" BOOLEAN NOT NULL DEFAULT true,
    "homeworkTime" TEXT NOT NULL DEFAULT '0 16',

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
