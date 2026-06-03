-- Custom SQL migration file, put your code below! --
INSERT INTO ratings (movie_id, rating) VALUES
  ((SELECT id FROM movies WHERE title = 'Baby Driver'),            7.92),
  ((SELECT id FROM movies WHERE title = 'The Man From U.N.C.L.E.'), 7.91),
  ((SELECT id FROM movies WHERE title = 'The Witch'),               7.142857143),
  ((SELECT id FROM movies WHERE title = 'Altered States'),          6.75);