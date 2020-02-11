const jwt = require("jsonwebtoken");
const mongo = require('mongodb').MongoClient;
const email = require("./email.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const conString = "mongodb+srv://LittleScooter:BingBong8711500504401@cluster0-5h63f.mongodb.net/admin?retryWrites=true&w=majority";

makeConnection();
async function makeConnection() {

    const con = await mongo.connect(conString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    app = express();

    app.use(express.urlencoded({
        extended: false
    }));
    app.listen(3005, function () {
        console.log("port: 3005")
    });

    app.cars = col;
    require("./router")(app);
}

module.exports = {
    getVerficationToken: getVerficationToken,
    createJsonToken: createJsonToken,
    getJsonTokenData,
    getJsonTokenData,
    encryptData: encryptData,
    compareCode: compareCode,
    createAuthToken: createAuthToken
}

const secret = process.env.SECRET;
async function getVerficationToken(mail) {
    return new Promise(async (resolve, reject) => {
        const code = crypto.randomBytes(3).toString("hex");
        await email.sendMail(mail, code);
        resolve(createJsonToken({
            email: mail,
            code: await encryptData(code)
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