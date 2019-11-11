const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

// this will be called on the post registration route
exports.hash = password => genSalt().then(salt => hash(password, salt));

// this will be called in the post login route.
exports.compare = promisify(bcrypt.compare);

// compare takes two arguments, Password & the hash password from the database
// retuen is a boolian
