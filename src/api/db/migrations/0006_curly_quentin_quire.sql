ALTER TABLE `ratings` ADD `member_id` integer REFERENCES members(id);--> statement-breakpoint
ALTER TABLE `ratings` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `ratings_member_movie_active` ON `ratings` (`member_id`,`movie_id`,`deleted_at`);