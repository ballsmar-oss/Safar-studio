CREATE TABLE `dailyStats` (
	`day` text PRIMARY KEY NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`visitors` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dailyVisitors` (
	`day` text NOT NULL,
	`hash` text NOT NULL,
	PRIMARY KEY(`day`, `hash`)
);
