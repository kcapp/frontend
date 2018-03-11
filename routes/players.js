var debug = require('debug')('kcapp:players');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Get a list of all players */
router.get('/', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var players = response.data;
            players = _.sortBy(players, (player) => player.name)
            res.render('players', { players: players });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

/* Add a new player */
router.post('/', function (req, res, next) {
    axios.post(req.app.locals.kcapp.api + '/player', req.body)
        .then(() => {
            res.redirect('/players');
        }).catch(error => {
            debug('Error when adding new player: ' + error);
            next(error);
        });
});

/* Get specific statistics for a given player */
router.get('/:id/statistics', function (req, res, next) {
    var playerId = req.params.id;
    axios.get(req.app.locals.kcapp.api + '/player/' + playerId)
        .then(response => {
            var player = response.data;
            axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/statistics')
                .then(response => {
                    var statistics = response.data;
                    axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/progression')
                    .then(response => {
                        var progression = response.data;
                        res.render('player', { player: player, statistics: statistics, progression: progression });
                    }).catch(error => {
                        debug('Error when getting player progression: ' + error);
                        next(error);
                    });
                }).catch(error => {
                    debug('Error when getting player statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting player: ' + error);
            next(error);
        });
});

/* Get comparable statistics for the given players */
router.get('/compare', function (req, res, next) {
    var playerIds = req.query.player_id;
    debug('Comparing players %s', playerIds);

    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var players = response.data;
            axios.get(req.app.locals.kcapp.api + '/player/compare?id=' + playerIds.join("&id="))
                .then(response => {
                    var statistics = response.data;
                    res.render('players_comparison', { players: players, statistics: statistics });
                }).catch(error => {
                    debug('Error when comparing players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});


/* Get a progression for a given player */
router.get('/:id/progression', function (req, res, next) {
    var playerId = req.params.id;
    axios.get(req.app.locals.kcapp.api + '/player/' + playerId)
        .then(response => {
            var player = response.data;
            axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/progression')
                .then(response => {
                    var progression = response.data;
                    res.render('player_progression', { player: player, progression: progression });
                }).catch(error => {
                    debug('Error when getting player progression: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting player: ' + error);
            next(error);
        });
});

module.exports = router