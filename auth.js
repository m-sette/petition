const app = require("./index");
const db = require("./utils/db");
const { hash, compare } = require("./utils/bc");
const { requireLoggedOutUser } = require("./middleware");

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        layout: "main",
        title: "registration"
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
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

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
        title: "login"
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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
