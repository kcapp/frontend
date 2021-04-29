var debug = require('debug')('kcapp:matches');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');
var skill = require('kcapp-bot/bot-skill');
var types = require('../src/components/scorecard/components/match_types');

var bracket = require('./lib/bracket_generator');

var matchesTemplate = require('../src/pages/matches/matches-template.marko');
var matchResultTemplate = require('../src/pages/match-result/match-result-template.marko');
var spectateTemplate = require('../src/pages/spectate/spectate-template.marko');
var previewTemplate = require('../src/pages/match-preview/match-preview-template.marko');
var obsTemplate = require('../src/pages/obs/obs-template.marko');

/* Redirect requests to /matches to /matches/page/1 */
router.get('/', function (req, res) {
    res.redirect('/matches/page/1');
});

/* Get the given page of matches */
router.get('/page/:page', function (req, res, next) {
    var limit = 25;
    var start = (req.params.page - 1) * limit;

    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/match/${start}/${limit}`)
    ]).then(axios.spread((players, matches, offices, matchPage) => {
        res.marko(matchesTemplate, {
            matches: matchPage.data,
            players: players.data,
            offices: offices.data,
            total_pages: Math.ceil(matches.data.length / limit),
            page_num: req.params.page
        });
    })).catch(error => {
        debug('Error when getting data for matches ' + error);
        next(error);
    });
});

/** Continue the given match */
router.get('/:id', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}`)
        .then(response => {
            var match = response.data
            res.redirect('/legs/' + match.current_leg_id);
        }).catch(error => {
            debug(`Error when getting match: ${error}`);
            next(error)
        });
});

/* Preview */
router.get('/:id/preview', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}`)
        .then(response => {
            var match = response.data
            var player1 = match.players[0];
            var player2 = match.players[1];
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/player`),
                axios.get(`${req.app.locals.kcapp.api}/player/${player1}/vs/${player2}`),
                axios.get(`${req.app.locals.kcapp.api}/player/${player1}/statistics`),
                axios.get(`${req.app.locals.kcapp.api}/player/${player2}/statistics`),
                axios.get(`${req.app.locals.kcapp.api}/match/${match.id}/metadata`),
                axios.get(`${req.app.locals.kcapp.api}/tournament/${match.tournament_id}/metadata`),
                axios.get(`${req.app.locals.kcapp.api}/tournament/standings`),
                axios.get(`${req.app.locals.kcapp.api}/tournament/${match.tournament_id}/matches`)
            ]).then(axios.spread((response1, response2, p1stats, p2stats, metadataResponse, tournamentMetadataResponse, standingsresponse, tournamentMatchesResponse) => {
                var players = response1.data;
                p1stats = p1stats.data;
                p2stats = p2stats.data;
                var tournamentMatches = tournamentMatchesResponse.data;
                var tournamentMetadata = tournamentMetadataResponse.data;
                var metadata = metadataResponse.data;

                bracket.generateNew(tournamentMetadata, tournamentMatches, players, metadata.match_displayname, ((err, brackets) => {
                    var head2head = response2.data;
                    head2head.player_visits[player1] = _.sortBy(head2head.player_visits[player1], function (visit) {
                        return -visit.count;
                    })
                    head2head.player_visits[player2] = _.sortBy(head2head.player_visits[player2], function (visit) {
                        return -visit.count;
                    })

                    head2head.player_checkouts[player1] = _.sortBy(head2head.player_checkouts[player1], function (checkout) {
                        return -checkout.count;
                    })
                    head2head.player_checkouts[player2] = _.sortBy(head2head.player_checkouts[player2], function (checkout) {
                        return -checkout.count;
                    })

                    var standings = standingsresponse.data;
                    var p1Standing = _.findWhere(standings, {
                        player_id: p1stats.player_id
                    });
                    var p2Standing = _.findWhere(standings, {
                        player_id: p2stats.player_id
                    })

                    players[player1].rank = p1Standing ? p1Standing.rank : "n/a";
                    players[player2].rank = p2Standing ? p2Standing.rank : "n/a";

                    res.marko(previewTemplate, {
                        player1: players[player1],
                        player2: players[player2],
                        match: match,
                        bracket: err ? null : brackets[match.tournament.tournament_group_id],
                        head2head: head2head,
                        players: response1,
                        p1statistics: p1stats,
                        p2statistics: p2stats,
                        metadata: metadata
                    });
                }));
            })).catch(error => {
                debug('Error when getting data for head to head ' + error);
                next(error);
            });
        }).catch(error => {
            debug('Error when getting match: ' + error);
            next(error)
        });
});

/* Spectate the given match */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}`)
    ]).then(axios.spread((players, response) => {
        var match = response.data;
        if (match.is_finished) {
            return res.redirect('/matches/' + req.params.id + "/result");
        } else {
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}`),
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}/players`)
            ]).then(axios.spread((leg, legPlayers) => {
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.marko(spectateTemplate, {
                    leg: leg.data,
                    leg_players: legPlayers,
                    players: players.data,
                    match: match
                });
            })).catch(error => {
                debug('Error when getting data for matches ' + error);
                next(error);
            });
        }
    })).catch(error => {
        debug('Error when getting data for match ' + error);
        next(error);
    });
});

/* Spectate the given match */
router.get('/:id/spectate/compact', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}`)
    ]).then(axios.spread((players, response) => {
        var match = response.data;
        if (match.is_finished) {
            return res.redirect('/matches/' + req.params.id + "/result");
        } else {
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}`),
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}/players`)
            ]).then(axios.spread((leg, legPlayers) => {
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.render('leg/spectate_compact', {
                    leg: leg.data,
                    leg_players: legPlayers,
                    players: players.data,
                    match: match
                });
            })).catch(error => {
                debug('Error when getting data for matches ' + error);
                next(error);
            });
        }
    })).catch(error => {
        debug('Error when getting data for match ' + error);
        next(error);
    });
});

