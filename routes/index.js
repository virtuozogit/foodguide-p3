const express = require('express')
const router = express.Router()
var passport = require('passport');

// Models
const Restaurant = require('../models/restaurants')
const User = require('../models/users')
const Login = require('../models/logins')
const Review = require('../models/reviews')

// multer
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// session
const session = require('express-session');

router.use(session({
    secret: process.env.SECRET, // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
}));

async function updateRestos() {
    // Update the ratings
    const restos = await Restaurant.find()
    restos.forEach(async resto => {
        let reviews = await Review.find({restoId: resto._id})
        try {
            let sum = 0
            reviews.forEach(async review => {
                sum += review.rating
            })
            let updatedRating = sum / ((reviews.length > 0) ? reviews.length : 1)
            console.log(resto.name + ' ' + updatedRating)
            resto.rating = updatedRating
            await resto.save()
        } catch {
            console.log('error in updating')
        }
    })
}

router.get('/', async (req, res) => {
    await updateRestos()
    const page = req.query.page || 1;
    const pageSize = 3;
    const skipValue = (page - 1) * pageSize
    const log = await Login.findOne({})

    req.session.pageNum = page

    console.log(req.session)
    console.log(`Current route: ${req.path}`);
    log.currentRoute = req.path
    await log.save()

    // search functions
    let query = Restaurant.find()
    let queryNum = 0
    if (req.query.searchTags != null && req.query.ratingFilter != null) {
        query = Restaurant.find({tags: { 
            $regex: new RegExp(req.query.searchTags, 'i') 
        }, 
            rating: { $gte: Number(req.query.ratingFilter)} 
        })
        log.pageNum = 0
        await log.save()
        req.session.query = req.query.searchTags
        req.session.rating = req.query.ratingFilter    
    } else if (req.session.query != '' && req.session.query != null) {
        query = Restaurant.find({tags: { 
            $regex: new RegExp(req.session.query, 'i') 
        }, 
            rating: { $gte: Number(req.session.rating)} 
        })
    }

    try {
        const login = await Login.findOne({})
        queryNum = await Restaurant.countDocuments(query)
        const items = await query.sort({rating: -1}).skip(login.pageNum * 3).limit(3).exec()      
        
        let numItems = queryNum
        console.log('Num of items:' + numItems)
        res.render('index', {
            items: items,
            searchOptions: req.query,
            login: login,
            pageNum: login.pageNum,
            req: req,
            queryLength: numItems
        })
        console.log('login: ' + login.username)
        console.log(req.query)
        log.currentRoute = '';
        await log.save()
        console.log(`new Logins route: ${req.path}`);
    } catch {
        console.log('error')
    }
})

// next
router.get('/next', async (req, res) => {
    const login = await Login.findOne({})
    if (login.pageNum > -1) {
        login.pageNum++
        await login.save()
    }
    res.redirect('/')
})

// prev
router.get('/prev', async (req, res) => {
    const login = await Login.findOne({})
    if (login.pageNum > 0) {
        login.pageNum--
        await login.save()
    }
    res.redirect('/')
})


// login render
router.get('/login',  async (req, res) => {
    const login = await Login.findOne({})
    res.render('login/login', {
        error: '',
        login: login,
        searchOptions: req.query,
        req: req
    })
})

// login system
// router.post('/login', async (req, res) => {  
//     const username = req.body.username
//     const password = req.body.password
//     const remember = req.body.remember
    
//     const user = await User.findOne({username: username, password: password})
//     const logins = await Login.findOne({})
//     if (user == null){
//         const error = "Wrong input"
//         res.render('login/login', {
//             error: 'Wrong input'
//         })
//     } else {
//         logins.username = username
//         logins.logged = true
//         logins.remember = Boolean(req.body.remember)
//         logins.save()
        
//         res.redirect('/')
//     }
// })
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

// register
router.get('/register',  async (req, res) => {
    const login = await Login.findOne({})
    res.render('login/register', {
        error: '',
        login: login,
        searchOptions: req.query,
        req: req
    })
})

// Register user / create user
// router.post('/register', async (req, res) => {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password,
//         bio: req.body.bio
//     })
    
//     try {
//         const logins = await Login.findOne({})
//         saveFile(user, req.body.userImage)
//         logins.username = user.username
//         logins.logged = true
//         const newUser = await user.save()
//         res.redirect(`/user/${user.username}`)
      
//     } catch {
//       console.log("Error in upload")
//       res.render('login/register', {
//         error: 'Wrong input',
//         login: login
//       })
//     }
// })

router.post('/register', function(req, res) {
    const user = new User({ username : req.body.username , bio : req.body.bio })
    User.register(user, req.body.password, function(err, account) {
        if (err) {
            console.log(err)
            res.render('login/register', {
                error: 'Error in register',
                searchOptions: req.query,
                req: req
            })
        }

        passport.authenticate('local')(req, res, async function () {
            saveFile(user, req.body.userImage)
            await user.save()
            res.redirect(`/user/${req.user.username}`);
        });
    });
});

// logout?
router.get('/logout',  async (req, res) => {
    const logins = await Login.findOne({})
    logins.username = null
    logins.logged = false
    logins.remember = false
    logins.save()
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

// settings 
router.get('/setting', ensureAuthenticated,  async (req, res) => {
    try {
        const login = await Login.findOne({})
        const user = await User.findOne({username: login.username})
        res.render('setting', {
            login: login,
            searchOptions: req.query,
            req: req
        })
    } catch {
        res.redirect('/')
    }
})

// post settings
router.post('/setting', ensureAuthenticated,  async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username})

        if (req.body.userImage && req.body.userImage !== '') {
            saveFile(user, req.body.userImage)
        }
        
        if (req.body.bio != null && req.body.bio != '') {
            user.bio = req.body.bio
        }
        
        await user.save()
        res.redirect('/')
    } catch {
        console.log('error in upload')
        res.redirect('/')
    }
})

// about page
router.get('/about',  async (req, res) => {
    res.render('about', {
        searchOptions: req.query,
        req: req
    })
})

// save the file
function saveFile(user, fileEncoded){
    if (fileEncoded == null) {
        return console.log('error')
    } 
    const file = JSON.parse(fileEncoded)
    if (file != null) {
        user.image = new Buffer.from(file.data, 'base64')
        user.fileType = file.type
        console.log('success in upload')
    }
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {    
        return next();
    }
    res.redirect('/');
}

module.exports = router