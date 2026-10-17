ALTER TABLE `movies` ADD `omdb_id` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `omdb_imdb_rating` real;--> statement-breakpoint
ALTER TABLE `movies` ADD `omdb_rt_rating` integer;--> statement-breakpoint
ALTER TABLE `movies` ADD `omdb_year` text;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_omdb_id_unique` ON `movies` (`omdb_id`);