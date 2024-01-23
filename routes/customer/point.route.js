const app = require("express").Router();
const pointController = require("../../controllers/customer/point.controller")

app.get("/list", pointController.listPoints);
app.get("/get", pointController.getPoint);
app.post("/apply", pointController.applyPoint);


module.exports = app