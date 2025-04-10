const app = require("express").Router();
const authController = require("../../controllers/customer/auth.controller")
const customerController = require("../../controllers/customer/customer.controller")
const { createCustomerValidation, sendEmailValidation, loginValidation, updateCustomerValidation, authenticateBySocialMediaValidation } = require("../../validations/customer.validation")
const validator = require("../../helpers/validation.helper")
let checkToken = require("../../helpers/jwt.helper").verifyToken;
const allowedUsers = ["customer"]

app.post("/register", validator(createCustomerValidation), authController.register);
app.post("/login", validator(loginValidation), authController.login);
app.post("/social", validator(authenticateBySocialMediaValidation), authController.authenticateBySocialMediaAccount)
app.post("/guest", authController.loginAsGuest);
app.post("/otp", validator(sendEmailValidation), authController.sendEmailVerificationCode);
app.post("/verify", authController.verifyEmailOTP);
app.put("/verify", checkToken(allowedUsers), validator(updateCustomerValidation), customerController.updateCustomer)


module.exports = app
