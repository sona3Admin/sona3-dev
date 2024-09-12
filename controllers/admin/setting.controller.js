const settingsRepo = require("../../helpers/settings.helper")
const tiersRepo = require("../../helpers/tiers.helper")
const i18n = require('i18n');


exports.listSettings = async (req, res) => {
    try {
        const operationResultObject = await settingsRepo.listSettings()
        console.log("operationResultObject", operationResultObject.result)
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


exports.updateSetting = async (req, res) => {
    try {
        await settingsRepo.setSettings(req.body.settings)
        const operationResultObject = await settingsRepo.listSettings()
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


exports.listTiers = async (req, res) => {
    try {
        const operationResultObject = await tiersRepo.listTiers()
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