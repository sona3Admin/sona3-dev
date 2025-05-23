const i18n = require('i18n');
const serviceRepo = require("../../modules/Service/service.repo");
const s3StorageHelper = require("../../utils/s3FileStorage.util")
const batchRepo = require("../../modules/Batch/batch.repo");
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.createService = async (req, res) => {
    try {
        const operationResultObject = await serviceRepo.create(req.body);
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


exports.listServices = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const pageNumber = req.query.page || 1, limitNumber = req.query.limit || 10
        filterObject["seller"] = req.tokenData._id
        const operationResultObject = await serviceRepo.list(filterObject, {}, {}, pageNumber, limitNumber);
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


exports.getService = async (req, res) => {
    try {
        const filterObject = req.query;
        filterObject["isDeleted"] = false
        const operationResultObject = await serviceRepo.get(filterObject, {});
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


exports.updateService = async (req, res) => {
    try {
        req.body.isVerified = false
        const operationResultObject = await serviceRepo.update({ _id: req.query._id, seller: req.query.seller }, req.body);
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


exports.removeService = async (req, res) => {
    try {
        const operationResultObject = await serviceRepo.remove({ _id: req.query._id, seller: req.query.seller });
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


exports.uploadImages = async (req, res) => {
    try {
        logInTestEnv(`req.files`, req.files);
        if (!req.files || req.files.length < 1) return res.status(404).json({ success: false, code: 404, error: i18n.__("fileNotReceived") });
        const existingObject = await serviceRepo.find({ _id: req.query._id, seller: req.query.seller })
        let imagesArray = (existingObject.success && existingObject.result.images) ? (existingObject.result.images) : 0
        let numberOfImages = imagesArray.length + req.files.length
        if (numberOfImages > 10) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("limitExceeded")
        });

        let operationResultArray = await s3StorageHelper.uploadFilesToS3("services", req.files)
        logInTestEnv(`operationResultArray`, operationResultArray);
        if (!operationResultArray.success) return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
        imagesArray = Array.from(imagesArray)
        imagesArray.map((cover) => {
            operationResultArray.result.push(cover)
        });
        let operationResultObject = await serviceRepo.updateDirectly(req.query._id, { images: operationResultArray.result, isVerified: false });
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


exports.deleteImages = async (req, res) => {
    try {
        const { keys } = req.body;

        const existingObject = await serviceRepo.find({ _id: req.query._id, seller: req.query.seller });
        if (!existingObject.success) return res.status(existingObject.code).json(existingObject);

        const pullQuery = { $pull: { images: { key: { $in: keys } } } };
        const updateOperation = await serviceRepo.updateDirectly(req.query._id, pullQuery);

        if (!updateOperation.success) return res.status(updateOperation.code).json(updateOperation);


        batchRepo.create({ filesToDelete: keys });

        return res.status(updateOperation.code).json(updateOperation);

    } catch (err) {
        console.error(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};