const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");
const cookieSession = require("cookie-session");
app.use(express.urlencoded({ extended: false }));

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

// this is the method to store the Signature in the cookie session.
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("X-Frame-Options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    console.log(req.session.user);
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        res.render("petition", {
            layout: "main",
            title: "Petition"
        });
    }
});

app.post("/petition", (req, res) => {
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
            console.log(err);
        });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
        title: "registration"
    });
});

app.post("/register", (req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let pw = req.body.password;

    hash(pw).then(hashedpwd => {
        db.addUser(firstname, lastname, email, hashedpwd)
            .then(({ rows }) => {
                req.session.user = {
                    name: firstname,
                    last: lastname,
                    userId: rows[0].id
                };
                console.log("success");
                console.log(req.session.user);
                res.redirect("/petition"); //petition page
            })
            .catch(err => {
                console.log("Error on the registar POST", err);
                res.send(`<p>Error ${err.detail}</p>`);
                res.redirect("/register");
            });
    });
    // if fails, render a template with an error message.
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        title: "login"
    });
});

app.get("/logout", (req, res) => {
    req.session.user = null;
    res.redirect("/register");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let pw = req.body.password;

    db.getUser(email)
        .then(({ rows }) => {
            compare(pw, rows[0].password).then(val => {
                // req.session.user.userId = rows[0].id;
                if (val) {
                    req.session.user = {
                        name: rows[0].firstname,
                        last: rows[0].lastname,
                        userId: rows[0].id
                    };
                    db.getUserId(req.session.user.userId)
                        .then(({ rows }) => {
                            console.log(rows.length);
                            if (rows.length > 0) {
                                req.session.user.signatureId = rows[0].id;
                                res.redirect("/petition/signed");
                            } else {
                                res.redirect("/petition");
                            }
                        })
                        .catch(err => console.log("Getting the user id", err));
                } else {
                    res.redirect("/login");
                }
            });
        })
        .catch(err => {
            console.log("Error on the login page: ", err);
        });
});

app.get("/petition/signed", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        db.getLastSig(req.session.user.signatureId)
            .then(({ rows }) => {
                res.render("signed", {
                    layout: "main",
                    title: "signed",
                    sigNum: req.session.user.signatureId,
                    data: rows[0].signature
                });
            })
            .catch(err => {
                console.log("Error on the signed page", err);
            });
    }
});

app.get("/petition/signers", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        db.getSigNames()
            .then(({ rows }) => {
                res.render("signers", {
                    layout: "main",
                    title: "signers",
                    names: rows
                });
            })
            .catch(err => {
                console.log("Error on signers page: ", err);
            });
    }
});
// app.post("/add-city", (req, res) => {
//     db.addCity("Sarajevo", 70000)
//         .then(() => {
//             console.log("success");
//         })
//         .catch(err => {
//             console.log(err);
//         });
// });
//
// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then(({ rows }) => {
//             console.log("Rows: ", rows);
//             //Rows is the only property we need to care about.
//             //Rows are always an ARRAY of objects.
//         })
//         .catch(err => {
//             console.log(err);
//         });
// });

// app.get("/sig", (req, res) => {
//     db.getSig()
//         .then(({ rows }) => {
//             console.log("Rows: ", rows);
//
//             //Rows is the only property we need to care about.
//             //Rows are always an ARRAY of objects.
//         })
//         .catch(err => {
//             console.log(err);
//         });
// });
app.listen(8080, () => console.log("listening petition project on port 8080"));
