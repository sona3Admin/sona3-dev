const mongoose = require("mongoose")

const uriMap = {
    local: process.env.LOCAL_DB_CONNECTION_STRING,
    development: process.env.DEV_DB_CONNECTION_STRING,
    test: process.env.TEST_DB_CONNECTION_STRING,
    production: process.env.PROD_DB_CONNECTION_STRING,
};

console.log("CURRENT_ENV", process.env.CURRENT_ENV);
const selectedEnv = process.env.CURRENT_ENV || 'development'; // Default to 'dev' if CURRENT_ENV is not set
let uri = uriMap[selectedEnv];

const connectToDatabase = async () => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            // if (process.env.CURRENT_ENV !== 'local')
                console.log(`Connected to MongoDB database successfully on ${selectedEnv} environment!`);

        }).catch((err) => {
            console.log("MongoDB Error: ", err);
        })
}


module.exports = {
    connectToDatabase,
    mongoose,
    uri,
    connect: () => {
        mongoose.Promise = Promise;
        mongoose.connect(uri);
    },
    disconnect: done => {
        mongoose.disconnect(done);
    }
};