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
            res.render('player/players', { players: players });
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
                            axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/checkouts')
                                .then(response => {
                                    var checkouts = response.data;
                                    res.render('player/player', {
                                        player: player, statistics: statistics,
                                        progression: progression, checkouts: checkouts
                                    });
                                }).catch(error => {
                                    debug('Error when getting player checkouts: ' + error);
                                    next(error);
                                });
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
    if (!Array.isArray(playerIds)) {
        playerIds = [playerIds]
    }
    debug('Comparing players %s', playerIds);

    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var players = response.data;
            axios.get(req.app.locals.kcapp.api + '/player/compare?id=' + playerIds.join("&id="))
                .then(response => {
                    var statistics = response.data;
                    res.render('player/players_comparison', { players: players, statistics: statistics });
                }).catch(error => {
                    debug('Error when comparing players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

/* Get head to head statistics between two players */
router.get('/:player1/vs/:player2', function (req, res, next) {
    var player1 = req.params.player1;
    var player2 = req.params.player2;

    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var players = response.data;
            axios.get(req.app.locals.kcapp.api + '/player/' + player1 + '/vs/' + player2)
                .then(response => {
                    var head2head = response.data;
                    head2head.player_visits[player1] = _.sortBy(head2head.player_visits[player1], function (visit) { return -visit.count; })
                    head2head.player_visits[player2] = _.sortBy(head2head.player_visits[player2], function (visit) { return -visit.count; })

                    head2head.player_checkouts[player1] = _.sortBy(head2head.player_checkouts[player1], function (checkout) { return -checkout.count; })
                    head2head.player_checkouts[player2] = _.sortBy(head2head.player_checkouts[player2], function (checkout) { return -checkout.count; })

                    res.render('player/head_to_head', { player1: players[player1], player2: players[player2], head2head: head2head });
                }).catch(error => {
                    debug('Error when getting head to head statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

module.exports = router