/* Render the leg view */
router.get('/:id/obs', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/match/${req.params.id}/metadata`)
    ]).then(axios.spread((players, matchData, metadata) => {
        var match = matchData.data;
        axios.all([
            axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}`),
            axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}/players`)
        ]).then(axios.spread((leg, legPlayers) => {
            legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
            res.marko(obsTemplate, {
                leg: leg.data,
                legPlayers: legPlayers,
                players: players.data,
                match: match,
                matchMetadata: metadata.data
            });
        })).catch(error => {
            debug('Error when getting data for match ' + error);
            next(error);
        });
    })).catch(error => {
        debug('Error when getting data for match ' + error);
        next(error);
    });
});

/* Render the results view */
router.get('/:id/result', function (req, res, next) {
    var id = req.params.id;

    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/match/${id}`),
        axios.get(`${req.app.locals.kcapp.api}/match/${id}/statistics`)
    ]).then(axios.spread((playerResponse, office, matchData, statisticsResponse) => {
        var players = playerResponse.data;
        var statistics = statisticsResponse.data;
        var match = matchData.data;

        axios.get(`${req.app.locals.kcapp.api}/leg/${match.legs[0].id}/players`)
            .then(response => {
                var botConfigs = _.object(_.map(response.data, (player) => { return [player.player_id, player.bot_config] }));
                _.each(statistics, stats => {
                    var name = players[stats.player_id].name;

                    var botConfig = botConfigs[stats.player_id];
                    if (botConfig) {
                        if (botConfig.player_id) {
                            name = name + " as " + players[botConfig.player_id].name;
                        } else {
                            name = name + " (" + skill.fromInt(botConfig.skill_level).name + ")";
                        }
                    }
                    stats.player_name = name;
                });
                res.marko(matchResultTemplate, {
                    match: match,
                    offices: office.data,
                    players: players,
                    statistics: statistics
                });
            }).catch(error => {
                debug('Error when getting data for match result ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for match result ' + error);
        next(error);
    });
});

/* Method for starting a new match */
router.post('/new', function (req, res, next) {
    var players = req.body.players;
    if (players === undefined || players.length === 0) {
        debug('No players specified, unable to start leg');
        res.status(400).send("No players specified").end();
        return;
    }

    axios.get(`${req.app.locals.kcapp.api}/player`)
        .then(response => {
            var playerMap = response.data;

            var isPractice = players.length == 1;
            for (var i = 0; i < players.length; i++) {
                if (isPractice) {
                    break;
                }
                var player = playerMap[players[i]];
                isPractice = player.is_bot;
            }

            var body = {
                owe_type_id: req.body.match_stake == -1 ? null : req.body.match_stake,
                venue_id: req.body.venue,
                match_type: { id: req.body.match_type },
                match_mode: { id: req.body.match_mode },
                players: players.map(Number),
                player_handicaps: req.body.player_handicaps,
                bot_player_config: req.body.bot_player_config,
                legs: [ {
                    starting_score: req.body.starting_score,
                    parameters: { outshot_type: { id: req.body.outshot_type } }
                } ],
                office_id: req.body.office_id,
                is_practice: isPractice
            }

            axios.post(`${req.app.locals.kcapp.api}/match`, body)
                .then(response => {
                    var match = response.data;
                    this.socketHandler.setupLegsNamespace(match.current_leg_id);

                    // Forward all spectating clients to next leg
                    if (match.venue) {
                        this.socketHandler.emitMessage('/venue/' + match.venue.id, 'venue_new_match', {
                            match_id: match.id,
                            leg_id: match.current_leg_id
                        });
                        this.socketHandler.emitMessage('/active', 'new_match', {
                            match: match
                        });
                    }
                    res.status(200).send(match).end();
                }).catch(error => {
                    debug('Error when starting new match: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when starting new match: ' + error);
            next(error);
        });

});

/* Method for starting a new match */
router.post('/:id/rematch', function (req, res, next) {
    axios.post(`${req.app.locals.kcapp.api}/match/${req.params.id}/rematch`, null)
        .then(response => {
            var match = response.data;
            this.socketHandler.setupLegsNamespace(match.current_leg_id);
            // Forward all spectating clients to next leg
            if (match.venue) {
                this.socketHandler.emitMessage('/venue/' + match.venue.id, 'venue_new_match', {
                    match_id: match.id,
                    leg_id: match.current_leg_id
                });
                this.socketHandler.emitMessage('/active', 'new_match', {
                    match: match
                });
            }
            res.status(200).send(match).end();
        }).catch(error => {
            debug('Error when starting new match: ' + error);
            next(error);
        });
});

module.exports = function (socketHandler) {
    this.socketHandler = socketHandler;
    return router;
};