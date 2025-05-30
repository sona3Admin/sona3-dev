const i18n = require('i18n');
const requestRepo = require("../../modules/Request/request.repo");
const notificationRepo = require("../../modules/Notification/notification.repo");
const { getSocketIo } = require("../../configs/socketManager");
const { logInTestEnv } = require("../../helpers/logger.helper");
// const emailHelper = require("../../helpers/email.helper");


exports.listRequests = async (req, res) => {
    try {
        const filterObject = req.query;
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        const operationResultObject = await requestRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
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
        logInTestEnv(`err.message`, err.message);
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
        if (operationResultObject.success) {
            const requestObject = await requestRepo.get({ _id: req.query._id }, {});
            const io = getSocketIo();

            let notificationObject = {}

            if (req.body.status === "rejected") {
                notificationObject = {
                    seller: requestObject.result.seller._id,
                    titleEn: "Your service request has been rejected",
                    titleAr: "تم رفض طلب الخدمة الخاص بك",
                    bodyEn: `${requestObject.result.shop.nameEn} has rejected the price for your request on service ${requestObject.result.service.nameEn}`,
                    bodyAr: `قام ${requestObject.result.shop.nameAr} برفض السعر الخاص بك على الخدمة ${requestObject.result.service.nameAr}`,
                    redirectId: requestObject.result._id,
                    redirectType: "serviceRequest",
                    type: "serviceRequestRejected",
                    receivers: [requestObject.result.customer._id],
                    deviceTokens: [requestObject.result.customer.fcmToken],
                }
            } else {
                notificationObject = {
                    seller: requestObject.result.seller._id,
                    titleEn: `update Service Request from ${requestObject.result.seller.userName}`,
                    titleAr: `طلب خدمة معدل من ${requestObject.result.seller.userName}`,
                    bodyEn: `${requestObject.result.seller.userName} updated the service request ${requestObject.result.service.nameEn} from the following shop: ${requestObject.result.shop.nameEn}`,
                    bodyAr: `قام ${requestObject.result.seller.userName} بتحديث طلب الخدمة ${requestObject.result.service.nameAr} من المتجر التالي: ${requestObject.result.shop.nameAr} `,
                    redirectId: requestObject.result._id,
                    redirectType: "serviceRequest",
                    type: 'servicePriceUpdate',
                    receivers: [requestObject.result.customer._id],
                    deviceTokens: [requestObject.result.customer.fcmToken],
                }
            }
            let notificationResultObject = await notificationRepo.create(notificationObject)
            io.to(requestObject.result.customer._id.toString()).emit("newNotification", { success: true, code: 201, result: notificationResultObject.result })
            // emailHelper.sendNewOfferEmailToCustomer(requestObject.result, req.lang)

        }
        return res.status(operationResultObject.code).json(operationResultObject);

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
}
