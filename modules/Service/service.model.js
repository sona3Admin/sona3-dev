const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    shop: { type: mongoose.Types.ObjectId, ref: "shops" },
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    mainCategory: { type: mongoose.Types.ObjectId, ref: "categories" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    fields: [{
        _id: { type: mongoose.Types.ObjectId, ref: "fields" },
        field: { type: Object }
    }],
    basePrice: { type: Number, min: 0 },
    rank: { type: Number, min: 1 },
    images: [{ type: Object }],
    rating: { type: Number, min: 1, default: 1 },
    reviewCount: { type: Number, min: 0, default: 0 },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    creationDate: { type: Date },
    verifyDate: { type: Date },
    lastUpdateDate: { type: Date },
    preparationTime: { type: Number },
    width: { type: Number },
    height: { type: Number },
    length: { type: Number },
    weight: { type: Number },
    orderCount: { type: Number, min: 0, default: 0 },
})


serviceSchema.index({ nameEn: 1 });
serviceSchema.index({ nameAr: 1 });

const serviceModel = mongoose.model("services", serviceSchema)


module.exports = serviceModel;