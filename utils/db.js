var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//'SELECT * FROM cities'

// module.exports.getCities = function() {
//     return db.query("SELECT * FROM cities");
// };
//
// module.exports.addCity = function(city, population) {
//     return db.query("INSERT INTO cities (city, population) VALUES ($1, $2)", [
//         city,
//         population
//     ]);
// };

module.exports.getLastSig = function(id) {
    return db.query("SELECT * FROM signatures WHERE id = $1", [id]);
};

module.exports.getUserId = function(id) {
    return db.query("SELECT * FROM signatures WHERE users_id = $1", [id]);
};

module.exports.getSigNames = function() {
    return db.query("SELECT firstname, lastname FROM users");
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
