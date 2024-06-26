const i18n = require('i18n');
const requestRepo = require("../../modules/Request/request.repo");
const ifastShipperHelper = require("../../utils/ifastShipping.util")
const { handleRequestPurchase, handleReturnService } = require("../../helpers/serviceRequest.helper")


exports.purchaseRequest = async (req, res) => {
    try {
        let customerOrderObject = req.body
        let customerRequestObject = await requestRepo.get({ _id: req.query._id })
        customerOrderObject = await handleRequestPurchase(customerRequestObject.result, customerOrderObject)

        let operationResultObject = await requestRepo.updateDirectly(req.query._id, { ...customerOrderObject.calculations });

        if (customerRequestObject.result.service.isFood && customerRequestObject.result.service.isDeliverable) {
            let shippingData = await ifastShipperHelper.createNewBulkOrder(customerOrderObject, false)
            operationResultObject["orderData"] = shippingData.orderData

            if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
            operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, operationResultObject.result)
            if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        }

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


exports.returnRequest = async (req, res) => {
    try {
        let requestObject = await requestRepo.get({ _id: req.query._id })
        if (!requestObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") });
        requestObject = handleReturnService(requestObject.result)
        let operationResultObject = requestRepo.updateDirectly(req.query._id, { ...requestObject.calculations });

        let shippingData = await ifastShipperHelper.createNewBulkOrder(requestObject, true)
        if (!shippingData.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });

        operationResultObject = await ifastShipperHelper.saveShipmentData(shippingData.result.trackingnos, requestObject)
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


exports.cancelRequest = async (req, res) => {
    try {
        let requestObject = await requestRepo.get({ _id: req.query._id })

        let operationResultObject = await ifastShipperHelper.cancelOrderShipment(requestObject.result.shippingId)
        if (!operationResultObject.success) return res.status(500).json({ success: false, code: 500, error: i18n.__("internalServerError") });
        operationResultObject = await requestRepo.updateDirectly(req.query._id, { status: "canceled" })
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


exports.createRequest = async (req, res) => {
    try {
        let customerRequestObject = req.body
        const operationResultObject = await requestRepo.create(customerRequestObject);
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


exports.listRequests = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await requestRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getRequest = async (req, res) => {
    try {
        const filterObject = req.query;
        const operationResultObject = await requestRepo.get(filterObject, {});
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


exports.updateRequest = async (req, res) => {
    try {
        const operationResultObject = await requestRepo.update(req.query._id, req.body);
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
