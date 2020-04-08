CREATE TABLE log_tags(
    log_id INTEGER REFERENCES logs(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY(log_id, tag_id)
);