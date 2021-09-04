var debug = require('debug')('kcapp:tournaments');

var bottleneck = require("bottleneck/es5");
var limiter = new bottleneck({ minTime: 51 });

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');
var bracket = require('./lib/bracket_generator');

const template = require('marko');
var tournamentTemplate = template.load(require.resolve('../src/pages/tournament/tournament-template.marko'));
var tournamentsTemplate = template.load(require.resolve('../src/pages/tournaments/tournaments-template.marko'));
var tournamentAdminTemplate = template.load(require.resolve('../src/pages/tournament-admin/tournament-admin-template.marko'));
var tournamentsAdminTemplate = template.load(require.resolve('../src/pages/tournaments-admin/tournaments-admin-template.marko'));
var tournamentScheduleTemplate = template.load(require.resolve('../src/pages/tournament-schedule/tournament-schedule-template.marko'));
var tournamentPlayerMatchesTemplate = template.load(require.resolve('../src/pages/tournament-player-matches/tournament-player-matches-template.marko'));

/** Get all tournaments */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/tournament`),
        axios.get(`${req.app.locals.kcapp.api}/office`)
    ]).then(axios.spread((tournaments, offices) => {
        res.marko(tournamentsTemplate, {
            tournaments: tournaments.data,
            offices: offices.data
        });
    })).catch(error => {
        debug(`Error when getting data for tournament ${error}`);
        next(error);
    });
});

/* Get current active tournament */
router.get('/current', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/tournament/current`)
        .then((response) => {
             res.redirect(`/tournaments/${response.data.id}`);
        }).catch(error => {
            if (error.response.status === 404) {
                res.redirect("/tournaments/");
                return;
            }
            debug(`Error when getting data for tournament ${error}`);
            next(error);
        });
});

/* Get current active tournament */
router.get('/admin', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/tournament/groups`),
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
    ]).then(axios.spread((groups, players, offices, venues, modes, types) => {
        res.marko(tournamentsAdminTemplate, {
            groups: groups.data,
            players: players.data,
            offices: offices.data,
            venues: venues.data,
            modes: modes.data,
            types: types.data
        });
    })).catch(error => {
        debug(`Error when getting data for tournament ${error}`);
        next(error);
    });
});

/* Get tournament with the given ID */
router.get('/:id/admin', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/matches`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/metadata`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/groups`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
    ]).then(axios.spread((playersResponse, tournamentResponse, matchesData, metadataResponse, groups, modes, venue) => {
        var matches = matchesData.data;
        var metadata = _.sortBy(metadataResponse.data, 'order_of_play');
        var players = playersResponse.data;
        var tournament = tournamentResponse.data;

        var matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }

        bracket.generateNew(metadata, matches, players, '', (err, brackets) => {
            res.marko(tournamentAdminTemplate, {
                brackets: brackets,
                tournament: tournament,
                players: players,
                matches: matchesMap,
                metadata: metadata,
                groups: groups.data,
                modes: modes.data,
                venues: venue.data
            });
        });
    })).catch(error => {
        debug(`Error when getting data for tournament admin ${error}`);
        next(error);
    });
});

/* Create new tournament  */
router.post('/admin', function (req, res, next) {
    const body = req.body;

    const groups = {};
    const playersByGroup = {};
    for (let i = 0; i < body.groups.length; i++) {
        const group = body.groups[i];

        groups[group.id] = group;
        playersByGroup[group.id] = new Set();
    }
    const matches = body.matches;
    for (let i = 0; i < matches.length; i++) {
        var match = matches[i];
        const players = playersByGroup[match[2].id]
        players.add(match[3].id);
        players.add(match[4].id);
    }
    const tournamentPlayers = [];
    for (const groupId in playersByGroup) {
        const players = playersByGroup[groupId];
        players.forEach(playerId => {
            tournamentPlayers.push({
                player_id: playerId,
                tournament_group_id: parseInt(groupId)
            })
        });
    }

    const tournamentBody = {
        name: req.body.name,
        short_name: req.body.short_name,
        is_playoffs: false, // TODO
        playoffs_tournament_id: null,
        start_time: req.body.start,
        end_time: req.body.end,
        players: tournamentPlayers,
        office_id: req.body.office_id
    };
    axios.post(`${req.app.locals.kcapp.api}/tournament`, tournamentBody)
        .then(response => {
            const tournament = response.data;

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];

                const startDatetime = `${match[0].value} ${match[1].value}`;
                const group = groups[match[2].id];

                const matchBody = {
                    created_at: startDatetime,
                    match_type: {
                        id: group.type
                    },
                    match_mode: {
                        id: group.mode
                    },
                    players: [match[3].id, match[4].id],
                    legs: [{
                        starting_score: group.score
                    }],
                    tournament_id: tournament.id,
                    office_id: req.body.office_id
                }
                if (req.body.venue_id !== -1) {
                    matchBody.venue_id = req.body.venue_id;
                }
                createMatch(req, matchBody);
            }
            res.end();
        }).catch(error => {
            debug(`Error when starting new match: ${error}`);
        });
});

