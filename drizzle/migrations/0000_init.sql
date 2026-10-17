CREATE TABLE `adminDevices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tokenHash` text NOT NULL,
	`label` text NOT NULL,
	`createdAt` integer NOT NULL,
	`lastSeenAt` integer NOT NULL,
	`revokedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adminDevices_tokenHash_unique` ON `adminDevices` (`tokenHash`);--> statement-breakpoint
CREATE TABLE `integrationSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brandName` text DEFAULT 'سَفَر' NOT NULL,
	`officialDomain` text,
	`businessEmail` text,
	`whatsappNumber` text,
	`instagramUrl` text,
	`linkedinUrl` text,
	`tiktokUrl` text,
	`senderName` text,
	`dnsRecords` text,
	`applePayAssociation` text,
	`resendApiKey` text,
	`moyasarPublishableKey` text,
	`moyasarSecretKey` text,
	`moyasarWebhookSecret` text,
	`mode` text DEFAULT 'test' NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`service` text,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `paymentRequests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicToken` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`service` text NOT NULL,
	`description` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'SAR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `paymentRequests_publicToken_unique` ON `paymentRequests` (`publicToken`);--> statement-breakpoint
CREATE TABLE `portfolioItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'عام' NOT NULL,
	`mediaType` text DEFAULT 'image' NOT NULL,
	`mediaUrl` text NOT NULL,
	`thumbnailUrl` text,
	`projectUrl` text,
	`isPublished` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contentKey` text NOT NULL,
	`contentValue` text NOT NULL,
	`label` text NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `siteContent_contentKey_unique` ON `siteContent` (`contentKey`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`quote` text NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`avatarUrl` text,
	`isPublished` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
