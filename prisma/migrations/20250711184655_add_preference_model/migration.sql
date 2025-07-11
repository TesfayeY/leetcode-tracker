-- CreateTable
CREATE TABLE `Preference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `isNotify` BOOLEAN NOT NULL DEFAULT true,
    `isAutoNotify` BOOLEAN NOT NULL DEFAULT true,
    `isInboxNotify` BOOLEAN NOT NULL DEFAULT true,
    `isEmailNotify` BOOLEAN NOT NULL DEFAULT false,
    `isWebPushNotify` BOOLEAN NOT NULL DEFAULT true,
    `isMessageNotify` BOOLEAN NOT NULL DEFAULT true,
    `isInvitationNotify` BOOLEAN NOT NULL DEFAULT true,
    `isStreakNotify` BOOLEAN NOT NULL DEFAULT true,
    `isCheckinNotify` BOOLEAN NOT NULL DEFAULT true,
    `isProblemNotify` BOOLEAN NOT NULL DEFAULT true,
    `isInboxMessage` BOOLEAN NOT NULL DEFAULT true,
    `isEmailMessage` BOOLEAN NOT NULL DEFAULT false,
    `autoStreakDatetime` DATETIME(3) NOT NULL,
    `autoCheckinDatetime` DATETIME(3) NOT NULL,
    `autoProblemDatetime` DATETIME(3) NOT NULL,
    `autoStreakInterval` ENUM('1', '4', '6', '12', '24') NOT NULL,
    `autoCheckinInterval` ENUM('1', '4', '6', '12', '24') NOT NULL,
    `autoProblemInterval` ENUM('1', '4', '6', '12', '24') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Preference` ADD CONSTRAINT `Preference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
