const mongoose = require("mongoose");
init();
async function init() {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    require("dotenv").config();
    await mongoose.connect(process.env.MONGO);
    require("./Routes.js")(mongoose);
}