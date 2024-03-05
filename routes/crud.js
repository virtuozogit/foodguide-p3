const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('crud/index')
})


module.exports = router