const express = require("express");
const router = express.Router();
const { hash } = require("./utils/bc");
const db = require("./utils/db");

// profile GET and POST
router.get("/", (req, res) => {
    res.render("profile", {
        layout: "main",
        title: "profile",
        name: req.session.user.name
    });
});

router.post("/", (req, res) => {
    let age = req.body.age || 99;
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
            .then(() => {
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

// profile edit GET and POST
router.get("/edit", (req, res) => {
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
            res.redirect("/profile");
        });
});

router.post("/edit", (req, res) => {
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
            Promise.all([
                db.updateUserPw(firstname, lastname, email, hashedpwd, id),
                db.updateUserProfile(age, city, url, id)
            ])
                .then(() => {
                    console.log("success");
                    res.redirect("/petition/signed");
                })
                .catch(err => {
                    console.log("Error on the user profile ", err);
                    res.render("edit", {
                        layout: "main",
                        title: "edit",
                        name: firstname,
                        last: lastname,
                        email: email,
                        age: age,
                        city: city,
                        url: url,
                        error: "Something went wrong"
                    });
                });
        });
    } else {
        Promise.all([
            db.updateUser(firstname, lastname, email, id),
            db.updateUserProfile(age, city, url, id)
        ])
            .then(() => {
                console.log("success");
                res.redirect("/petition/signed");
            })
            .catch(err => {
                console.log("Error on the user profile ", err);
                res.render("edit", {
                    layout: "main",
                    title: "edit",
                    name: firstname,
                    last: lastname,
                    email: email,
                    age: age,
                    city: city,
                    url: url,
                    error: "Something went wrong"
                });
            });
    }
});

module.exports = router;
