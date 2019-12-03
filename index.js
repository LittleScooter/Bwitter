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

const port = process.env.PORT || 3500
app.listen(port, function () {
    console.log("port:" + port)
});