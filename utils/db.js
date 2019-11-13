var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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
    return db.query(
        `SELECT users.id AS u_id, * FROM users
        FULL OUTER JOIN signatures
        ON users.id = signatures.users_id
        WHERE email = $1`,
        [email]
    );
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

module.exports.getProfile = function(user_id) {
    return db.query(
        `SELECT * FROM users
        FULL OUTER JOIN users_profiles
        ON users.id = users_profiles.user_id
        WHERE user_id = $1`,
        [user_id]
    );
};

module.exports.updateUser = function(firstname, lastname, email, id) {
    return db.query(
        `UPDATE users
        SET firstname = $1, lastname = $2, email = $3
        WHERE id = $4`,
        [firstname, lastname, email, id]
    );
};

module.exports.updateUserPw = function(
    firstname,
    lastname,
    email,
    password,
    id
) {
    return db.query(
        `UPDATE users
        SET firstname = $1, lastname = $2, email = $3, password = $4
        WHERE id = $5`,
        [firstname, lastname, email, password, id]
    );
};

module.exports.updateUserProfile = function(age, city, url, user_id) {
    return db.query(
        `
        INSERT INTO users_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3
        `,
        [age, city, url, user_id]
    );
};

module.exports.deleteSignature = function(id) {
    return db.query(
        `
        DELETE FROM signatures
        WHERE id = $1;
        `,
        [id]
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
