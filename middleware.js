exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.user && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};
exports.requireLoggedOutUser = function(req, res, next) {
    if (req.session.user) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.requireNoSignature = function(req, res, next) {
    if (req.session.user.signatureId) {
        res.redirect("/petition/signed");
    } else {
        next();
    }
};

exports.requireSignature = function(req, res, next) {
    if (!req.session.user.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};
