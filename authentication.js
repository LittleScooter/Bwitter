const jwt = require("jsonwebtoken");
const mongo = require('mongodb').MongoClient;
const email = require("./email.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const express = require("express");

const conString = process.env.MONGO;

// makeConnection();
// async function makeConnection() {

//     const con = await mongo.connect(conString, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     app = express();

//     app.use(express.urlencoded({
//         extended: false
//     }));

//     app.listen(8000, function () {
//         console.log("port: 8000")
//     });

//     app.cars = col;
//     require("./router")(app);
// }

module.exports = {
    getVerficationToken: getVerficationToken,
    createJsonToken: createJsonToken,
    getJsonTokenData,
    getJsonTokenData,
    encryptData: encryptData,
    compareCode: compareCode,
    createAuthToken: createAuthToken
}

const secret = process.env.TOKENSECRET;
async function getVerficationToken(mail, type, user) {
    return new Promise(async (resolve, reject) => {
        const code = crypto.randomBytes(3).toString("hex");
        // await email.sendMail(mail, code);
        console.log("CODE: ", code);
        resolve(createJsonToken({
            email: mail,
            user:user,
            code: await encryptData(code),
            type:type

        }));
    });
}

function compareCode(code, encryptedCode) {
    return bcrypt.compare(code, encryptedCode);
}

function createJsonToken(data) {
    return jwt.sign(data, secret, {
        expiresIn: 1000 * 60 * 10
    });
}

function getJsonTokenData(token) {
    return jwt.verify(token, secret);
}

function encryptData(data) {
    return new Promise(async resolve => {
        const salt = await bcrypt.genSalt(10);
        const encryptedData = await bcrypt.hash("" + data, salt);
        resolve(encryptedData);
    });
}

function createAuthToken(email) {

    return createJsonToken({
        email: email,
        type: "AUTH"
    });
}
