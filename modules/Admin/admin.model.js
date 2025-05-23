const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const adminSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    image: { type: Object, default: {} },
    permission: { type: mongoose.Types.ObjectId, ref: "roles", index: true },
    role: {
        type: String,
        enum: ["superAdmin", "admin", "chat"],
        default: "admin"
    },
    token: { type: String },
    session: { type: Object },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now() },
})

adminSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltrounds);
    next();
})

const adminModel = mongoose.model("admins", adminSchema)


module.exports = adminModel;