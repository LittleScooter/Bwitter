const express = require("express");

/*initilizes express*/
const app = express();

app.use(express.static(__dirname + "/static"))

/*Creates all routes*/
app.get("/", function (req, res) {
    res.redirect("/home");
});
app.get("/loginToken", function (req, res) {
    res.redirect("/loginToken");
});

app.post("/login", function (req, res) {

    //Hämta våra användare från db/fil
    const users = require("./users");

    const user = users.filter(function (u) {
        console.log(u);
        console.log(req.body.email);
        if (req.body.email === u.email) {
            return true;
        }
    });

    // //Om vi har en och exakt en användare med rätt email
    // if (user.length === 1) {
    //     //kolla lösenord
    //     bcrypt.compare(req.body.password, user[0].password, function (err, success) {

    //         if (success) {
    //             //res.cookie("auth",{httpOnly:true,sameSite:"strict"});
    //             const token = jwt.sign({
    //                 email: user[0].email
    //             }, secret, {
    //                 expiresIn: "1m"
    //             });
    //             res.cookie("token", token, {
    //                 httpOnly: true,
    //                 sameSite: "strict"
    //             });
    //             res.send("login success !!! wow")
    //         } else {
    //             res.send("wrong password");
    //         }
    //     });
    // } else {
    //     res.send("no such user");
    // }
});

/*Assigns a port*/
const port = process.env.PORT || 3005
app.listen(port, function () {
    console.log("port:" + port)
});