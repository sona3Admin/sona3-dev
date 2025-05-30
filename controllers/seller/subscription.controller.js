const i18n = require('i18n');
const sellerRepo = require("../../modules/Seller/seller.repo")
const shopRepo = require("../../modules/Shop/shop.repo")
const serviceRepo = require("../../modules/Service/service.repo")
const productRepo = require("../../modules/Product/product.repo")
const couponRepo = require("../../modules/Coupon/coupon.repo")
const stripeHelper = require("../../utils/stripePayment.util")
const { getTiers } = require("../../helpers/tiers.helper")
const { getSettings } = require("../../helpers/settings.helper")
const { logInTestEnv } = require("../../helpers/logger.helper");


exports.paySubscriptionFees = async (req, res) => {
    try {
        logInTestEnv("Initiating Subscription Flow...")
        const todayDate = new Date();
        const freeTrialEndDate = new Date('2026-01-01');
        let initialFees = 0
        let payedInitialFees = true
        const freeTrialOn = await getSettings("isFreeTrialOn")
        logInTestEnv("req.query.tier", req.query.tier)
        logInTestEnv("req.query.tierDuration", req.query.tierDuration)
        logInTestEnv("freeTrialOn", freeTrialOn)

        const sellerObject = await sellerRepo.find({ _id: req.query._id })
        if (!sellerObject.success) return res.status(404).json({ success: false, code: 404, error: i18n.__("notFound") })
        logInTestEnv("sellerObject.result.isSubscribed", sellerObject.result.isSubscribed)
        logInTestEnv("sellerObject.result.tier", sellerObject.result.tier)
        logInTestEnv("sellerObject.result.tierDuration", sellerObject.result.tierDuration)
        logInTestEnv("sellerObject.result.subscriptionStartDate", sellerObject.result.subscriptionStartDate)
        logInTestEnv("sellerObject.result.subscriptionEndDate", sellerObject.result.subscriptionEndDate)

        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate > todayDate &&
            sellerObject.result.tier == req.query.tier &&
            sellerObject.result.tierDuration == req.query.tierDuration) return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("alreadySubscribedToPlan")
            })

        if (sellerObject.result.isSubscribed &&
            sellerObject.result.tier == "lifetime") return res.status(409).json({
                success: false,
                code: 409,
                error: i18n.__("alreadySubscribedToPlan")
            })

        const tierDetails = await getTiers(`${req.query.tier}_${sellerObject.result.type}`)

        let subscriptionFees = req.query.tierDuration == "month" ? parseFloat(tierDetails.monthlyFees) : parseFloat(tierDetails.yearlyFees)

        if (tierDetails.name == "lifetime") subscriptionFees = parseFloat(tierDetails.lifeTimeFees)
        logInTestEnv("subscriptionFees", subscriptionFees)

        if (!sellerObject.result.payedInitialFees) {
            initialFees += parseFloat(tierDetails.initialFees)
            payedInitialFees = true
        }
        logInTestEnv("initialFees", initialFees)

        let isDowngrade = await this.checkIfDowngrade(sellerObject, req.query)
        if (isDowngrade.success) return res.status(409).json({
            success: false,
            code: 409,
            error: i18n.__("cannotDowngradeTier")
        })


        // changing tiers within an active subscription period.
        if (sellerObject.result.isSubscribed &&
            sellerObject.result.subscriptionEndDate > todayDate &&
            (
                (sellerObject.result.tier != req.query.tier) ||
                (sellerObject.result.tierDuration === 'month' && req.query.tierDuration === 'year')
            )
        ) {
            let upgradeResult = await this.upgradeTier(sellerObject, req.query)
            if (!upgradeResult.success) return res.status(upgradeResult.code).json(upgradeResult);
            subscriptionFees = (upgradeResult.result).toFixed(2)
        }

        if ((todayDate < freeTrialEndDate) &&
            freeTrialOn &&
            req.query.tier != "lifetime" &&
            !sellerObject.result.freeTrialApplied) subscriptionFees = 0

        if (req.query.coupon) {
            logInTestEnv("Subscription Fees before applying coupon: ", subscriptionFees)
            logInTestEnv("Initial Fees before applying coupon: ", initialFees)
            let applyingCouponResult = await couponRepo.applyOnSubscriptionFees(req.query.coupon, req.query._id, subscriptionFees, initialFees)
            if (!applyingCouponResult.success) return res.status(applyingCouponResult.code).json(applyingCouponResult);
            subscriptionFees = (applyingCouponResult.result.newSubscriptionFees).toFixed(2)
            initialFees = (applyingCouponResult.result.newInitialFees).toFixed(2)
            logInTestEnv("Subscription Fees after applying coupon: ", subscriptionFees)
            logInTestEnv("Initial Fees after applying coupon: ", initialFees)
        }


        logInTestEnv("Final Subscription Fees", subscriptionFees)
        logInTestEnv("Calculation done, Redirecting to stripe...")
        let agent = req.query.agent || "web"
        let operationResultObject = await stripeHelper.initiateSubscriptionPayment(req.query._id, req.query.tier, req.query.tierDuration, subscriptionFees, initialFees, payedInitialFees, req.query.timestamp, agent, req.lang)
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


