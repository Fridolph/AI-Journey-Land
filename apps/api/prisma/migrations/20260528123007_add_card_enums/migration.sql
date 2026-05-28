/*
  Warnings:

  - The `difficulty` column on the `cards` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `cards` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateEnum
CREATE TYPE "CardDifficulty" AS ENUM ('basic', 'medium', 'advanced');

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "CardDifficulty" NOT NULL DEFAULT 'basic',
DROP COLUMN "status",
ADD COLUMN     "status" "CardStatus" NOT NULL DEFAULT 'todo';
