CREATE TABLE log_tags(
    log_id INTEGER REFERENCES logs(id),
    tag_id INTEGER REFERENCES tags(id),
    date_tagged TIMESTAMP DEFAULT now() NOT NULL,
    PRIMARY KEY(log_id, tag_id)
);