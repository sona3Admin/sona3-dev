const i18n = require('i18n');
const sellerRepo = require("../../../modules/Seller/seller.repo")
const shopRepo = require('../../../modules/Shop/shop.repo');
const productRepo = require('../../../modules/Product/product.repo');
const orderRepo = require("../../../modules/Order/order.repo")
const cartRepo = require("../../../modules/Cart/cart.repo");
const { handleOrderCreation, handleReverseOrderCreation } = require("../../../helpers/order.helper")
const firstFlightShipperHelper = require("../../../utils/firstFlightSipping.util")
const stripeHelper = require("../../../utils/stripePayment.util");


exports.createOrder = async (req, res) => {
    try {
        console.log("req.body.paymentMethod", req.body.paymentMethod)
        if (req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)

        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });

        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, false, true)
        customerOrderObject["orderType"] = "cart";
        let operationResultObject = await orderRepo.create(customerOrderObject);
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        console.log("passed")
        let shippingData = await firstFlightShipperHelper.createNewBulkOrder(customerOrderObject, false)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await firstFlightShipperHelper.saveShipmentData(shippingData.result, operationResultObject.result, customerOrderObject.shippingCost)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        cartRepo.flush({ customer: req.body.customer })
        sellerRepo.updateManyById(operationResultObject.result.sellers, { hasSold: true })
        shopRepo.updateManyById(operationResultObject.result.shops, { $inc: { orderCount: 1 }, hasSold: true })
        productRepo.updateManyById(operationResultObject.result.products, { $inc: { orderCount: 1 } })
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.returnSubOrder = async (req, res) => {
    try {
        let orderObject = await orderRepo.get({ _id: req.query._id, "subOrders._id": req.query.subOrder })
        if (!orderObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        orderObject = handleReverseOrderCreation(orderObject.result, req.query.subOrder)

        let shippingData = await firstFlightShipperHelper.createNewBulkOrder(orderObject, true)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        console.log("shippingData", shippingData)
        let operationResultObject = await firstFlightShipperHelper.saveShipmentData(shippingData.result, orderObject, shippingData.result[0].CODAmount)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        return res.status(operationResultObject.code).json(operationResultObject);

    }
    catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.createOrderPaymentLink = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerCartObject = await cartRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, false, false)
        let customerDetailsObject = { ...req.body }
        let costObject = { cartTotal: customerOrderObject.cartTotal, taxesTotal: customerOrderObject.taxesTotal, shippingFeesTotal: customerDetailsObject.shippingCost.total }
        let orderDetailsObject = { cart: customerCartObject.result._id.toString() }
        const orderType = "cart"
        let agent = req.query.agent || "web"
        let operationResultObject = await stripeHelper.initiateOrderPayment(costObject, customerDetailsObject, orderDetailsObject, orderType, req.body.issueDate, agent, req.lang)
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message controller`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}