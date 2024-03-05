const express = require('express')
const router = express.Router()
const User = require('../models/users')
const Login = require('../models/logins')
const Review = require('../models/reviews')
const Resto = require('../models/restaurants')

router.get('/', (req, res) => {
    res.send('user link')
})

router.get('/:username', async (req, res) => {
    const login = await Login.findOne({})
    const review = await Review.find({username: req.params.username})
    const resto = await Resto.find({})
    try {
        const user = await User.findOne({username: req.params.username})
        if (user == null) {
            res.redirect('/')
        } else {
            res.render('profile/profile', {
                login: login,
                user: user,
                reviews: review,
                searchOptions: req.query,
                resto: resto
            })
        }
    } catch {

    }
})

module.exports = router