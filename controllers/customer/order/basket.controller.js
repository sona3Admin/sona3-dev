const i18n = require('i18n');
const sellerRepo = require("../../../modules/Seller/seller.repo")
const shopRepo = require("../../../modules/Shop/shop.repo")
const productRepo = require("../../../modules/Product/product.repo")
const orderRepo = require("../../../modules/Order/order.repo")
const basketRepo = require("../../../modules/Basket/basket.repo");
const { handleOrderCreation, handleReverseOrderCreation } = require("../../../helpers/order.helper")
const ifastShipperHelper = require("../../../utils/ifastShipping.util")
const { findObjectInArray } = require("../../../helpers/cart.helper")
const stripeHelper = require("../../../utils/stripePayment.util")

exports.createOrder = async (req, res) => {
    try {
        if (req.body?.paymentMethod == "visa") return await this.createOrderPaymentLink(req, res)
        let customerOrderObject = req.body
        let customerCartObject = await basketRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, true, true)
        customerOrderObject["orderType"] = "basket";
        let operationResultObject = await orderRepo.create(customerOrderObject);
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        let shippingData = await ifastShipperHelper.createNewBulkOrder(customerOrderObject, false)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, operationResultObject.result)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        // operationResultObject["orderData"] = shippingData.orderData
        basketRepo.flush({ customer: req.body.customer })
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

        let shippingData = await ifastShipperHelper.createNewBulkOrder(orderObject, true)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        let operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, orderObject)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject["orderData"] = shippingData.orderData

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


exports.cancelSubOrder = async (req, res) => {
    try {
        let orderObject = await orderRepo.get({ _id: req.query._id, "subOrders._id": req.query.subOrder })

        let subOrderObject = findObjectInArray(orderObject.result.subOrders, "_id", req.query.subOrder)
        if (!subOrderObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });

        let operationResultObject = await ifastShipperHelper.cancelOrderShipment(subOrderObject.result.shippingId)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        let subOrders = orderObject.result.subOrders
        subOrders[subOrderObject.index].status = "canceled"
        operationResultObject = await orderRepo.updateDirectly(orderObject.result._id.toString(), { subOrders })
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
        let customerCartObject = await basketRepo.get({ customer: req.body.customer })
        if (customerCartObject.result.subCarts.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        customerOrderObject = await handleOrderCreation(customerCartObject.result, customerOrderObject, true, false)
        let costObject = { cartTotal: customerOrderObject.cartTotal, taxesTotal: customerOrderObject.taxesTotal, shippingFeesTotal: customerOrderObject.shippingFeesTotal }
        let orderDetailsObject = { basket: customerCartObject.result._id.toString() }
        let customerDetailsObject = { ...req.body }
        const orderType = "basket"
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