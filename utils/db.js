var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getLastSig = function(id) {
    return db.query("SELECT * FROM signatures WHERE id = $1", [id]);
};

module.exports.getUserId = function(id) {
    return db.query("SELECT * FROM signatures WHERE users_id = $1", [id]);
};

module.exports.getSigNames = function() {
    return db.query(
        `SELECT firstname, lastname, city, age, url FROM users
        FULL OUTER JOIN users_profiles
        ON users.id = users_profiles.user_id
        INNER JOIN signatures
        ON users.id = signatures.users_id`
    );
};

module.exports.addSigners = function(signature, users_id) {
    return db.query(
        "INSERT INTO signatures (signature, users_id) VALUES ($1, $2) RETURNING id",
        [signature, users_id]
    );
};

module.exports.getUser = function(email) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

module.exports.addUser = function(firstname, lastname, email, password) {
    return db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [firstname, lastname, email, password]
    );
};

module.exports.addProfile = function(age, city, url, user_id) {
    return db.query(
        "INSERT INTO users_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [age, city, url, user_id]
    );
};

module.exports.getCities = function(city) {
    return db.query(
        `SELECT firstname, lastname, city, age, url FROM users
        FULL OUTER JOIN users_profiles
        ON users.id = users_profiles.user_id
        INNER JOIN signatures
        ON users.id = signatures.users_id
        WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};

//Joined query
// SELECT * FROM singers
// JOIN songs
// ON singers.id = song.singer_id;

// SELECT firstname, lastname  FROM users
// JOIN signatures
// ON users.id = signatures.users_id;

// SELECT * FROM users_profiles
// FULL OUTER JOIN users
// ON users.id = users_profiles.user_id
// ;

// SELECT firstname, city, age, url FROM users
// INNER JOIN users_profiles
// ON users.id = users_profiles.user_id;
