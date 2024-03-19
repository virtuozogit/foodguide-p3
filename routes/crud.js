const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('crud/index', {
        req: req,
        searchOptions: req.query
    })
})


module.exports = router