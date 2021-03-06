const cors = require("cors");
const express = require("express");
const authentication = require("./authentication.js")
const cookieparser = require("cookie-parser");

module.exports = (mongoose) => {

    const {
        Schema,
        model
    } = mongoose;
    const userSchema = new Schema({
        name: String,
        email: String,
        followers: [String],
        following: [String],
        likedTweests:[String]
    });
    
    const tweetSchema = new Schema({
        author:{
            name:String,
            id:String
        },
        body:String,
        likes:{
            type:Number,
            default:1,
        },
    })

    const Tweet = new model("tweet",tweetSchema);
    const User = new model("user", userSchema);

    /*initilizes express*/
    const corsOptions = {
        origin: true,
        credentials: true,
    }
    const app = express();

    app.use(express.static(__dirname + "/static"))
    app.use(express.json());
    app.use(cors(corsOptions));
    app.use(cookieparser());

    /*Creates all routes*/
    app.get("/", function (req, res) {
        res.redirect("/home");
    });
    app.get("/home", function (req, res) {
        res.sendFile(__dirname + "/index.html");
    });
    app.get("/feed", function (req, res){
        res.sendFile(__dirname + "/feed.html");
    });

    //logs in user
    app.post("/login", async function (req, res) {
        if (!req.body) {
            res.json({
                error: true,
                message: "No body"
            });
            return;
        }
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
        // Checks if account exists
        const userMatchEmail = User.findOne({
            email: email
        });
        
        if (userMatchEmail.length === 0) {
            // Konto finns inte
            res.json({
                error: true,
                message: "NoAccount"
            });
            return;
        }

        const token = await authentication.getVerficationToken(userMatchEmail.email, "LOGIN");
        res.cookie("verificationToken", token, {

            httpOnly: true,
            expires: new Date(Date.now() + 1200000), //20 minutes
        });
        res.json({
            error: false
        });

    });

    app.post("/register", async  (req, res) => {
        if (!req.body) {
            res.json({
                error: true,
                message: "No body"
            });
            return;
        }
        console.log("DDDD");
        const {
            email,
            name
        } = req.body;
        if (!email) {
            res.json({
                error: true,
                message: "NoEmail"
            });
            return;
        }
        if (!name) {
            res.json({
                error: true,
                message: "NoName"
            });
            return;
        }
        console.log("YYEE", email);

        // Checks if account exists
        const userMatchEmail = await User.findOne({
            email: email
        });
        if (userMatchEmail) {
            res.json({
                error: true,
                message: "EmailExists"
            });
            return;
        }

        const token = await authentication.getVerficationToken(email, "REGISTER", {
            name: name,
            email: email
        });
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

            if (data.type === "REGISTER") {
                const newUser = new User(data.user);
                await newUser.save();
            }
            res.cookie("auth", authentication.createAuthToken(), {

                httpOnly: true,
                expires: new Date(Date.now() + 1200000), //20 minutes
            });
            res.json({
                error: false
            });
        }
    });

    app.post("/makeTweet", verifyAuth, async function (req, res) {
        const body = req.body.body;
        // Get data
        const authData = await authentication.getJsonTokenData(req.cookies.auth);

        const user = Tweet.findOne({email:authData.email});

        const newTweet = new Tweet({
            author:{
                name:user.name,
                id:user.id
            },
            body:body,         

        })
        await newTweet.save();
        res.json({error:false});
        // create post object
        // Save post object
    });

    app.post("/delTweet", verifyAuth, async function (req, res){
        //get id
        //yeet tweet
    });

    //kollar om man är inloggad med cookie
    app.post("/userInfo",verifyAuth, async (req,res)=>{
        console.log("user info");
        res.json({error:false});
    })

    app.post("/getGlobalFeed",verifyAuth,(refq,res)=>{
        let tweets = await Tweet.find();
        const authData = await authentication.getJsonTokenData(req.cookies.auth);
        const user = Tweet.findOne({email:authData.email});

        tweets.map((value) => {
            // gå igenom alla tweets
            //checka om du har likat dom
            
            value.liked=user.liked.includes((value.id));
            return{value};
        })
    });
    
    app.post("/getPersonalFeed",(req,res)=>{
        const authData = await authentication.getJsonTokenData(req.cookies.auth);

        const user = Tweet.findOne({email:authData.email});

        let tweets = await Tweet.find({"author.id":{$in:user.following}}); /* Hugo wrote this line and it is beutiful */
        tweets.map((value) => {
            value.liked=user.liked.includes((value.id));
            return{value};
        })

        
    });
    //creates an auth token verifyer
    async function verifyAuth(req, res, next) {
        // Check if auth cookie exist
        const cookie = req.cookies.auth;
        if (!cookie) {
            res.json({
                error: true,
                message: "NoAuth"
            })
            return;
        }
        // Chekc if the cookie is a auth token
        try {
            console.log("COOKIE",cookie);
            var authData = await authentication.getJsonTokenData(cookie);
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