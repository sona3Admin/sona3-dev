let express = require("express");
const app = express();

let checkToken = require("../../helpers/jwt.helper").verifyToken;
const { checkIdentity } = require("../../helpers/authorizer.helper")

const allowedUsers = ["customer"]

const authRoutes = require("./auth.route");
const customerRoutes = require("./customer.route");


app.use(authRoutes)
app.use(checkToken(allowedUsers), checkIdentity, customerRoutes);
// app.use(checkToken(allowedUsers), isAuthorized, adminRoutes);


module.exports = app