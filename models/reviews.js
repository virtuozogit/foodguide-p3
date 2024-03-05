const mongoose = require("mongoose")
const Resto = require('../models/restaurants')

// file
// const reviewFileBasePath = 'uploads/reviewFile'

const reviewSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    rating: {
        type: Number
    },
    info: {
        type: String
    },
    restoId: {
        type: mongoose.Schema.Types.ObjectId
    },
    restoName: {
        type: String
    },
    ownerName: {
        type: String,
        default: ""
    },
    ownerInfo: {
        type: String,
        default: ""
    },
    helpfulNum: {
        type: Number,
        default: 0
    },
    files: {
        type: Buffer,
    },
    fileType: {
        type: String,
    }
})

reviewSchema.virtual('reviewFilePath').get(function (){
    if (this.files != null && this.fileType != null){
        return `data:${this.fileType};charset=utf-8;base64,${this.files.toString('base64')}`
    }
})

// rating to text
reviewSchema.virtual('ratingText').get(function (){
    const ratingNum = Math.round(this.rating)
    const star = "⭐"
    return star.repeat(ratingNum)
})

module.exports = mongoose.model("Review", reviewSchema)
// module.exports.reviewFileBasePath = reviewFileBasePath