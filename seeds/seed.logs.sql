BEGIN;

TRUNCATE
tags,
logs,
users
RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, email, password)
values
('demo', 'paladinmail143@gmail.com', 'password' ),
('test', 'test@gmail.com', 'password' );


INSERT INTO logs (log_name, description, url, user_id, num_tags)
VALUES
('React', 'some info about react','https://reactjs.org/', 1, 1),
('Node', 'some info about Node','https://nodejs.org/en//', 2, 1),
('Express', 'some info about express','https://expressjs.com/', 1,1),
('Getting started with express', 'some info about express getting started','https://expressjs.com/en/starter/installing.html', 1,2),
('React', 'some info about react','https://reactjs.org/', 2,1);

INSERT INTO tags (tag_name)
VALUES
('react'),
('node'),
('express'),
('getting-started');

INSERT INTO log_tags(log_id, tag_id)
VALUES
(1,1),
(2,2),
(3,3),
(4,3),
(4,4),
(5,1);

COMMIT;