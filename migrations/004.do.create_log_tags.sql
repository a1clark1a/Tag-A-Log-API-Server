CREATE TABLE log_tags(
    log_id INTEGER REFERENCES logs(id) ON DELETE CASCADE NOT NULL,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    date_tagged TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY(log_id, tag_id)
);