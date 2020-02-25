const express = require("express");
const users = require("./users.js");
const authentication = require("./authentication.js")
const cookieparser = require("cookie-parser");

module.exports = () => {

    /*initilizes express*/
    const app = express();

    app.use(express.static(__dirname + "/static"))
    app.use(express.json());
    app.use(cookieparser());

    /*Creates all routes*/
    app.get("/", function (req, res) {
        res.redirect("/home");
    });
    app.get("/home", function (req, res) {
        res.sendFile(__dirname + "/index.html");
    });

    app.post("/login", async function (req, res) {
        if (!req.body) {
            res.json({
                error: true,
                message: "No body"
            });
            return;
        }
        console.log("DDDD");
        const {
            email
        } = req.body;
        if (!email) {
            res.json({
                error: true,
                message: "NoEmail"
            });
            return;
        }
        console.log("YYEE", email);

        // Checks if account exists
        const userMatchEmail = users.filter(user => user.email === email);
        if (userMatchEmail.length > 1) {
            // This should never happen
            return;
        }

        if (userMatchEmail.length === 0) {
            // Konto finns inte
            res.json({
                error: true,
                message: "NoAccount"
            });
            return;
        }

        const token = await authentication.getVerficationToken(userMatchEmail[0].email);
        res.cookie("verificationToken", token, {

            httpOnly: true,
            expires: new Date(Date.now() + 1200000), //20 minutes
        });
        res.json({
            error: false
        });

    });
    app.post("/verifyWithCode", async function (req, res) {
        console.log(req.cookies);

        const {
            verificationToken
        } = req.cookies;
        const {
            code
        } = req.body;

        if (!verificationToken) {
            res.json({
                error: true,
                message: "No token"
            });
            return;
        }

        // reads the token
        const data = await authentication.getJsonTokenData(verificationToken);

        // Compares the code to the code sent by the user
        if (authentication.compareCode(code, data.code)) {
            res.cookie("auth", authentication.createAuthToken, {

                httpOnly: true,
                expires: new Date(Date.now() + 1200000), //20 minutes
            });
            res.json({
                error: false
            });
        }
    });

    app.post("/makePost", verifyAuth, async function (req, res) {

    });

    //creates an auth token verifyer
    async function verifyAuth(req, res, next) {
        // Check if auth cookie exist
        const cookie = res.cookies.auth;
        if (!cookie) {
            res.json({
                error: true,
                message: "ingen auth finns"
            })
            return;
        }
        // Chekc if the cookie is a auth token
        try {
            const authData = await authentication.getJsonTokenData(cookie);
        } catch (err) {
            res.json({
                error: true,
                message: "auth token modified"
            })
            return;
        }
        if (authData.type === "AUTH") {
            next();
        } else {
            res.json({
                error: true,
                message: "wrong token type"
            })
            return;
        }
        // if yes then user is logged in
        // else user is not authed
    }

    /*Assigns a port*/
    const port = process.env.PORT || 3005
    app.listen(port, function () {
        console.log("port:" + port)
    });
}