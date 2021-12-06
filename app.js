var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql');
var connection = require('./lib/db');

var indexRouter = require('./routes/index');
var inmatesRouter = require('./routes/inmates');
var accountsRouter = require('./routes/accounts');
var keywordsRouter = require('./routes/keywords');
var paymentRouter = require('./routes/payment');

var app = express();
// var paypal = require('paypal-rest-sdk');

// paypal.configure({
//     'mode': 'sandbox',
//     'client_id': 'AVrTY9IbOorMiALM0KXOlNd9TN6T5RyZjowCqRu9yQ92cWZxDRt_kYXX-FpXs-W5ACPn7lRaGY4nc37Z',
//     'client_secret': 'ENEa0ol2_LjtwO44aio95TXf8H5ys2TbXcHFRKHHaEnOMIXk5Wt6QQDkZtNI4ywPtxGxCQhYbf8ANU6j'
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    cookie: { maxAge: 60000 },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}))

app.use(flash());

app.use('/', indexRouter);
app.use('/inmates', inmatesRouter);
app.use('/accounts', accountsRouter);
app.use('/keywords', keywordsRouter);
app.use('/payment', paymentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;