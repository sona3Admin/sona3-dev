let bcrypt = require("bcrypt");
const i18n = require('i18n');
let sellerModel = require("./seller.model")
let saltrounds = 5;


exports.find = async (filterObject) => {
    try {
        const resultObject = await sellerModel.findOne(filterObject).lean();
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        }

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }
    }

}


exports.get = async (filterObject, selectionObject) => {
    try {
        let resultObject = await sellerModel.findOne(filterObject).lean()
            .select(selectionObject)

        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.list = async (filterObject, selectionObject, sortObject, pageNumber, limitNumber) => {
    try {
        let resultArray = await sellerModel.find(filterObject).lean()
            .sort(sortObject)
            .select(selectionObject)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        if (!resultArray || resultArray.length == 0) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let count = await sellerModel.count(filterObject);
        return {
            success: true,
            code: 200,
            result: resultArray,
            count
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.create = async (formObject) => {
    try {
        formObject = this.convertToLowerCase(formObject)
        uniqueObjectResult = await this.isObjectUninque(formObject);

        if (!uniqueObjectResult.success) return uniqueObjectResult
        const resultObject = new sellerModel(formObject);
        await resultObject.save();

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 201,
            result: resultObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.update = async (_id, formObject) => {
    try {
        formObject = this.convertToLowerCase(formObject)
        let existingObject = await this.find({ _id })
        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        if (formObject.email) {
            const uniqueObjectResult = await this.isEmailUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        if (formObject.userName) {
            formObject.userName = formObject.userName ? formObject.userName : existingObject.result.userName;
            const uniqueObjectResult = await this.isNameUnique(formObject, existingObject)
            if (!uniqueObjectResult.success) return uniqueObjectResult
        }

        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password" })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.updateDirectly = async (_id, formObject) => {
    try {
        let resultObject = await sellerModel.findByIdAndUpdate({ _id }, formObject, { new: true, select: "-password" })
        if (!resultObject) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        return {
            success: true,
            code: 200,
            result: resultObject
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.remove = async (_id) => {
    try {

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("recordDeleted") }
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }

}


exports.comparePassword = async (emailString, passwordString) => {
    try {
        emailString = emailString.toLowerCase()
        let existingObject = await this.find({ email: emailString })

        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let matchingPasswords = await bcrypt.compare(passwordString, existingObject.result.password)
        if (!matchingPasswords) return {
            success: false,
            code: 409,
            error: i18n.__("incorrectPassword")
        };

        return {
            success: true,
            result: existingObject.result,
            code: 200
        };


    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.resetPassword = async (emailString, newPasswordString) => {
    try {
        emailString = emailString.toLowerCase()
        let existingObject = await this.find({ email: emailString })

        if (!existingObject.success) return {
            success: false,
            code: 404,
            error: i18n.__("notFound")
        }

        let hashedPassword = await bcrypt.hash(newPasswordString, saltrounds)
        let resultObject = await sellerModel.findOneAndUpdate({ email: emailString }, { password: hashedPassword })

        if (!resultObject) return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        }

        return {
            success: true,
            code: 200,
            result: { message: i18n.__("successfulOperation") }
        };


    } catch (err) {
        console.log(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
}


exports.isObjectUninque = async (formObject) => {
    const duplicateObject = await this.find({
        $or: [{ email: formObject.email }, { userName: formObject.userName }]
    })


    if (duplicateObject.success) {
        if (duplicateObject.result.email == formObject.email) return {
            success: false,
            code: 409,
            error: i18n.__("emailUsed")
        }

        if (duplicateObject.result.userName == formObject.userName) return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200
    }
}


exports.isEmailUnique = async (formObject, existingObject) => {

    if (formObject.email !== existingObject.result.email) {
        const duplicateObject = await this.find({ email: formObject.email })
        if (duplicateObject.success &&
            duplicateObject.result._id.toString() !== existingObject.result._id.toString()) return {
                success: false,
                code: 409,
                error: i18n.__("emailUsed")
            }
    }
    return {
        success: true,
        code: 200
    }

}


exports.isNameUnique = async (formObject, existingObject) => {

    const duplicateObject = await this.find({ userName: formObject.userName });

    if (duplicateObject.success &&
        duplicateObject.result._id.toString() !== existingObject.result._id.toString()) {
        return {
            success: false,
            code: 409,
            error: i18n.__("nameUsed")
        }
    }

    return {
        success: true,
        code: 200,
    }
}


exports.convertToLowerCase = (formObject) => {
    if (formObject.email) formObject.email = formObject.email.toLowerCase()
    if (formObject.userName) formObject.userName = formObject.userName.toLowerCase()
    return formObject
}