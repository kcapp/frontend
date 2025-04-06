const debug = require('debug')('kcapp:index');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');
const versionInfo = require('../version.json');

const template = require('marko');
const indexTemplate = template.load(require.resolve('../src/pages/index/index-template.marko'));
const indexControllerTemplate = template.load(require.resolve('../src/pages/index-controller/index-controller-template.marko'));
const screensaverTemplate = template.load(require.resolve('../src/pages/screensaver/screensaver-template.marko'));
const aboutTemplate = template.load(require.resolve('../src/pages/about/about.marko'));

/* GET home page. */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/owetype`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/match/outshot`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/preset`),
        axios.get(`${req.app.locals.kcapp.api}/option/default`),
    ]).then(axios.spread((players, matchModes, oweTypes, matchTypes, outshots, venues, offices, presets, defaults) => {
        res.marko(indexTemplate, {
            players: _.sortBy(players.data, (player) => player.name),
            modes: matchModes.data,
            scores: [{ id: 0, name: 0, hidden: true }, { id: 301, name: 301 }, { id: 501, name: 501 }, { id: 701, name: 701 }],
            types: matchTypes.data,
            outshots: outshots.data,
            lives: [{ id: 1, name: 1 }, { id: 3, name: 3 }, { id: 5, name: 5 }, { id: 7, name: 7 }, { id: 10, name: 10 }],
            points_to_win: [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }, { id: 4, name: 4 }, { id: 5, name: 5 }],
            max_rounds_170: [{ id: -1, name: '-' }, { id: 3, name: 3 }, { id: 5, name: 5 }, { id: 7, name: 7 }, { id: 10, name: 10 }, { id: 15, name: 15 }],
            max_rounds_x01: [{ id: -1, name: '-' }, { id: 10, name: 10 }, { id: 12, name: 12 }, { id: 16, name: 16 }, { id: 20, name: 20 }, { id: 30, name: 30 }],
            venues: venues.data,
            stakes: oweTypes.data,
            offices: offices.data,
            presets: presets.data,
            defaults: defaults.data,
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
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/preset`),
    ]).then(axios.spread((players, matchModes, matchTypes, outshots, venues, offices, presets) => {
        res.marko(indexControllerTemplate, {
            players: players.data,
            modes: matchModes.data,
            scores: [{ id: 0, name: 0, hidden: true }, { id: 301, name: 301 }, { id: 501, name: 501 }, { id: 701, name: 701 }],
            types: matchTypes.data,
            outshots: outshots.data,
            lives: [{ id: 1, name: 1 }, { id: 3, name: 3 }, { id: 5, name: 5 }, { id: 7, name: 7 }, { id: 10, name: 10 }],
            points_to_win: [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }, { id: 4, name: 4 }, { id: 5, name: 5 }],
            max_rounds: [{ id: -1, name: 'Unlimited' }, { id: 5, name: 5 }, { id: 10, name: 10 }, { id: 15, name: 15 }, { id: 20, name: 20 }, { id: 30, name: 30 }],
            venues: venues.data,
            offices: offices.data,
            presets: presets.data,
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

router.get('/about', (req, res) => {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/version`),
    ]).then(axios.spread((api) => {
        res.marko(aboutTemplate, {
            frontend: versionInfo,
            api: api.data,
            locals: req.app.locals
        });
    }));
});

module.exports = router;
