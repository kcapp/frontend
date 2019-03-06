var debug = require('debug')('kcapp:players');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

var playersTemplate = require('../src/pages/players/players-template.marko');

/* Get a list of all players */
router.get('/old', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player/active')
        .then(response => {
            var players = response.data;
            players = _.sortBy(players, (player) => player.name)
            res.render('player/players', { players: players });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

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
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/statistics'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/statistics/previous'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/progression'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/checkouts'),
        axios.get(req.app.locals.kcapp.api + '/player/' + playerId + '/tournament')
    ]).then(axios.spread((player, statistics, previous_statistics, progression, checkouts, tournament) => {
        res.render('player/player', {
            player: player.data,
            statistics: statistics.data,
            previous_statistics: previous_statistics.data,
            progression: progression.data,
            checkouts: checkouts.data,
            tournament_standings: tournament.data

        });
    })).catch(error => {
        debug('Error when getting data for player ' + error);
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

    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/player/compare?id=' + playerIds.join("&id="))
    ]).then(axios.spread((players, statistics) => {
        statistics = _.sortBy(statistics.data, function (stat) { return players.data[stat.player_id].name; });
        res.render('player/players_comparison', {
            players: players.data,
            statistics: statistics
        });
    })).catch(error => {
        debug('Error when getting data for player ' + error);
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

        res.render('player/head_to_head', { player1: players[player1], player2: players[player2], head2head: head2head });
    })).catch(error => {
        debug('Error when getting data for head to head ' + error);
        next(error);
    });
});

module.exports = router