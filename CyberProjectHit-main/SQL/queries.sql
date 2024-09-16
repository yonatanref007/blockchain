--Users table creation--
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    salt VARCHAR(255),
    metamask VARCHAR(255)
);

-- Items table creation --
CREATE TABLE video (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    title VARCHAR(100),
    description VARCHAR(100),
    category VARCHAR(6)
);



CREATE TABLE passwordhistory (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
