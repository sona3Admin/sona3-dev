const app = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller")


app.get("/customer", dashboardController.countCustomers);
app.get("/seller", dashboardController.countSellers);
app.get("/shop", dashboardController.countShops);
app.get("/item", dashboardController.countItems);
app.get("/order", dashboardController.countOrders);
app.get("/revenue", dashboardController.calculateRevenue);

app.get("/ordersByDay", dashboardController.getOrdersStatsByDay);
app.get("/ordersByMonth", dashboardController.getOrdersStatsByMonth);
app.get("/requestsByDay", dashboardController.getServiceRequestsStatsByDay);
app.get("/requestsByMonth", dashboardController.getServiceRequestStatsByMonth);

module.exports = app
