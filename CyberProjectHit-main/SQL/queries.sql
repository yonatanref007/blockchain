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
    salt VARCHAR(255)
);

-- Items table creation --
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    country_name VARCHAR(100),
    city_name VARCHAR(100),
    street_name VARCHAR(100),
    street_number VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('for sale', 'for sublett', 'for rent')),
    price DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Item pictures table creation --
CREATE TABLE item_pictures (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    picture_url TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
