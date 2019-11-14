const supertest = require("supertest");
const app = require("./index");
const cookieSession = require("cookie-session");

//Mochhere the user cookieSession
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

test("GET /welcome sends html", () => {
    return supertest(app)
        .get("/welcome")
        .then(res => {
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("<h1>Welcome!</h1>");
        });
});

test("GET /home redirects if session is not right", () => {
    return supertest(app)
        .get("/home")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/welcome");
        });
});

test("GET /home sends html if session is right", () => {
    cookieSession.mockSessionOnce({
        submitted: 1
    });
    return supertest(app)
        .get("/home")
        .then(res => {
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("<title>Home</title>");
        });
});

test("POST /welcome sets req.session.submitted and redirects to /home", () => {
    const mySession = {};
    cookieSession.mockSessionOnce(mySession);
    return supertest(app)
        .post("/welcome")
        .send("funky=chicken")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
            expect(mySession).toEqual({
                submitted: true
            });
        });
});
