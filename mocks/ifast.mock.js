const i18n = require('i18n');
const ifastHelper = require("../utils/ifastShipping.util")


exports.getIfastToken = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.getAuthToken();
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


exports.createNewBulkOrder = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.createNewBulkOrder(req.body, false);
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


exports.createNewReverseOrder = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.createNewBulkOrder(req.body, true);
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


exports.getOrderShipmentLastStatus = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.getOrderShipmentLastStatus(req.body.trackingNos);
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


exports.cancelOrderShipment = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.cancelOrderShipment(req.query.trackingno);
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


exports.listCities = async (req, res) => {
    try {
        const operationResultObject = await ifastHelper.listCities(req.query.countryID);
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