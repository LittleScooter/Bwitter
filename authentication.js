const jwt = require("jsonwebtoken");
const email = require("./email.js");
const bcrypt = require("bcryptjs");

module.exports = {
    getVerficationToken: getVerficationToken,
    createJsonToken: createJsonToken,
    getJsonTokenData,
    getJsonTokenData,
    encryptData: encryptData,
    compareCode:compareCode,
    createAuthToken:createAuthToken
}
const secret = process.env.SECRET;
async function getVerficationToken(mail) {
    return new Promise((resolve, reject) => {
        const code = crypto.randomBytes(3).toString("hex");
        await email.sendMail(mail, code);
        resolve(createJsonToken({
            email: mail,
            code: await encryptData(code)
        }));

    });


}

function compareCode(code,encryptedCode){
    return bcrypt.compare(code,encryptedCode);
}

function createJsonToken(data) {
    return jwt.sign(data,secret,{expiresIn:1000*60*10});
}

function getJsonTokenData(token) {
    return jwt.verify(token,secret);
}

function encryptData(data) {
    return new Promise(resolve => {
        const salt = await bcrypt.genSalt(10);
        const encryptedData = await bcrypt.hash("" + data, salt);
        resolve(encryptedData);
    });
}
function createAuthToken(email){

    return createJsonToken({email:email, type:"AUTH"});

}