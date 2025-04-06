require("@marko/compiler/register");

var debug = require('debug')('kcapp:app');
var compression = require('compression');

var express = require('express');

var isProduction = process.env.NODE_ENV === 'production';

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
var lasso = require('lasso');
lasso.configure({
    plugins: [
        'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
        'lasso-less'
    ],
    outputDir: `${__dirname}/static`, // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
    cacheProfile: process.env.DISK_CACHE && isProduction ? 'production' : null // Cache to disk
});

var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');

var app = express();

var marko = require("@marko/express").default;
app.use(marko());

app.use(compression());
app.use(require('lasso/middleware').serveStatic());

// Make sure we get correct user IP when running behind a reverse proxy
app.enable('trust proxy');

var socketIo = require("socket.io");
var io = socketIo();
app.io = io;

// Set application variables
app.locals.kcapp = {};
app.locals.kcapp.api = process.env.KCAPP_API || 'http://localhost:8001';
app.locals.kcapp.api_path = process.env.KCAPP_API_PATH || ':8001';
app.locals.kcapp.local_admin = process.env.KCAPP_LOCAL_ADMIN ? process.env.KCAPP_LOCAL_ADMIN === "true" : true;
app.locals.serializedGlobals = { kcapp: true };

// Create all routes
const socketHandler = require('./routes/lib/socketio_handler')(io, app);
const matches = require('./routes/matches')(socketHandler);
const index = require('./routes/index');
const legs = require('./routes/legs')(app, socketHandler);
const offices = require('./routes/offices');
const owes = require('./routes/owes');
const players = require('./routes/players');
const practice = require('./routes/practice');
const presets = require('./routes/presets');
const statistics = require('./routes/statistics');
const tournaments = require('./routes/tournaments');
const elo = require('./routes/elo');
const venues = require('./routes/venues')(app, socketHandler);
const badges = require('./routes/badges');
socketHandler.setupActiveNamespace();

// Write access log to a daily rotated file in /log
const pad = num => (num > 9 ? "" : "0") + num;
const generator = (time, index) => {
  if (!time) {
    return "access.log";
  }
  const date = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}-${index}`;
  return `access.${date}.log.gz`;
};

var logger = require('morgan');
var rfs = require('rotating-file-stream')
const accessLogStream = rfs.createStream(generator, {
    interval: "1d",
    compress: true,
    path: path.join(__dirname, 'log')
});
app.use(logger('combined', { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.use('/presets', presets);
app.use('/statistics', statistics);
app.use('/tournaments', tournaments);
app.use('/elo', elo);
app.use('/venues', venues);
app.use('/badges', badges);

// Not Found (404) Handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
const template = require('marko');
const notFoundTemplate = template.load(require.resolve('./src/pages/404/404.marko'));
const errorTemplate = template.load(require.resolve('./src/pages/404/404.marko'));

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (err.status == 404 || (err.response && err.response.status == 404)) {
        // respond with html page
        if (req.accepts('html')) {
            res.marko(notFoundTemplate, {
                url: req.url
            });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({
                error: 'Not found'
            });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    } else {
        if (err.response !== undefined) {
            debug(`Axios error message: ${err.response.data.trim()}`);
        } else if (err.stack !== undefined) {
            debug(err.stack);
        }
        res.marko(errorTemplate, {
            error: err
        });
    }
});

module.exports = app;
