// modules =================================================
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const expressSession = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const scribe = require('scribe-js')()
const cookieParser = require('cookie-parser')
const compression = require('compression')

const console = process.console
const app = express()

// config files
const config = require('./config')

const port = process.env.PORT || 4000 // set our port
mongoose.connect(config.db) // connect to our mongoDB database //TODO: !AA: Secure the DB with authentication keys

app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' })) // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })) // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })) // parse application/x-www-form-urlencoded
app.use(morgan('dev')) // use morgan to log requests to the console
app.use(methodOverride('X-HTTP-Method-Override')) // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
// app.use(express.static(path.resolve(__dirname, 'public'))) // set the static files location /public/img will be /img for users
app.use(compression({ threshold: 0 }))
app.use(express.static(path.join(__dirname, '../public')))

// Passport configuration
app.use(expressSession({ secret: config.secret }))
app.use(passport.initialize())
app.use(passport.session())

app.use(scribe.express.logger())

app.use(flash()) // Using the flash middleware provided by connect-flash to store messages in session

// configuration ===========================================
const initPassport = require('./controllers/passport/init')
// Initialize Passport
initPassport(passport)

app.use('/logs', scribe.webPanel())

// routes ==================================================
require('./router/index.js')(app, passport) // pass our application into our routes

// start autoupdate bot ====================================
require('./bots/autoupdate/init');
// start app ===============================================
app.listen(port)
console.log(`Magic happens on port ${port}`)       // shoutout to the user
exports = module.exports = app             // expose app
