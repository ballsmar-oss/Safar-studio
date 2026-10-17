CREATE TABLE `integrationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandName` varchar(160) NOT NULL DEFAULT 'سَفَر',
	`officialDomain` varchar(255),
	`businessEmail` varchar(320),
	`senderName` varchar(160),
	`dnsRecords` text,
	`applePayAssociation` text,
	`resendApiKey` text,
	`moyasarPublishableKey` text,
	`moyasarSecretKey` text,
	`moyasarWebhookSecret` text,
	`cloudflareApiToken` text,
	`cloudflareZoneId` varchar(120),
	`mode` enum('test','live') NOT NULL DEFAULT 'test',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrationSettings_id` PRIMARY KEY(`id`)
);
