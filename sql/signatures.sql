CREATE TABLE signatures (
    id SERIAL primary key,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL
);


-- INSERT INTO signatures (firstname, lastname, signature) VALUES ('jo', 'doe', '3610156');
