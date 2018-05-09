var debug = require('debug')('kcapp:index');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* GET home page. */
router.get('/', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player/active')
        .then(response => {
            var players = response.data
            players = _.sortBy(players, (player) => player.name);
            axios.get(req.app.locals.kcapp.api + '/match/modes')
                .then(response => {
                    var matchModes = response.data;
                    axios.get(req.app.locals.kcapp.api + '/owetype')
                        .then(response => {
                            var oweTypes = response.data;
                            axios.get(req.app.locals.kcapp.api + '/match/types')
                                .then(response => {
                                    var matchTypes = response.data;
                                    axios.get(req.app.locals.kcapp.api + '/venue')
                                        .then(response => {
                                            var venues = response.data;
                                            res.render('index', {
                                                players: players, match_modes: matchModes,
                                                match_types: matchTypes, owe_types: oweTypes, venues: venues
                                            });
                                        }).catch(error => {
                                            debug('Error when getting venues: ' + error);
                                            next(error);
                                        });
                                }).catch(error => {
                                    debug('Error when getting owe types: ' + error);
                                    next(error);
                                });
                        }).catch(error => {
                            debug('Error when getting owe types: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting match modes: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting leg players: ' + error);
            next(error);
        });
});

module.exports = router;