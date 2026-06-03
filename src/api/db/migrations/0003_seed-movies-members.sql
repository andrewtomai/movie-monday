-- Custom SQL migration file, put your code below! --
INSERT OR IGNORE INTO members (name) VALUES
  ('Alex B'),
  ('Alex L'),
  ('Andrew'),
  ('Chris'),
  ('Ciela'),
  ('Derek'),
  ('Devin'),
  ('Gentry'),
  ('Gliz'),
  ('Nible'),
  ('Nick'),
  ('Scott'),
  ('Terren');

INSERT OR IGNORE INTO movies (title, nominated_by) VALUES
  ('10 Things I Hate About You',       (SELECT id FROM members WHERE name = 'Alex B')),
  ('The Orphanage',                    (SELECT id FROM members WHERE name = 'Alex B')),
  ('Hot Rod',                          (SELECT id FROM members WHERE name = 'Alex L')),
  ('The Man From U.N.C.L.E.',          (SELECT id FROM members WHERE name = 'Alex L')),
  ('Kubo and the Two Strings',         (SELECT id FROM members WHERE name = 'Andrew')),
  ('The Nice Guys',                    (SELECT id FROM members WHERE name = 'Andrew')),
  ('Killing of a Sacred Deer',         (SELECT id FROM members WHERE name = 'Chris')),
  ('Lucky Number Sleven',              (SELECT id FROM members WHERE name = 'Chris')),
  ('Waking Life',                      (SELECT id FROM members WHERE name = 'Ciela')),
  ('Altered States',                   (SELECT id FROM members WHERE name = 'Ciela')),
  ('No Country for Old Men',           (SELECT id FROM members WHERE name = 'Derek')),
  ('In Bruges',                        (SELECT id FROM members WHERE name = 'Derek')),
  ('Spiderman Into the Spiderverse',   (SELECT id FROM members WHERE name = 'Devin')),
  ('Baby Driver',                      (SELECT id FROM members WHERE name = 'Devin')),
  ('Wall-e',                           (SELECT id FROM members WHERE name = 'Gentry')),
  ('Ex Machina',                       (SELECT id FROM members WHERE name = 'Gentry')),
  ('Scott Pilgrim vs The World',       (SELECT id FROM members WHERE name = 'Gliz')),
  ('Emma',                             (SELECT id FROM members WHERE name = 'Gliz')),
  ('Pans Labrynth',                    (SELECT id FROM members WHERE name = 'Nible')),
  ('Akira',                            (SELECT id FROM members WHERE name = 'Nible')),
  ('2001: A Space Odyssey',            (SELECT id FROM members WHERE name = 'Nick')),
  ('Moonfall',                         (SELECT id FROM members WHERE name = 'Nick')),
  ('Pride and Prejudice',              (SELECT id FROM members WHERE name = 'Scott')),
  ('The Witch',                        (SELECT id FROM members WHERE name = 'Scott')),
  ('Perfect Blue',                     (SELECT id FROM members WHERE name = 'Terren')),
  ('Amelie',                           (SELECT id FROM members WHERE name = 'Terren'));

UPDATE movies SET watched_at = '2026-02-09' WHERE title = 'Baby Driver';
UPDATE movies SET watched_at = '2026-03-02' WHERE title = 'The Man From U.N.C.L.E.';
UPDATE movies SET watched_at = '2026-04-06' WHERE title = 'The Witch';
UPDATE movies SET watched_at = '2026-05-11' WHERE title = 'Altered States';
