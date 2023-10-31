const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const customerSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, drobDups: true },
    password: { type: String },
    phone: { type: String },
    image: { type: Object },
    location: Object,
    address: { type: Object },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinDate: { type: Date }
})

customerSchema.pre("save", async function (next) {
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

const customerModel = mongoose.model("customers", customerSchema)


module.exports = customerModel;