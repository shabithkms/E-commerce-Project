var createError = require('http-errors')
var express = require('express')
var path = require('path')
require('dotenv').config()
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var hbs = require('express-handlebars')
var session = require('express-session')
var fileUpload = require('express-fileupload')
const flash = require('connect-flash/lib/flash')
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = process.env.serviceSID
//Twilio connection
const client = require('twilio')(accountSID, authToken)
//Mongo session
const MongoStore = require('connect-mongo')
const { default: mongoose } = require('mongoose')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine(
    'hbs',
    hbs({
        extname: 'hbs',
        defaultLayout: 'layout',
        layoutsDir: __dirname + '/views/layout/',
        partialsDir: __dirname + '/views/partials/',
    })
)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//session
app.use(
    session({
        secret: process.env.APP_KEY,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.DB_CONNECTION,
            ttl: 2 * 24 * 60 * 60,
            autoRemove: 'native',
        }),
    })
)
app.use(flash())

// DB Connection
let dbSuccess = 'Fail'
mongoose
    .connect(process.env.DB_CONNECTION, {
        dbName: `${process.env.DB_NAME}`,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        dbSuccess = 'Success'
        console.log('DB Connected')
    })

var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:')) //TODO::Send slack notification

app.get('/health', async (req, res) => {
    const appKey =
        process.env.APP_KEY === undefined ? 'APP Key is missing!!!' : 'OK'

    res.status(200).json({
        'DB Connected': dbSuccess,
        Health: 'OK',
        'App Key': appKey,
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
})

// BEGIN:: API Route Groups
const adminRoutes = require('./routes/admin/admin.routes')
const userRoutes = require('./routes/user/user.routes')
// END:: API Route Groups

app.use(fileUpload())
//Route setting
app.use('/', userRoutes)
app.use('/admin', adminRoutes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    if (req.app.get('env') === 'development') {
        console.log(err.message)
    }
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    // res.status(err.status || 500)
    // res.render('error')
    res.status(err.status || 500)
    res.render(`error-${err.status || 500}`)
})

module.exports = app
