/*
  Warnings:

  - A unique constraint covering the columns `[lc_username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lc_username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `lc_username` VARCHAR(240) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_lc_username_key` ON `User`(`lc_username`);
