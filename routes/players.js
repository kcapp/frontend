const debug = require('debug')('kcapp:players');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');

const template = require('marko');
const playerTemplate = template.load(require.resolve('../src/pages/player/player-template.marko'));
const playersTemplate = template.load(require.resolve('../src/pages/players/players-template.marko'));
const playerComparisonTemplate = template.load(require.resolve('../src/pages/player-comparison/player-comparison-template.marko'));
const head2headTemplate = template.load(require.resolve('../src/pages/player-head2head/player-head2head-template.marko'));

/* Get a list of all players */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player/active`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/venue`)
    ]).then(axios.spread((playersResponse, officesResponse, venueResponse) => {
        var players = playersResponse.data;
        players = _.sortBy(players, (player) => player.name)
        res.marko(playersTemplate, { players: players, offices: officesResponse.data, venues: venueResponse.data });
    })).catch(error => {
        debug(`Error when getting players: ${error}`);
        next(error);
    });
});

/* Add a new player */
router.post('/', function (req, res, next) {
    axios.post(`${req.app.locals.kcapp.api}/player`, req.body)
        .then(() => {
            res.redirect('/players');
        }).catch(error => {
            debug(`Error when adding new player: ${error}`);
            next(error);
        });
});

/* Edit player */
router.put('/:id', function (req, res, next) {
    axios.put(`${req.app.locals.kcapp.api}/player/${req.params.id}`, req.body)
        .then(() => {
            res.redirect(303, '/players');
        }).catch(error => {
            debug(`Error when editing player: ${error}`);
            next(error);
        });
});

/* Get specific statistics for a given player */
router.get('/:id/statistics', function (req, res, next) {
    const playerId = req.params.id;
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/statistics/previous`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/progression`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/checkouts`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/tournament`),
        axios.get(`${req.app.locals.kcapp.api}/player/${playerId}/badges`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/x01/player/50`),
        axios.get(`${req.app.locals.kcapp.api}/badge`),
        axios.get(`${req.app.locals.kcapp.api}/tournament`)
    ]).then(axios.spread((players, playerData, statistics, previous, progression, checkouts, playerTournament, playerBadges, leaderboardData, badges, tournaments) => {
        const player = playerData.data;
        const leaderboard = leaderboardData.data;
        player.globalRank = _.findIndex(leaderboard, player => player.player_id == playerId) + 1;
        const officeLeaderboard = _.filter(leaderboard, p => p.office_id == player.office_id);
        player.isKing = _.first(officeLeaderboard)?.player_id == playerId;

        res.marko(playerTemplate, {
            players: players.data,
            player: player,
            statistics: statistics.data,
            previous_statistics: previous.data,
            progression: progression.data,
            checkouts: checkouts.data,
            tournament_standings: playerTournament.data,
            player_badges: playerBadges.data,
            badges: badges.data,
            tournaments: tournaments.data,
            locals: req.app.locals
        });
    })).catch(error => {
        debug(`Error when getting data for player ${error}`);
        next(error);
    });
});

/* Get comparable statistics for players */
router.get('/compare', function (req, res, next) {
    const requests = [ axios.get(`${req.app.locals.kcapp.api}/player/active`) ];

    let playerIds = req.query.player_id;
    if (playerIds) {
        if (!Array.isArray(playerIds)) {
            playerIds = [playerIds]
        }
        requests.push(axios.get(`${req.app.locals.kcapp.api}/player/compare?id=${playerIds.join("&id=")}`));
    }
    axios.all(requests).then(axios.spread((playersResponse, statisticsData) => {
        const statistics = statisticsData ? statisticsData.data : [];
        const players = playersResponse.data;
        const sorted = _.sortBy(players, (player) => player.name)
        res.marko(playerComparisonTemplate, {
            players: sorted,
            playersMap: players,
            statistics: statistics,
            locals: req.app.locals
        });
    })).catch(error => {
        debug(`Error when getting data for player comparison ${error}`);
        next(error);
    });
});

/* Get head to head statistics between two players */
router.get('/:player1/vs/:player2', function (req, res, next) {
    var player1 = req.params.player1;
    var player2 = req.params.player2;

    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/player/${player1}/vs/${player2}`)
    ]).then(axios.spread((response1, response2) => {
        var players = response1.data;

        var head2head = response2.data;
        head2head.player_visits[player1] = _.sortBy(head2head.player_visits[player1], function (visit) { return -visit.count; })
        head2head.player_visits[player2] = _.sortBy(head2head.player_visits[player2], function (visit) { return -visit.count; })

        head2head.player_checkouts[player1] = _.sortBy(head2head.player_checkouts[player1], function (checkout) { return -checkout.count; })
        head2head.player_checkouts[player2] = _.sortBy(head2head.player_checkouts[player2], function (checkout) { return -checkout.count; })

        res.marko(head2headTemplate, { player1: players[player1], player2: players[player2], head2head: head2head });
    })).catch(error => {
        debug(`Error when getting data for head to head ${error}`);
        next(error);
    });
});

module.exports = router
