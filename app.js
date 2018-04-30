var debug = require('debug')('kcapp:app');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var rfs = require('rotating-file-stream')

var app = express();

// Make sure we get correct user IP when running behind a reverse proxy
app.enable('trust proxy');

var socket_io = require("socket.io");
var io = socket_io();
app.io = io;

// Set application variables
app.locals.kcapp = {};
app.locals.kcapp.api = 'http://localhost:8001';

// Create all routes
var socketHandler = require('./routes/lib/socketio_handler')(io, app);
var games = require('./routes/games')(socketHandler);
var index = require('./routes/index');
var legs = require('./routes/legs')(app, socketHandler);
var owes = require('./routes/owes');
var players = require('./routes/players');
var statistics = require('./routes/statistics');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.moment = require('moment');

// Write access log to a daily rotated file in /log
var logDirectory = path.join(__dirname, 'log')
var accessLogStream = rfs('access.log', { interval: '1d', path: logDirectory });
app.use(logger('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/games', games);
app.use('/legs', legs);
app.use('/owes', owes);
app.use('/players', players);
app.use('/statistics', statistics);

// Not Found (404) Handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (err.status == 404) {
        // respond with html page
        if (req.accepts('html')) {
            res.render('404', { url: req.url });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    } else {
        if (err.response !== undefined) {
            debug("Axios error message: " + err.response.data.trim());
        }
        res.render('error');
    }
});

module.exports = app;