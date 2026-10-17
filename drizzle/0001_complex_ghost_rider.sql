CREATE TABLE `paymentRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicToken` varchar(80) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`service` varchar(160) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentRequests_publicToken_unique` UNIQUE(`publicToken`)
);
