const mongoose = require("mongoose")
const path = require('path')

// image
const restoImageBasePath = 'uploads/restoImage'

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
        default: ""
    },
    info: {
        type: String,
        default: ""
    },
    ownerName: {
        type: String
    },
    rating: {
        type: Number
    },
    tags: {
        type: Array
    },
    file: {
        type: Buffer,
    },
    fileType: {
        type: String,
    }
})

// image path
restaurantSchema.virtual('restoImagePath').get(function (){
    if (this.image != null){
        return path.join('/', restoImageBasePath, this.image)
    }
})

// rating to text
restaurantSchema.virtual('ratingText').get(function (){
    const ratingNum = Math.round(this.rating)
    const star = "⭐"
    return star.repeat(ratingNum)
})

module.exports = mongoose.model("Restaurant", restaurantSchema)
module.exports.restoImageBasePath = restoImageBasePath