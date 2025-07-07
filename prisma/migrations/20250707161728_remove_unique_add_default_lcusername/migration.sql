-- DropIndex
DROP INDEX `User_lc_username_key` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `lc_username` VARCHAR(240) NOT NULL DEFAULT '';
