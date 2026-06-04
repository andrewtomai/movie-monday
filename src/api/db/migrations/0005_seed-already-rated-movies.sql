-- Clear the previously seeded ratings
DELETE FROM ratings;

-- Altered States
INSERT INTO ratings (movie_id, rating) VALUES
    ((SELECT id FROM movies WHERE title = 'Altered States'), 7),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 6),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 8),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 5),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 10),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 6),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 4),
    ((SELECT id FROM movies WHERE title = 'Altered States'), 8);

-- The Witch
INSERT INTO ratings (movie_id, rating) VALUES
    ((SELECT id FROM movies WHERE title = 'The Witch'), 10),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 7),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 4),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 8),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 9),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 7),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 8),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 7),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 7),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 8),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 5),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 5),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 7),
    ((SELECT id FROM movies WHERE title = 'The Witch'), 8);

-- Baby Driver
INSERT INTO ratings (movie_id, rating) VALUES
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 10),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 10),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 7),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 7),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 6),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 7),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8),
    ((SELECT id FROM movies WHERE title = 'Baby Driver'), 8);

-- The Man From U.N.C.L.E.
INSERT INTO ratings (movie_id, rating) VALUES
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 10),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 9),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 9),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 8),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 7),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 7),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 6),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 8),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 6),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 8),
    ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 9);