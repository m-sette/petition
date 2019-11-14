const express = require("express");
const app = express();

//////// Refactoring code
// module.exports = app;
///////

const db = require("./utils/db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");
const cookieSession = require("cookie-session");

app.use(express.urlencoded({ extended: false }));

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
const profileRouter = require("./profile");

// this is the method to store the Signature in the cookie session.
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

/// Add middleware functioin in a separete file and export then
// function requiredLogout(req, res, next) {
//     if (req.session.user) {
//         res.redirect("/petition");
//     } else {
//         next();
//     }
// }

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

////Todays material

// app.use((req, res, next) => {
//     if (
//         !req.session.user.userId &&
//         req.url != "/register" &&
//         req.url != "login"
//     ) {
//         res.redirect("/register");
//     } else {
//         next();
//     }
// });

app.get("/", (req, res) => {
    console.log(req.session.user);
    res.redirect("/petition");
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
                res.redirect("/profile"); //petition page
            })
            .catch(err => {
                console.log("Error on the registar POST", err);
                res.render("register", {
                    layout: "main",
                    title: "registration",
                    error: "Something went wrong. Maybe try different password"
                });
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

app.post("/login", (req, res) => {
    let email = req.body.email;
    let pw = req.body.password;

    db.getUser(email)
        .then(({ rows }) => {
            compare(pw, rows[0].password)
                .then(val => {
                    if (val) {
                        // console.log(rows);
                        req.session.user = {
                            name: rows[0].firstname,
                            last: rows[0].lastname,
                            userId: rows[0].u_id
                        };
                        console.log(req.session.user);
                        if (rows[0].signature != null) {
                            req.session.user.signatureId = rows[0].id;
                            res.redirect("/petition/signed");
                            console.log(req.session.user);
                        } else {
                            res.redirect("/petition");
                        }
                    } else {
                        res.redirect("/login");
                    }
                })
                .catch(err => {
                    console.log("Comapare: ", err);
                });
        })
        .catch(err => {
            console.log("Error on the login page: ", err);
        });
});

app.get("/profile", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        res.render("profile", {
            layout: "main",
            title: "profile",
            name: req.session.user.name
        });
    }
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city;
    let userId = req.session.user.userId;
    let url = req.body.url;

    if (!age && !city && !url) {
        res.redirect("/petition");
        if (!url.startWith("http://")) {
            url = "http://" + url;
        }
    } else {
        db.addProfile(age, city, url, userId)
            .then(({ rows }) => {
                console.log("success");
                res.redirect("/petition");
            })
            .catch(err => {
                console.log("Error on the profile page ", err);
                res.redirect("/profile");

                res.render("/profile", {
                    layout: "main",
                    title: "profile",
                    error: "Something went wrong, please try again"
                });
            });
    }
});
// app.use(requiredLoggedInUser)
//app.use(profileRouter)
// require(".auth");  a bunch of routes get added to this file

app.get("/petition", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else if (req.session.user.signatureId) {
        res.redirect("/petition/signed");
    } else {
        res.render("petition", {
            layout: "main",
            title: "Petition",
            name: req.session.user.name
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
            console.log("Petion signing error: ", err);
            res.render("petition", {
                layout: "main",
                title: "petition",
                error: "Something went wrong"
            });
        });
});

app.get("/signers/:city", (req, res) => {
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

app.get("/petition/signed", (req, res) => {
    // !req.session.user.signatureId
    if (!req.session.user) {
        res.redirect("/register");
    } else if (!req.session.user.signatureId) {
        res.redirect("/petition");
    } else {
        db.getLastSig(req.session.user.signatureId)
            .then(({ rows }) => {
                // console.log(rows);
                res.render("signed", {
                    layout: "main",
                    title: "signed",
                    sigNum: rows[0].COUNT, // not working
                    data: rows[0].signature,
                    name: req.session.user.name
                });
            })
            .catch(err => {
                console.log("Error on the signed page", err);
            });
    }
});

app.post("/petition/signed", (req, res) => {
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

app.get("/petition/signers", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
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
    }
});

app.get("/profile/edit", (req, res) => {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        db.getProfile(req.session.user.userId)
            .then(({ rows }) => {
                res.render("edit", {
                    layout: "main",
                    title: "edit",
                    name: rows[0].firstname,
                    last: rows[0].lastname,
                    email: rows[0].email,
                    age: rows[0].age,
                    city: rows[0].city,
                    url: rows[0].url
                });
            })
            .catch(err => {
                console.log("Error on the edit page: ", err);
            });
    }
});

app.post("/profile/edit", (req, res) => {
    let firstname = req.body.first;
    let lastname = req.body.last;
    let email = req.body.email;
    let pw = req.body.password;
    let age = req.body.age;
    let url = req.body.url;
    let city = req.body.city;
    let id = req.session.user.userId;

    if (pw) {
        hash(pw).then(hashedpwd => {
            db.updateUserPw(firstname, lastname, email, hashedpwd, id)
                .then(() => {
                    console.log("success new pw");
                    db.updateUserProfile(age, city, url, id)
                        .then(() => {
                            console.log("success");
                        })
                        .catch(err => {
                            console.log("Error on the user profile ", err);
                        });
                    res.redirect("/petition/signed");
                })
                .catch(err => {
                    console.log("Update Pw error", err);
                });
        });
    } else {
        db.updateUser(firstname, lastname, email, id)
            .then(() => {
                console.log("success");
                db.updateUserProfile(age, city, url, id)
                    .then(() => {
                        console.log("success");
                    })
                    .catch(err => {
                        console.log("Error on the user profile ", err);
                    });
                res.redirect("/petition/signed");
            })
            .catch(err => {
                console.log("Error on the users update request: ", err);
                res.redirect("/profile/edit");
            });
    }
});

app.get("/logout", (req, res) => {
    req.session.user = null;
    res.redirect("/register");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("listening petition project on port 8080")
);
