ALTER TABLE `integrationSettings` ADD `smtpHost` text;--> statement-breakpoint
ALTER TABLE `integrationSettings` ADD `smtpPort` integer;--> statement-breakpoint
ALTER TABLE `integrationSettings` ADD `smtpUser` text;--> statement-breakpoint
ALTER TABLE `integrationSettings` ADD `smtpPassword` text;--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD `gatewayInvoiceId` text;