/* Get tournament with the given ID */
router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/overview`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/matches`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/metadata`)
    ]).then(axios.spread((playersResponse, tournamentResponse, overviewData, matchesData, statisticsResponse, metadataResponse) => {
        var statistics = statisticsResponse.data;
        if (!_.isEmpty(statistics)) {
            statistics.checkout_highest = _.sortBy(statistics.checkout_highest, (stats) => -stats.value);
            statistics.best_three_dart_avg = _.sortBy(statistics.best_three_dart_avg, (stats) => -stats.value);
            statistics.best_first_nine_avg = _.sortBy(statistics.best_first_nine_avg, (stats) => -stats.value);
            if (statistics.best_301_darts_thrown) {
                statistics.best_301_darts_thrown = _.sortBy(statistics.best_301_darts_thrown, (stats) => stats.value);
            }
            if (statistics.best_501_darts_thrown) {
                statistics.best_501_darts_thrown = _.sortBy(statistics.best_501_darts_thrown, (stats) => stats.value);
            }
        }

        var matches = matchesData.data;
        var metadata = _.sortBy(metadataResponse.data, 'order_of_play');
        var players = playersResponse.data;
        var tournament = tournamentResponse.data;

        var overview = overviewData.data;
        sortTournamentOverview(overview);

        if (tournament.playoffs_tournament_id !== null) {
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.playoffs_tournament_id}/matches`),
                axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.playoffs_tournament_id}/metadata`)
            ]).then(axios.spread((matchesResponse, metadataResponse) => {
                bracket.generateNew(metadataResponse.data, matchesResponse.data, players, '', (err, brackets) => {
                    res.marko(tournamentTemplate, {
                        brackets: brackets,
                        tournament: tournament,
                        overview: overview,
                        players: players,
                        matches: matches,
                        statistics: statistics
                    });
                });
            })).catch(error => {
                debug(`Error when getting data for tournament ${error}`);
                next(error);
            });
        } else {
            bracket.generateNew(metadata, matches, players, '', (err, brackets) => {
                res.marko(tournamentTemplate, {
                    brackets: brackets,
                    tournament: tournament,
                    overview: overview,
                    players: players,
                    matches: matches,
                    statistics: statistics
                });
            });
        }
    })).catch(error => {
        debug(`Error when getting data for tournament ${error}`);
        next(error);
    });
});

/* Get tournament with the given ID */
router.get('/:id/schedule', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/metadata`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/matches`)
    ]).then(axios.spread((players, tournament, metadataData, matchesData) => {
        var matches = matchesData.data;
        var metadata = metadataData.data;

        var matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }

        metadata = _.sortBy(metadata, 'order_of_play');
        res.marko(tournamentScheduleTemplate, {
            tournament: tournament.data,
            players: players.data,
            metadata: metadata,
            matches: matchesMap,
            locals: req.app.locals
        });
    })).catch(error => {
        debug(`Error when getting data for tournament ${error}`);
        next(error);
    });
});

/* Get player tournament matches */
router.get('/:id/player/:player_id', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/overview`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/player/${req.params.player_id}`)
    ]).then(axios.spread((playersData, tournament, overviewData, statistics, matchesData) => {
        var matches = matchesData.data;
        var players = playersData.data;

        var playerId = req.params.player_id;
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            if (match.players[0] == playerId) {
                continue;
            }
            var old = match.players[0];
            match.players[0] = match.players[1];
            match.players[1] = old;
        }
        var overview = overviewData.data;
        sortTournamentOverview(overview);

        res.marko(tournamentPlayerMatchesTemplate, {
            tournament: tournament.data,
            players: players,
            player: players[playerId],
            overview: overview,
            statistics: statistics.data,
            matches: matches
        });
    })).catch(error => {
        debug(`Error when getting data for player tournament matches ${error}`);
        next(error);
    });
});

function sortTournamentOverview(overview) {
    for (var groupId in overview) {
        var group = overview[groupId];
        // Sort players by points earned
        group.sort((p1, p2) => p2.points - p1.points);

        // Calculate rank for each player
        var rank = 0;
        for (var i = 0; i < group.length; i++) {
            var current = group[i];
            var prev = group[i - 1];

            if (prev && prev.points == current.points && prev.legs_difference === current.legs_difference) {
                current.rank = prev.rank;
            } else {
                current.rank = rank + 1;
            }
            rank++;
        }
    }
}

function createMatch(req, body) {
    // To not spam the API with too many requests, we add a short limit to the requests here
    limiter.schedule(() => {
        axios.post(`${req.app.locals.kcapp.api}/match`, body)
            .then(response => {
                var match = response.data;
                this.socketHandler.setupLegsNamespace(match.current_leg_id);
            }).catch(error => {
                debug(`Error when starting new match: ${error}`);
            });
    });
}

module.exports = router;
