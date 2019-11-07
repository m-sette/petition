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
