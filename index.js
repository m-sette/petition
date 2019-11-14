const express = require("express");
const app = express();
module.exports = app;
const db = require("./utils/db");
const hb = require("express-handlebars");
const csurf = require("csurf");
// const { hash, compare } = require("./utils/bc");
const cookieSession = require("cookie-session");
const {
    requireSignature,
    requireNoSignature,
    requireLoggedOutUser,
    requireLoggedInUser
} = require("./middleware");
const profileRouter = require("./profile");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

// this is the method to store the Signature in the cookie session.
app.use(express.urlencoded({ extended: false }));
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", requireLoggedOutUser, (req, res) => {
    console.log(req.session.user);
    res.redirect("/register");
});

app.use(requireLoggedInUser);

app.use("/profile", profileRouter);

require("./auth");

app.get("/petition", requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main",
        title: "Petition",
        name: req.session.user.name
    });
});

app.post("/petition", requireNoSignature, (req, res) => {
    let signature = req.body.signature;
    let userid = req.session.user.userId;
    console.log(userid);

    db.addSigners(signature, userid)
        .then(({ rows }) => {
            req.session.user.signatureId = rows[0].id;
            console.log("success");
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log("Petion signing error: ", err);
            res.render("petition", {
                layout: "main",
                title: "petition",
                error: "Something went wrong"
            });
        });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    const { city } = req.params;
    db.getCities(city)
        .then(({ rows }) => {
            res.render("city", {
                layout: "main",
                title: `${city}`,
                data: rows,
                city: city
            });
        })
        .catch(err => {
            console.log("Combined error ", err);
        });
});

app.get("/petition/signed", requireSignature, (req, res) => {
    Promise.all([db.getLastSig(req.session.user.signatureId), db.getSigTotal()])
        .then(result => {
            res.render("signed", {
                layout: "main",
                title: "signed",
                sigNum: result[1].rows[0].count,
                data: result[0].rows[0].signature,
                name: req.session.user.name
            });
        })
        .catch(err => {
            console.log("Error on the signed page", err);
        });
});

app.post("/petition/signed", requireSignature, (req, res) => {
    let sigId = req.session.user.signatureId;
    console.log(sigId);
    db.deleteSignature(sigId)
        .then(() => {
            req.session.user.signatureId = null;
            console.log("Delete success");
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("Delete error ", err);
        });
});

app.get("/petition/signers", requireSignature, (req, res) => {
    db.getSigNames()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                title: "signers",
                data: rows
            });
        })
        .catch(err => {
            console.log("Error on signers page: ", err);
        });
});

app.get("/logout", (req, res) => {
    req.session.user = null;
    res.redirect("/register");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("listening petition project on port 8080")
);
