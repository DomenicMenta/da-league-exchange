CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`opening_id` text NOT NULL,
	`applicant_user_id` text NOT NULL,
	`message` text NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_opening_user_uq` ON `applications` (`opening_id`,`applicant_user_id`);--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`sleeper_league_id` text,
	`name` text NOT NULL,
	`season` integer NOT NULL,
	`format` text NOT NULL,
	`team_count` integer NOT NULL,
	`scoring` text NOT NULL,
	`entry_fee_cents` integer NOT NULL,
	`dues_status` text DEFAULT 'unknown' NOT NULL,
	`bylaws_url` text,
	`bylaws_text` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leagues_sleeper_id_uq` ON `leagues` (`sleeper_league_id`);--> statement-breakpoint
CREATE TABLE `openings` (
	`id` text PRIMARY KEY NOT NULL,
	`league_id` text NOT NULL,
	`title` text NOT NULL,
	`roster_id` integer,
	`roster_summary` text NOT NULL,
	`draft_capital` text DEFAULT '' NOT NULL,
	`record` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`requirements` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_openings` (
	`user_id` text NOT NULL,
	`opening_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `opening_id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sleeper_league_id` text,
	`league_name` text NOT NULL,
	`team_name` text NOT NULL,
	`format` text NOT NULL,
	`record` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`handle` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`sleeper_username` text,
	`role` text DEFAULT 'manager' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_handle_uq` ON `users` (`handle`);