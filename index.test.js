const supertest = require("supertest");
const app = require("./index");
const cookieSession = require("cookie-session");
cookieSession.mockSession({
    userId: 10
});

test("Get /welcome sends html", () => {
    return supertest(app)
        .get("/welcome")
        .then(res => {
            console.log(res.statusCode, res.text);
        });
});
