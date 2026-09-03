CREATE TABLE `listing_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`opening_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_listing_messages_opening_created` ON `listing_messages` (`opening_id`,`created_at`);