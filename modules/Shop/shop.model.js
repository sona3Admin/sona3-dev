const mongoose = require("mongoose");


const shopSchema = mongoose.Schema({
    seller: { type: mongoose.Types.ObjectId, ref: "sellers" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
    tags: [{ type: mongoose.Types.ObjectId, ref: "tags" }],
    nameEn: { type: String, required: true },
    nameAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    phone: { type: String },
    image: { type: Object },
    covers: [{ type: Object }],
    location: {
        type: "Point",
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 1 },
    reviewCount: { type: Number, min: 0 },
    joinDate: Date
})


const shopModel = mongoose.model("shops", shopSchema)


module.exports = shopModel;