var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var session = require('express-session')
var fileUpload = require('express-fileupload')
const serviceSID = "VA4f6cca5d15fccc194e8862a54bbcf116"
const accountSID = "ACef72f523eca7c62a1505e6aca1fcaa1a"
const authToken = "febc47a5cba24670884f237d84c0ab24"
const client = require('twilio')(accountSID,authToken)
require('dotenv').config() 

var db = require('./config/connection')
db.connect((err) => {
  if (err)
    console.log("Connection error" + err);
  else
    console.log("Database connected");
})

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "Key", cookie: { maxAge: 1000000 } }))
app.use(fileUpload())

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
