const express = require("express");
const users = require("./users.js");
const authentication = require("./authentication.js")

require("dotenv").config();

/*initilizes express*/
const app = express();

app.use(express.static(__dirname + "/static"))

/*Creates all routes*/
app.get("/", function (req, res) {
    res.redirect("/home");
});
// app.get("/loginToken", function (req, res) {
//     res.redirect("/loginToken");
// });
app.post("/login", function (req, res) {
    const {
        email
    } = req.body;
    // Finns konto
    const userMatchEmail = users.filter(user => user.email === email);
    if (userMatchEmail.length > 1) {
        // Detta ska aldrig hända du har gjort nåt fel
        return;
    }
    if (userMatchEmail === 0) {
        // Konto finns inte
        res.json({error:true,message:"NoAccount"});
        return;
    }

    // annars skapa verifikations kod
    // skicka kod med mail
    // skapa token
    const token = await authentication.getVerficationToken(userMatchEmail[0].email);
    res.cookie("verificationToken", token, {

        httpOnly: true,
        expires: new Date(Date.now() + 1200000), //20 minutes
    });
    res.json({
        error: false
    });

});
app.post("/verifyWithCode", function (req, res) {
    const {
        token
    } = req.cookies;
    const {
        code
    } = req.body;

    if(!token) {
        res.json({error:true});
        return;
    }
    // läs token
    const data = await authentication.getJsonTokenData(token);
    // Jämför koden i token med koden användare skickade
    if(authentication.compareCode(code,data.code)){
        res.cookie("auth",authentication.createAuthToken,{
            
            httpOnly: true,
            expires: new Date(Date.now() + 1200000), //20 minutes
        });
        res.json({error:false});
    }
    // OM samma skicka auth token
    // Annars skicka fel kod och öka antal fel i token

});

/*Assigns a port*/
const port = process.env.PORT || 3005
app.listen(port, function () {
    console.log("port:" + port)
});