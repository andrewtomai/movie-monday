CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rating` real NOT NULL,
	`movie_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE no action
);
