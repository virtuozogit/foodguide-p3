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
    },
    helpfulUsers: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: null
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

// number of helpful plus users
reviewSchema.virtual('numHelpful').get(function (){
    const length = this.helpfulUsers.length
    return length
})

// get date for createdAt
reviewSchema.virtual('createdAtString').get(function (){
    // Create a new Date object using the current date and time in milliseconds
    const currentDate = this.createdAt

    // Get the individual components of the date
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    // Construct the formatted date and time string
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate
})

reviewSchema.virtual('formatDate').get(function() {
    if (this.createdAt) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return this.createdAt.toLocaleString('en-US', options);
    }
    return ''; 
});

module.exports = mongoose.model("Review", reviewSchema)
// module.exports.reviewFileBasePath = reviewFileBasePath