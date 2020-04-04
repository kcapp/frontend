var debug = require('debug')('kcapp:app');

require('marko/node-require').install();
require('marko/express'); //enable res.marko

var express = require('express');

var isProduction = process.env.NODE_ENV === 'production';

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require('lasso').configure({
    plugins: [
        'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
        'lasso-less'
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var rfs = require('rotating-file-stream')

var app = express();

app.use(require('lasso/middleware').serveStatic());

// Make sure we get correct user IP when running behind a reverse proxy
app.enable('trust proxy');

var socket_io = require("socket.io");
var io = socket_io();
app.io = io;

// Set application variables
app.locals.kcapp = {};
app.locals.kcapp.api = process.env.KCAPP_API || 'http://localhost:8001';
app.locals.kcapp.api_external = process.env.KCAPP_API || app.locals.kcapp.api;

// Create all routes
var socketHandler = require('./routes/lib/socketio_handler')(io, app);
var matches = require('./routes/matches')(socketHandler);
var index = require('./routes/index');
var legs = require('./routes/legs')(app, socketHandler);
var offices = require('./routes/offices');
var owes = require('./routes/owes');
var players = require('./routes/players');
var practice = require('./routes/practice');
var statistics = require('./routes/statistics');
var tournaments = require('./routes/tournaments');
var elo = require('./routes/elo');
var venues = require('./routes/venues')(app, socketHandler);
socketHandler.addNamespace('/active');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.moment = require('moment');
app.locals._ = require('underscore');

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
app.use('/matches', matches);
app.use('/legs', legs);
app.use('/offices/', offices);
app.use('/owes', owes);
app.use('/players', players);
app.use('/practice', practice);
app.use('/statistics', statistics);
app.use('/tournaments', tournaments);
app.use('/elo', elo);
app.use('/venues', venues);

// Not Found (404) Handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
var notFoundTemplate = require('./src/pages/404/404.marko');
var errorTemplate = require('./src/pages/error/error.marko');
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (err.status == 404) {
        // respond with html page
        if (req.accepts('html')) {
            res.marko(notFoundTemplate, { url: req.url });
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
        res.marko(errorTemplate, { error: err });
    }
});

module.exports = app;