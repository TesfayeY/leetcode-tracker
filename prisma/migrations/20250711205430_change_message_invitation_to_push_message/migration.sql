/*
  Warnings:

  - You are about to drop the column `isInvitationNotify` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `isMessageNotify` on the `Preference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Preference` DROP COLUMN `isInvitationNotify`,
    DROP COLUMN `isMessageNotify`,
    ADD COLUMN `isWebPushMessage` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `autoStreakDatetime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `autoCheckinDatetime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `autoProblemDatetime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `autoStreakInterval` ENUM('1', '4', '6', '12', '24') NOT NULL DEFAULT '1',
    MODIFY `autoCheckinInterval` ENUM('1', '4', '6', '12', '24') NOT NULL DEFAULT '1',
    MODIFY `autoProblemInterval` ENUM('1', '4', '6', '12', '24') NOT NULL DEFAULT '24';
