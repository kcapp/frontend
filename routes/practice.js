var debug = require('debug')('kcapp:practice');

var express = require('express');
var router = express.Router();

const template = require('marko');
var practiceTemplate = template.load(require.resolve('../src/pages/practice/practice-template.marko'));

var axios = require('axios');
var _ = require('underscore');

/* GET practice page. */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player/active`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/owetype`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
    ]).then(axios.spread((players, matchModes, oweTypes, matchTypes, venues, offices) => {
        res.marko(practiceTemplate, {
            players: _.sortBy(players.data, (player) => player.name),
            modes: matchModes.data,
            scores: [{ id: 0, name: 0, hidden: true }, { id: 301, name: 301 }, { id: 501, name: 501 }, { id: 701, name: 701 }],
            types: matchTypes.data,
            venues: venues.data,
            stakes: oweTypes.data,
            offices: offices.data
        });
    })).catch(error => {
        debug(`Error when getting data for / ${error}`);
        next(error);
    });
});

module.exports = router;
