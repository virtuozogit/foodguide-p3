const mongoose = require("mongoose")

const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true
    },
    logged: {
        type: Boolean,
        default: false
    },
    rTime: {
        type: Date
    },
    remember: {
        type: Boolean,
        default: false
    },
    pageNum: {
        type: Number,
        default: 0
    },
    restoQuery: {
        type: String
    },
    currentRoute: {
        type: String
    }
})

module.exports = mongoose.model("login", loginSchema)
