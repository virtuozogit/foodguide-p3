const express = require('express')
const router = express.Router()
const Resto = require('../models/restaurants')


// authentication
router.get('/', async (req, res) => {
    const restos = await Resto.find()
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            res.render('admin/index', {
                req: req,
                searchOptions: req.query,
                restos: restos
            })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
})

module.exports = router