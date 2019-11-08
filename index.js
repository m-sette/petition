const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
const csurf = require("csurf");

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
    // res.setHeaders("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    // req.session.test = ";)";
    console.log(req.session.signatureId);
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        title: "Petition"
    });
});

app.post("/petition", (req, res) => {
    let firstName = req.body.firstname;
    let lasteName = req.body.lastname;
    let signature = req.body.signature;

    db.addSigners(firstName, lasteName, signature)
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            console.log("success");
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/petition/signed", (req, res) => {
    let sigNum = 0;
    db.getSig(req.session.signatureId)
        .then(({ rows }) => {
            //console.log("Rows: ", rows);
            // console.log("table size: ", rows.length);
            sigNum = rows.length;
            res.render("signed", {
                layout: "main",
                title: "signed",
                helpers: {
                    sigNum() {
                        return sigNum;
                    }
                },
                data: rows[0].signature
            });
        })
        .catch(err => {
            console.log(err);
        });
    console.log(req.session.signatureId);
});

app.get("/petition/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
        title: "signers"
    });
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
