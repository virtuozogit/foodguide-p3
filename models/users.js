const mongoose = require("mongoose")
const path = require('path')
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true
    },
    password: {
        type: String,
    },
    bio: {
        type: String,
        default: ""
    },
    owner: {
        type: Boolean,
        default: false
    },
    image: {
        type: Buffer,
    },
    fileType: {
        type: String,
    },
    admin: {
        type: Boolean,
        default: false
    }
})

// image path
userSchema.virtual('userImagePath').get(function (){
    if (this.image != null && this.fileType != null){
        return `data:${this.fileType};charset=utf-8;base64,${this.image.toString('base64')}`
    }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema)