const express = require('express')
const router = express.Router()
const Resto = require('../models/restaurants')

// authentication
router.get('/', ensureAuthenticated, async (req, res) => {
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

// add get
router.get('/add', ensureAuthenticated, async (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            res.render('admin/add', {
                req: req,
                searchOptions: req.query        
            })   
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
})

// add post
router.post('/add', ensureAuthenticated, async (req, res) => {
    const resto = new Resto({ name : req.body.restoName , info : req.body.info })
    if (req.body.info != '' && req.body.restoName != '') {
        saveFile(resto, req.body.restoImage)
        await resto.save()
        res.redirect('/admin')
    } 
})

// edit get
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    res.render('admin/edit', {
        req: req,
        searchOptions: req.query   ,
        resto: resto     
    })   
})

// edit post
router.post('/:id/edit', ensureAuthenticated, async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    if (req.body.info != '' && req.body.restoName != '') {
        resto.name = req.body.restoName
        resto.info = req.body.info

        if (req.body.restoImage && req.body.restoImage !== '') {
            saveFile(resto, req.body.restoImage)
        }

        await resto.save()
        res.redirect('/admin')
    } 
})

// delete get 
router.get('/:id/delete', ensureAuthenticated, async (req, res) => {
    const resto = await Resto.findById(req.params.id)
    res.render('admin/delete', {
        req: req,
        searchOptions: req.query   ,
        resto: resto     
    })   
})

// delete post
router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
    await Resto.findByIdAndDelete(req.params.id)
    console.log('deleted ' + req.params.id)
    res.redirect('/admin')
})

// filepond saveFile
// save the file
function saveFile(resto, fileEncoded){
    if (fileEncoded == null) {
        return console.log('error')
    } 
    const file = JSON.parse(fileEncoded)
    if (file != null) {
        resto.restoImage = new Buffer.from(file.data, 'base64')
        resto.fileType = file.type
        console.log('success in upload')
    }
}

// authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {    
        return next();
    }
    res.redirect('/');
}

module.exports = router