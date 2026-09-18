CREATE TABLE `beta_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `beta_usage_action_time` ON `beta_usage` (`action`,`created_at`);