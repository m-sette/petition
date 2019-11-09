var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//'SELECT * FROM cities'

module.exports.getCities = function() {
    return db.query("SELECT * FROM cities");
};

module.exports.addCity = function(city, population) {
    return db.query("INSERT INTO cities (city, population) VALUES ($1, $2)", [
        city,
        population
    ]);
};

module.exports.getLastSig = function(id) {
    return db.query("SELECT * FROM signatures WHERE id = $1", [id]);
};

module.exports.getSigNames = function() {
    return db.query("SELECT firstname, lastname FROM signatures");
};

module.exports.addSigners = function(firstname, lastname, signature) {
    return db.query(
        "INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3) RETURNING id",
        [firstname, lastname, signature]
    );
};
