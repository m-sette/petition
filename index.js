const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        title: "Petition"
    });
});

app.post("/petition", (req, res) => {});

app.get("/petition/signed", (req, res) => {
    res.render("signed", {
        layout: "main",
        title: "signed"
    });
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

app.listen(8080, () => console.log("listening petition project on port 8080"));
