CREATE TABLE logs (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    log_name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    num_tags INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);