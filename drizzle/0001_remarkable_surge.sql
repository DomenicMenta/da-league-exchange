CREATE TABLE `listing_views` (
	`id` text PRIMARY KEY NOT NULL,
	`opening_id` text NOT NULL,
	`viewer_user_id` text,
	`viewed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile_views` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_user_id` text NOT NULL,
	`viewer_user_id` text,
	`viewed_at` integer NOT NULL
);
