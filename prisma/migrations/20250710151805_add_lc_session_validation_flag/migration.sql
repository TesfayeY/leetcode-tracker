/*
  Warnings:

  - The values [DENY] on the enum `Inbox_acknowledgement` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lc_username` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Inbox` MODIFY `acknowledgement` ENUM('ACCEPT', 'ARCHIVED', 'VIEWED', 'RECEIVED') NOT NULL DEFAULT 'RECEIVED';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `lc_username`,
    ADD COLUMN `isProfileVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lcSessionToken` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `lcUsername` VARCHAR(240) NOT NULL DEFAULT '';
