const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const sellerSchema = mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, dropDups: true },
    password: { type: String },
    phone: { type: String },
    image: { type: Object },
    identity: [{ type: Object }],
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: Array, default: [0, 0] }
    },
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSubscribed: { type: Boolean, default: false },
    
    bankAccountNumber: { type: String },
    type: { type: String, enum: ["product", "service"] },
    tier: { type: String, enum: ["basic", "pro", "advanced", "lifetime"] },
    subscribtionStartDate: { type: Date },
    subscribtionEndDate: { type: Date },
    joinDate: { type: Date },
    verifyDate: { type: Date },
    birthDate: { type: Date },
    token: { type: String },
    session: { type: Object },
    fcmToken: { type: String },

})

sellerSchema.pre("save", async function (next) {
    if (this.password) this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})


sellerSchema.index({ userName: 1 });


const sellerModel = mongoose.model("sellers", sellerSchema)


module.exports = sellerModel;