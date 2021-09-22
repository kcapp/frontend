var debug = require('debug')('kcapp:index');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');

const template = require('marko');
const indexTemplate = template.load(require.resolve('../src/pages/index/index-template.marko'));
const indexControllerTemplate = template.load(require.resolve('../src/pages/index-controller/index-controller-template.marko'));
const screensaverTemplate = template.load(require.resolve('../src/pages/screensaver/screensaver-template.marko'));

/* GET home page. */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player/active`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/owetype`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/match/outshot`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
    ]).then(axios.spread((players, matchModes, oweTypes, matchTypes, outshots, venues, offices) => {
        res.marko(indexTemplate, {
            players: _.sortBy(players.data, (player) => player.name),
            modes: matchModes.data,
            scores: [{ id: 0, name: 0, hidden: true }, { id: 301, name: 301 }, { id: 501, name: 501 }, { id: 701, name: 701 }],
            types: matchTypes.data,
            outshots: outshots.data,
            venues: venues.data,
            stakes: oweTypes.data,
            offices: offices.data
        });
    })).catch(error => {
        debug(`Error when getting data for / ${error}`);
        next(error);
    });
});

/* GET home page. */
router.get('/controller', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/match/outshot`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/office`)
    ]).then(axios.spread((players, matchModes, matchTypes, outshots, venues, offices) => {
        res.marko(indexControllerTemplate, {
            players: players.data,
            modes: matchModes.data,
            scores: [{ id: 0, name: 0, hidden: true }, { id: 301, name: 301 }, { id: 501, name: 501 }, { id: 701, name: 701 }],
            types: matchTypes.data,
            outshots: outshots.data,
            venues: venues.data,
            offices: offices.data,
            locals: req.app.locals
        });
    })).catch(error => {
        debug(`Error when getting data for / ${error}`);
        next(error);
    });
});

router.get('/screensaver', function (req, res, next) {
    res.marko(screensaverTemplate, {});
});

module.exports = router;
