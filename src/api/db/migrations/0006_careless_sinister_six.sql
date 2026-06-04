ALTER TABLE `ratings` ADD `member_id` integer REFERENCES members(id);--> statement-breakpoint
CREATE UNIQUE INDEX `ratings_member_movie_active` ON `ratings` (`member_id`,`movie_id`);