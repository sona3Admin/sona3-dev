const i18n = require('i18n');
const cartRepo = require("../../modules/Cart/cart.repo");


exports.getCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.get({ customer: req.query.customer }, {});
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.addItemToCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.addItemToList(req.query.customer, req.query.item, req.query.quantity);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.removeItemFromCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.removeItemFromList(req.query.customer, req.query.shop, req.query.item, req.query.quantity);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}


exports.flushCart = async (req, res) => {
    try {
        const operationResultObject = await cartRepo.flush(req.query);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        console.log(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}