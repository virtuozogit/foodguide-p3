const mongoose = require("mongoose")
const path = require('path')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
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
    }
})

// image path
userSchema.virtual('userImagePath').get(function (){
    if (this.image != null && this.fileType != null){
        return `data:${this.fileType};charset=utf-8;base64,${this.image.toString('base64')}`
    }
})

module.exports = mongoose.model("User", userSchema)