exports.upgradeTier = async (sellerObject, newTierObject) => {
    logInTestEnv("Upgrading Tier...")

    if (newTierObject.tier == "lifetime") return {
        success: false,
        code: 400,
        error: i18n.__("cannotDowngradeTier")
    };

    const tiers = ['basic', 'pro', 'advanced'];
    const currentTierIndex = tiers.indexOf(sellerObject.result.tier);
    const newTierIndex = tiers.indexOf(newTierObject.tier);
    const todayDate = new Date();

    // Check if it's a downgrade
    if (newTierIndex < currentTierIndex) return {
        success: false,
        code: 400,
        error: i18n.__("cannotDowngradeTier")
    };


    // Calculate remaining time in current subscription
    const currentTotalSubscriptionDuration = sellerObject.result.tierDuration === 'month' ? 30 : 365; // days
    logInTestEnv("currentTotalSubscriptionDuration", currentTotalSubscriptionDuration)

    const timeSpent = (todayDate - sellerObject.result.subscriptionStartDate) / (1000 * 60 * 60 * 24); // in days
    logInTestEnv("timeSpent", timeSpent)

    const timeRemaining = currentTotalSubscriptionDuration - timeSpent;
    logInTestEnv("timeRemaining", timeRemaining)

    const percentageRemaining = timeRemaining / currentTotalSubscriptionDuration;
    logInTestEnv("percentageRemaining", percentageRemaining)

    // Get current tier details
    const currentTierDetails = await getTiers(`${sellerObject.result.tier}_${sellerObject.result.type}`);
    const currentTierFees = sellerObject.result.tierDuration === 'month' ?
        parseFloat(currentTierDetails.monthlyFees) : parseFloat(currentTierDetails.yearlyFees);
    logInTestEnv("currentTierFees", currentTierFees)

    // Calculate remaining credit
    const remainingCredit = currentTierFees * percentageRemaining;
    logInTestEnv("remainingCredit", remainingCredit)

    // Calculate new tier fees
    const newTierDetails = await getTiers(`${newTierObject.tier}_${sellerObject.result.type}`);
    let newSubscriptionFees = newTierObject.tierDuration === 'month' ?
        parseFloat(newTierDetails.monthlyFees) : parseFloat(newTierDetails.yearlyFees);
    logInTestEnv("newSubscriptionFees", newSubscriptionFees)


    // Handle duration upgrade (monthly to yearly) within the same tier
    if (newTierIndex === currentTierIndex &&
        sellerObject.result.tierDuration === 'month' &&
        newTierObject.tierDuration === 'year') {
        logInTestEnv("Upgrading from monthly to yearly plan...")
        // Calculate the prorated yearly fee
        const yearlyFee = parseFloat(newTierDetails.yearlyFees);
        logInTestEnv("yearlyFee", yearlyFee)

        const proratedYearlyFee = yearlyFee - remainingCredit;
        logInTestEnv("proratedYearlyFee", proratedYearlyFee)

        newSubscriptionFees = proratedYearlyFee;
        logInTestEnv("newSubscriptionFees", newSubscriptionFees)
        return {
            success: true,
            code: 200,
            result: newSubscriptionFees
        };

    }

    // For tier upgrades or staying on the same plan, subtract remaining credit
    newSubscriptionFees = Math.max(0, (newSubscriptionFees - remainingCredit));
    logInTestEnv("newSubscriptionFees", newSubscriptionFees)

    return {
        success: true,
        code: 200,
        result: newSubscriptionFees
    };
};


exports.applySubscription = async (req, res) => {
    try {
        logInTestEnv("Applying subscription...");
        logInTestEnv("req.body", req.body);
        let updatedSellerData = {}
        const freeTrialOn = await getSettings("isFreeTrialOn")
        const subscriptionStartDate = new Date(req.body.timestamp);
        logInTestEnv("subscriptionStartDate", subscriptionStartDate);

        // let subscriptionEndDate = new Date(subscriptionStartDate);
        let subscriptionEndDate = new Date('2026-01-01');
        if (req.body.tierDuration === 'month') subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        else if (req.body.tierDuration === 'year') subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);


        if (req.body?.freeTrialApplied && freeTrialOn) {
            updatedSellerData = { freeTrialApplied: true };
            subscriptionEndDate = new Date("2026-01-01");
        }

        logInTestEnv("subscriptionEndDate", subscriptionEndDate);

        updatedSellerData = {
            ...updatedSellerData,
            tier: req.body.tier,
            tierDuration: req.body.tierDuration,
            subscriptionStartDate: subscriptionStartDate,
            subscriptionEndDate: subscriptionEndDate,
            isSubscribed: true
        };

        if (req.body?.payedInitialFees == true) updatedSellerData.payedInitialFees = true
        logInTestEnv("updatedSellerData", updatedSellerData);

        const updatedSellerResult = await sellerRepo.updateDirectly(req.body.seller.toString(), updatedSellerData);
        if (!updatedSellerResult.success) return res.status(updatedSellerResult.code).json(updatedSellerResult);

        shopRepo.updateMany({ seller: req.body.seller.toString() }, { isActive: true })
        if (updatedSellerResult.result.type == "product") productRepo.updateMany({ seller: req.body.seller.toString() }, { isActive: true })
        if (updatedSellerResult.result.type == "service") serviceRepo.updateMany({ seller: req.body.seller.toString() }, { isActive: true })

        logInTestEnv("Subscription applied successfully");
        return res.status(200).json({
            success: true,
            code: 200,
            result: updatedSellerResult.result
        });

    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return res.status(500).json({
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        });
    }
};


exports.checkIfDowngrade = (sellerObject, newTierObject) => {
    const todayDate = new Date();

    if (newTierObject.tier !== "lifetime" && sellerObject.result.tier == "lifetime") return { success: true };
    if (newTierObject.tier == "lifetime" && sellerObject.result.tier != "lifetime") return { success: true };

    const tiers = ['basic', 'pro', 'advanced'];
    const currentTierIndex = tiers.indexOf(sellerObject.result.tier);
    const newTierIndex = tiers.indexOf(newTierObject.tier);

    // Check if it's a downgrade
    if (newTierIndex < currentTierIndex) return { success: true };
    if (newTierIndex == currentTierIndex &&
        newTierObject.tierDuration == "month" &&
        sellerObject.result.tierDuration == "year" &&
        sellerObject.result.subscriptionEndDate > todayDate
    ) return { success: true };

    return { success: false }
}

