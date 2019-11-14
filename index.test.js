const supertest = require("supertest");
const app = require("./index");
const cookieSession = require("cookie-session");

test("Get /petition with no auth gets redirects to Registration", () => {
    cookieSession.mockSession({
        userId: null
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

test("Get /register with auth", () => {
    cookieSession.mockSession({
        user: {
            userId: 10
        }
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("Get /petition with auth plus signature", () => {
    cookieSession.mockSession({
        user: {
            userId: 10,
            signatureId: 12
        }
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition/signed");
        });
});

test("Get /petition/signed with auth, but no signature", () => {
    cookieSession.mockSession({
        user: {
            userId: 10
        }
    });
    return supertest(app)
        .get("/petition/signed")
        .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("Get /petition/signers with auth, but no signature", () => {
    cookieSession.mockSession({
        user: {
            userId: 10
        }
    });
    return supertest(app)
        .get("/petition/signers")
        .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});
