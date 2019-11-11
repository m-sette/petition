-- CREATE TABLE signatures (
--     id SERIAL primary key,
--     firstname VARCHAR(255) NOT NULL,
--     lastname VARCHAR(255) NOT NULL,
--     signature TEXT NOT NULL
-- );


-- INSERT INTO signatures (firstname, lastname, signature) VALUES ('jo', 'doe', '3610156');
-- altere this table
DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL,
    users_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- here we are manually adding the foreign id (user_id)
