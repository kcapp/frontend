const debug = require('debug')('kcapp:tournaments');

const bottleneck = require("bottleneck/es5");
const limiter = new bottleneck({ minTime: 51 });

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');
const bracket = require('./lib/bracket_generator');
const moment = require('moment');

const types = require('../src/components/scorecard/components/match_types');
const template = require('marko');
const tournamentTemplate = template.load(require.resolve('../src/pages/tournament/tournament-template.marko'));
const tournamentsTemplate = template.load(require.resolve('../src/pages/tournaments/tournaments-template.marko'));
const tournamentAdminTemplate = template.load(require.resolve('../src/pages/tournament-admin/tournament-admin-template.marko'));
const tournamentsAdminTemplate = template.load(require.resolve('../src/pages/tournaments-admin/tournaments-admin-template.marko'));
const tournamentScheduleTemplate = template.load(require.resolve('../src/pages/tournament-schedule/tournament-schedule-template.marko'));
const tournamentPlayerMatchesTemplate = template.load(require.resolve('../src/pages/tournament-player-matches/tournament-player-matches-template.marko'));
const tournamentObsOverlayTemplate = template.load(require.resolve('../src/pages/obs-overlay/obs-overlay-template.marko'));

/** Get all tournaments */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/tournament`),
        axios.get(`${req.app.locals.kcapp.api}/office`)
    ]).then(axios.spread((tournaments, offices) => {
        res.marko(tournamentsTemplate, {
            tournaments: tournaments.data,
            offices: offices.data,
            locals: req.app.locals
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

/* Get tournament admin */
router.get('/admin', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/tournament/groups`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/preset`),
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/option/default`),
    ]).then(axios.spread((groups, presets, playersData, offices, venues, modes, types, defaults) => {
        const players = _.reject(playersData.data, (player) => player.is_placeholder);
        res.marko(tournamentsAdminTemplate, {
            groups: groups.data,
            presets: presets.data,
            players: _.sortBy(players, 'name'),
            offices: offices.data,
            venues: venues.data,
            modes: modes.data,
            types: types.data,
            defaults: defaults.data,
            max_rounds: [{ id: -1, name: '-' }, { id: 10, name: 10 }, { id: 12, name: 12 }, { id: 16, name: 16 }, { id: 20, name: 20 }, { id: 30, name: 30 }],
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
        const matches = matchesData.data;
        const metadata = _.sortBy(metadataResponse.data, 'order_of_play');
        const players = playersResponse.data;
        const tournament = tournamentResponse.data;

        const matchesMap = {};
        for (let key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }
        bracket.generate(tournament, metadata, matches, players, '', (err, brackets) => {
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

                const startDatetime = moment(`${match[0].value} ${match[1].value}`).format('yyyy-MM-DDTHH:mm:ssZ');
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
                        starting_score: group.score,
                        parameters: { outshot_type: { id: types.OUTSHOT_DOUBLE } }
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
            debug(`Error when creating new tournament: ${error}`);
            next(error);
        });
});

/* Generate new tournament  */
router.post('/admin/generate', function (req, res, next) {
    const body = req.body;

    const players = [];
    ["group1", "group2", "group3", "group4", "group5", "group6", "group7", "group8"].forEach(key => {
        if (body[key]) {
            body[key].players.forEach(player => {
                players.push({
                    player_id: player.id,
                    tournament_group_id: body[key].group.id
                });
            });
        }
    });
    const venues = {};
    ["group1", "group2", "group3", "group4", "group5", "group6", "group7", "group8"].forEach(key => {
        if (body[key]) {
            venues[body[key].group.id] = body[key].venueId;
        }
    });

    const name = body.name;
    const shortName = `${name.substring(0, 1)}${moment().format('DDMM')}`;

    const tournamentBody = {
        name: name,
        short_name: shortName,
        match_mode_id: body.match_mode_id,
        match_type_id: body.match_type_id,
        starting_score: body.starting_score,
        max_rounds: body.max_rounds,
        venues: venues,
        is_playoffs: false,
        players: players,
        manual_admin: true,
        office_id: req.body.office_id
    };
    axios.post(`${req.app.locals.kcapp.api}/tournament/generate`, tournamentBody)
        .then(response => {
            const tournament = response.data;
            axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.id}/matches`)
                .then(response => {
                    const matches = Object.values(response.data).flat();
                    for (const match of matches) {
                        this.socketHandler.setupLegsNamespace(match.current_leg_id);
                    }
                    res.send(tournament);
                }).catch(error => {
                    debug(`Error when generating new tournament: ${error}`);
                    next(error);
                });
        }).catch(error => {
            debug(`Error when generating new tournament: ${error}`);
            next(error);
        });
});

/* Generate playoffs tournament  */
router.post('/admin/generate/playoffs/:id', function (req, res, next) {
    const body = req.body;
    axios.post(`${req.app.locals.kcapp.api}/tournament/generate/playoffs/${req.params.id}`, body)
        .then(response => {
            const tournament = response.data;
            axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.id}/matches`)
            .then(response => {
                const matches = Object.values(response.data).flat();
                for (const match of matches) {
                    if (!match.is_finished) {
                        this.socketHandler.setupLegsNamespace(match.current_leg_id);
                    }
                }
                res.send(tournament);
            }).catch(error => {
                debug(`Error when generating playoffs tournament: ${error}`);
                next(error);
            });
        }).catch(error => {
            debug(`Error when generating playoffs tournament: ${error}`);
            next(error);
        });
});

/* Create new tournament group  */
router.post('/admin/groups', function (req, res, next) {
    const body = req.body;
    axios.post(`${req.app.locals.kcapp.api}/tournament/groups`, body)
        .then(response => {
            res.redirect('/tournaments/admin');
        }).catch(error => {
            debug(`Error when adding tournament group: ${error}`);
            next(error);
        });
});

/* Add a player to tournament  */
router.post('/:id/player', function (req, res, next) {
    axios.post(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/player`, req.body)
        .then(response => {
            const matches = response.data;
            for (const match of matches) {
                this.socketHandler.setupLegsNamespace(match.current_leg_id);
            }
            res.end();
        }).catch(error => {
            debug(`Error when adding player to tournament: ${error}`);
            next(error);
        });
});

/* Get tournament with the given ID */
router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/venue`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/overview`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/matches`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/metadata`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`)
    ]).then(axios.spread((playersResponse, venueResponse, tournamentResponse, overviewData, matchesData, statisticsResponse, metadataResponse, modesResponse) => {
        const statistics = statisticsResponse.data;
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

        const matches = matchesData.data;
        const metadata = _.sortBy(metadataResponse.data, 'order_of_play');
        const players = playersResponse.data;
        const tournament = tournamentResponse.data;

        const overview = overviewData.data;
        sortTournamentOverview(overview);

        if (tournament.playoffs_tournament_id !== null) {
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.playoffs_tournament_id}/matches`),
                axios.get(`${req.app.locals.kcapp.api}/tournament/${tournament.playoffs_tournament_id}/metadata`)
            ]).then(axios.spread((matchesResponse, metadataResponse) => {
                const playoffsMatches = matchesResponse.data;
                bracket.generate(tournament, metadataResponse.data, playoffsMatches, players, '', (err, brackets) => {
                    res.marko(tournamentTemplate, {
                        brackets: brackets,
                        tournament: tournament,
                        overview: overview,
                        players: players,
                        matches: matches,
                        playoffs_matches: playoffsMatches,
                        statistics: statistics,
                        modes: modesResponse.data,
                        venues: venueResponse.data,
                    });
                });
            })).catch(error => {
                debug(`Error when getting data for tournament ${error}`);
                next(error);
            });
        } else {
            bracket.generate(tournament, metadata, matches, players, '', (err, brackets) => {
                res.marko(tournamentTemplate, {
                    brackets: brackets,
                    tournament: tournament,
                    overview: overview,
                    players: players,
                    matches: matches,
                    statistics: statistics,
                    modes: modesResponse.data,
                    venues: venueResponse.data,
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

/* Get next tournament match */
router.get('/match/:id/next', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/tournament/match/${req.params.id}/next`)
        .then(response => {
            if (response.status === 204) {
                res.sendStatus(204);
                return;
            }
            res.send(response.data);
    }).catch(error => {
        debug(`Error when getting next tournament match ${error}`);
        next(error);
    });
});

/* Get OBS overlay for tournament with the given ID */
router.get('/:id/obs', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/tournament/${req.params.id}/statistics`)
    .then(response => {
        const statistics = response.data;
        res.marko(tournamentObsOverlayTemplate, {
            tournament_id: req.params.id,
            statistics: statistics,
            locals: req.app.locals
        });
    }).catch(error => {
        debug(`Error when getting data for tournament ${error}`);
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
