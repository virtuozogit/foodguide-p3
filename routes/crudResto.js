const express = require('express')
const router = express.Router()
const Restaurant = require("../models/restaurants")

// multer
const path = require('path')
const uploadPath = path.join('public', Restaurant.restoImageBasePath)
const multer = require("multer")
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// Render the EJS template with items data
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const items = await Restaurant.find()
    res.render('crud/resto', {
      items: items,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// Update to add image into the base
router.post('/', upload.single('restoImage'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  let idlist = req.body.idlist  
  const resto = await Restaurant.findById(idlist)

  console.log(fileName)

  try {
    resto.image = fileName
    resto.save()
    res.redirect('/crud')
  } catch {
    console.log("Error in upload")
    res.redirect('/crud/resto')
  }
})

module.exports = router