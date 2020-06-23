var debug = require('debug')('kcapp:players');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

var playerTemplate = require('../src/pages/player/player-template.marko');
var playersTemplate = require('../src/pages/players/players-template.marko');
var playerComparisonTemplate = require('../src/pages/player-comparison/player-comparison-template.marko');
var head2headTemplate = require('../src/pages/player-head2head/player-head2head-template.marko');

/* Get a list of all players */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player/active'),
        axios.get(req.app.locals.kcapp.api + '/office')
    ]).then(axios.spread((playersResponse, officesResponse) => {
        var players = playersResponse.data;
        players = _.sortBy(players, (player) => player.name)
        res.marko(playersTemplate, { players: players, offices: officesResponse.data });
    })).catch(error => {
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

/* Edit player */
router.put('/:id', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/player/' + req.params.id, req.body)
        .then(() => {
            res.redirect(303, '/players');
        }).catch(error => {
            debug('Error when editing player: ' + error);
            next(error);
        });
});

/* Get specific statistics for a given player */
router.get('/:id/statistics', function (req, res, next) {
    var playerId = req.params.id;
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/statistics'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/statistics/previous'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/progression'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/checkouts'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/tournament')
    ]).then(axios.spread((players, player, statistics, previous_statistics, progression, checkouts, tournament) => {
        res.marko(playerTemplate, {
            players: players.data,
            player: player.data,
            statistics: statistics.data,
            previous_statistics: previous_statistics.data,
            progression: progression.data,
            checkouts: checkouts.data,
            tournament_standings: tournament.data,
            locals: req.app.locals
        });
    })).catch(error => {
        debug('Error when getting data for player ' + error);
        next(error);
    });
});

/* Get comparable statistics for players */
router.get('/compare', function (req, res, next) {
    var requests = [ axios.get(req.app.locals.kcapp.api + '/player/active') ];

    var playerIds = req.query.player_id;
    if (playerIds) {
        if (!Array.isArray(playerIds)) {
            playerIds = [playerIds]
        }
        requests.push(axios.get(req.app.locals.kcapp.api + '/player/compare?id=' + playerIds.join("&id=")));
    }
    axios.all(requests).then(axios.spread((playersResponse, statisticsData) => {
        var statistics = statisticsData ? statisticsData.data : [];
        var players = playersResponse.data;
        var sorted = _.sortBy(players, (player) => player.name)
        res.marko(playerComparisonTemplate, {
            players: sorted,
            playersMap: players,
            statistics: statistics,
            locals: req.app.locals
        });
    })).catch(error => {
        debug('Error when getting data for player comparison ' + error);
        next(error);
    });
});

/* Get head to head statistics between two players */
router.get('/:player1/vs/:player2', function (req, res, next) {
    var player1 = req.params.player1;
    var player2 = req.params.player2;

    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/player/' + player1 + '/vs/' + player2)
    ]).then(axios.spread((response1, response2) => {
        var players = response1.data;

        var head2head = response2.data;
        head2head.player_visits[player1] = _.sortBy(head2head.player_visits[player1], function (visit) { return -visit.count; })
        head2head.player_visits[player2] = _.sortBy(head2head.player_visits[player2], function (visit) { return -visit.count; })

        head2head.player_checkouts[player1] = _.sortBy(head2head.player_checkouts[player1], function (checkout) { return -checkout.count; })
        head2head.player_checkouts[player2] = _.sortBy(head2head.player_checkouts[player2], function (checkout) { return -checkout.count; })

        res.marko(head2headTemplate, { player1: players[player1], player2: players[player2], head2head: head2head });
    })).catch(error => {
        debug('Error when getting data for head to head ' + error);
        next(error);
    });
});

module.exports = router