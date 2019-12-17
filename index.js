const express = require("express");

/*initilizes express*/
const app = express();

app.use(express.static(__dirname + "/static"))

/*Creates all routes*/
app.get("/", function (req, res) {
    res.redirect("/home");
});
app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/index.html");
})
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login.html");
})
app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/register.html");
})

/*Gives a port*/
const port = process.env.PORT || 3500
app.listen(port, function () {
    console.log("port:" + port)
});