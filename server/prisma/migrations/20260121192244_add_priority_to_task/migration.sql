-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('baja', 'media', 'alta');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'media';
