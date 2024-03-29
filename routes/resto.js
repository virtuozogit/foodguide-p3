const express = require('express')
const router = express.Router()
const Resto = require('../models/restaurants')
const Login = require('../models/logins')
const Review = require('../models/reviews')

const fileMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg']

router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:id', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const reviews = await Review.find({restoId: req.params.id}).sort({helpfulNum: -1}).limit(3)
    const login = await Login.findOne({})
    res.render('resto/resto', {
        login: login,
        resto: resto,
        reviews: reviews,
        searchOptions: req.query,
        req: req
    })
})

router.get('/:id/create', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})
    
    if (review == null) {
        res.render('resto/create', {
            resto: resto,
            review: review,
            searchOptions: req.query,
            req: req
        })
    } else {
        res.redirect(`/resto/${req.params.id}/edit`)
    }
    
})

// submit / create the review
router.post('/:id/create', async (req, res) => {
    const login = await Login.findOne({})
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})
    const resto = await Resto.findOne({_id: req.params.id})
    const rating = Number(req.body.rating)
    
    try {
        if (review == null) {
            const newReview = new Review({
                username: req.user.username,
                rating: rating,
                info: req.body.info,
                restoId: req.params.id,
                restoName: resto.name,
                ownerName: resto.ownerName,
                createdAt: Date.now()
            })
            
            console.log(req.params.id)
            saveFile(newReview, req.body.reviewFile)
            console.log(req.body.reviewFile)

            await newReview.save()
        } else {
            res.redirect(`/resto/${req.params.id}/edit`)
        }   
        res.redirect(`/resto/${req.params.id}`)     
    } catch {
        console.log('error in upload')
        res.redirect(`/resto/${req.params.id}/create`)
    }

})

// edit
router.get('/:id/edit', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const login = await Login.findOne({})
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})
    
    res.render('resto/edit', {
        login: login,
        resto: resto,
        review: review,
        searchOptions: req.query,
        req: req
    })
    
})

router.post('/:id/edit', async (req, res) => {
    const login = await Login.findOne({})
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})
    const resto = await Resto.findOne({_id: req.params.id})
    const rating = Number(req.body.rating)
    
    try {
        if (req.body.info != '' && req.body.rating !== '') {
            review.rating = req.body.rating
            review.info = req.body.info

            if (req.body.reviewFile && req.body.reviewFile != '') {
                saveFile(review, req.body.reviewFile)
            }

            await review.save()  
        } 
        
        res.redirect(`/resto/${req.params.id}`)     
    } catch {
        console.log('error in upload')
        res.redirect(`/resto/${req.params.id}/edit`)
    }

})

// delete get
router.get('/:id/delete', async (req, res) => {
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})
    res.render('resto/delete', {
        req: req,
        searchOptions: req.query,
        review: review     
    })   
})


// delete 
router.post('/:id/delete', async (req, res) => {
    const review = await Review.findOne({username: req.user.username, restoId: req.params.id})

    try {
        if (review == null) {
            res.redirect(`/resto/${req.params.id}/create`)
        } else {
            await Review.deleteOne({_id: review._id})
        }   
        res.redirect(`/resto/${req.params.id}`)     
    } catch {
        console.log('error in delete')
        res.redirect(`/resto/${req.params.id}/create`)
    }
})

// add helpful into thing
router.post('/:id/:reviewId/add-help', async (req, res) => {
    const login = await Login.findOne({})
    const review = await Review.findById(req.params.reviewId)

    try {
        if (req.isAuthenticated()) {
            if (review.helpfulUsers.includes(req.user.username)) {
                let array = review.helpfulUsers
                let valueToRemove = req.user.username;

                array = array.filter(item => item !== valueToRemove);
                review.helpfulUsers = array
                review.helpfulNum = array.length
                await review.save()
                console.log('removed')
                res.redirect(`/resto/${req.params.id}`)  
            } else {
                review.helpfulNum++
                review.helpfulUsers.push(req.user.username)
                await review.save()
                console.log('added')
                res.redirect(`/resto/${req.params.id}`)   
            }
        } else {
            console.log('failed')
            res.redirect(`/resto/${req.params.id}`)   
        }
    } catch {
        console.log('error in adding helpful')
        res.redirect(`/resto/${req.params.id}`)
    }
})

// search review
router.get('/:id/search', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const login = Login.findOne({})

    let query = Review.find({restoId: req.params.id})
    if (req.query.searchReview != null && req.query.searchReview != '') {
        query = query.find({
            info: { 
            $regex: new RegExp(req.query.searchReview, 'i') 
        }}) 
    } 

    try {
        const login = await Login.findOne({})
        const items = await query.exec()
        res.render('resto/search', {
            items: items,
            searchOptions: req.query,
            login: login,
            pageNum: login.pageNum,
            resto: resto,
            reviews: items,
            req: req
        })
        console.log('login: ' + login.username)
    } catch {
        console.log('error')
        res.redirect(`/user/${req.params.id}`)
    }
})

// show owner response
router.get('/:id/respond/:reviewId', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const login = await Login.findOne({})
    const review = await Review.findById(req.params.reviewId)

    try {
        const login = await Login.findOne({})
        res.render('resto/owner-create', {
            searchOptions: req.query,
            login: login,
            pageNum: login.pageNum,
            resto: resto,
            reviews: review,
            review: review,
            req: req
        })
        console.log('rendered')
    } catch {
        console.log('error')
        res.redirect(`/user/${req.params.id}`)
    }
})

router.post('/:id/respond/:reviewId', async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    const login = Login.findOne({})
    const review = await Review.findById(req.params.reviewId)

    try {
        const login = await Login.findOne({})
        if (req.body.info != '' && req.body.info != null && req.user.username == review.ownerName){
            console.log(req.body.info)
            review.ownerInfo = req.body.info
            await review.save()
            console.log('success')
        }
        res.redirect(`/resto/${req.params.id}`)
    } catch {
        console.log('error')
        res.redirect(`/resto/${req.params.id}`)
    }
})

// save the file
function saveFile(review, fileEncoded){
    if (fileEncoded == null) {
        return console.log('error')
    } 
    console.log('error')
    const file = JSON.parse(fileEncoded)
    if (file != null) {
        review.files = new Buffer.from(file.data, 'base64')
        review.fileType = file.type
        console.log('success in upload')
    }
}


module.exports = router