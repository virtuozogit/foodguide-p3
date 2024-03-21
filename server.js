if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const app = express()
const ejs = require('ejs')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
var flash = require('connect-flash');

// Create routes
const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const restoRouter = require('./routes/resto')
const crudRouter = require('./routes/crud')
const crudRestoRouter = require('./routes/crudResto')
const adminRouter = require('./routes/admin')

// session
const session = require('express-session')

// the set up passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(session({
  secret: 'your-secret-key', // Change this to a secure random key
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/users');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('error', error => console.log('Connected to Mongoose'))

app.use(flash());

// Use Routes
app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/resto', restoRouter)
app.use('/crud', crudRouter)
app.use('/crud/resto', crudRestoRouter)
app.use('/admin', adminRouter)

run()


app.listen(process.env.PORT || 3000)

async function run() {
  // restart system
  const Login = require(__dirname + '/models/logins.js')
  const login = await Login.findOne({})
  login.pageNum = 0
  await login.save()
}