-- CreateTable
CREATE TABLE `Inbox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `recipientId` INTEGER NOT NULL,
    `context` VARCHAR(191) NOT NULL,
    `isInvitation` BOOLEAN NOT NULL,
    `acknowledgement` ENUM('ACCEPT', 'DENY', 'VIEWED', 'RECEIVED') NOT NULL DEFAULT 'RECEIVED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inbox` ADD CONSTRAINT `Inbox_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inbox` ADD CONSTRAINT `Inbox_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
