-- DropForeignKey
ALTER TABLE `Inbox` DROP FOREIGN KEY `Inbox_recipientId_fkey`;

-- DropForeignKey
ALTER TABLE `Inbox` DROP FOREIGN KEY `Inbox_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `Preference` DROP FOREIGN KEY `Preference_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Inbox` ADD CONSTRAINT `Inbox_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inbox` ADD CONSTRAINT `Inbox_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preference` ADD CONSTRAINT `Preference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
