-- CreateTable
CREATE TABLE "Diary" (
    "id" SERIAL NOT NULL,
    "diaryDate" TIMESTAMP(3) NOT NULL,
    "weather" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diary_pkey" PRIMARY KEY ("id")
);
