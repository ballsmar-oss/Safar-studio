CREATE TABLE `dailySources` (
	`day` text NOT NULL,
	`source` text NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `source`)
);
