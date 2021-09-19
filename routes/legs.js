var debug = require('debug')('kcapp:legs');

var types = require('../src/components/scorecard/components/match_types.js');

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var skill = require('kcapp-bot/bot-skill');

var axios = require('axios');

const template = require('marko');
var x01InputTemplate = template.load(require.resolve('../src/pages/leg/leg-template.marko'));
var spectateTemplate = template.load(require.resolve('../src/pages/spectate/spectate-template.marko'));
var legResultTemplate = template.load(require.resolve('../src/pages/leg-result/leg-result-template.marko'));

/* Render the leg view */
router.get('/:id/beta', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/global`)
    ]).then(axios.spread((players, legResponse, legPlayers, globalStatistics) => {
        var leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                var match = response.data;
                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.marko(x01InputTemplate, {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers,
                    global_statistics: globalStatistics.data,
                    experimental: true
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for leg ${error}`);
        next(error);
    });
});

/* Render the leg view */
router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/global`)
    ]).then(axios.spread((players, legResponse, legPlayers, globalStatistics) => {
        const leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                const match = response.data;
                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.marko(x01InputTemplate, {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers,
                    global_statistics: globalStatistics.data
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for leg ${error}`);
        next(error);
    });
});

/* Render the leg spectate view */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`)
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        var leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                var match = response.data;
                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)

                res.marko(spectateTemplate, {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers,
                    options: { socketio_url: req.app.locals.socketio_url }
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for leg spectate ${error}`);
        next(error);
    });
});

/* Render the leg umpire view */
router.get('/:id/umpire', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`)
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        var leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                var match = response.data;

                res.render('leg/umpire', {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers.data
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for umpire ${error}`);
        next(error);
    });
});

/* Method for getting results for a given leg */
router.get('/:id/result', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/statistics`)
    ]).then(axios.spread((playerResponse, legResponse, legPlayersResponse, statistics) => {
        var leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                var match = response.data;

                var players = playerResponse.data;
                var legPlayers = legPlayersResponse.data;

                var botConfigs = _.object(_.map(legPlayers, (player) => {
                    return [player.player_id, player.bot_config];
                }));
                _.each(legPlayers, (player) => {
                    if (match.match_type.id == types.DARTS_AT_X) {
                        players[player.player_id].starting_score = 0;
                        players[player.player_id].current_score = player.current_score;
                    } else {
                        players[player.player_id].starting_score = leg.starting_score + player.handicap;
                        players[player.player_id].current_score = player.current_score + player.handicap;
                    }

                    var name = players[player.player_id].name;
                    var botConfig = botConfigs[player.player_id];
                    if (botConfig) {
                        if (botConfig.player_id) {
                            name = `${name} as ${players[botConfig.player_id].name}`;
                        } else {
                            name = `${name} (${skill.fromInt(botConfig.skill_level).name})`;
                        }
                        players[player.player_id].name = name;
                    }
                });
                res.marko(legResultTemplate, {
                    leg: leg,
                    players: players,
                    stats: statistics.data,
                    match: match,
                    leg_players: legPlayers
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for leg ${error}`);
        next(error);
    });
});

/* Delete the given visit */
router.delete('/:id/visit/:visitid', function (req, res, next) {
    axios.delete(`${req.app.locals.kcapp.api}/visit/${req.params.visitid}`)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug(`Unable to dlete visit: ${error}`);
            next(error);
        });
});

/* Modify the score */
router.post('/:id/result', function (req, res, next) {
    axios.put(`${req.app.locals.kcapp.api}/visit/${req.body.id}/modify`, req.body)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug(`Error when modifying scores: ${error}`);
            next(error);
        });
});

/* Method to cancel a leg in progress */
router.delete('/:id/cancel', function (req, res, next) {
    var legId = req.params.id;
    axios.delete(`${req.app.locals.kcapp.api}/leg/${legId}`)
        .then(() => {
            this.socketHandler.emitMessage(`/legs/${legId}`, 'cancelled', { });
            res.status(204).end();
        }).catch(error => {
            debug(`Error when modifying scores: ${error}`);
            next(error);
        });
});

/** Method to change player order */
router.put('/:id/order', function (req, res, next) {
    axios.put(`${req.app.locals.kcapp.api}/leg/${req.params.id}/order`, req.body)
        .then(() => {
            this.socketHandler.emitMessage('/active', 'order_changed', { leg_id: req.params.id });
            res.status(200).end();
        }).catch(error => {
            debug('Unable to change order: %s', error);
            next(error);
        });
});

/** Method to undo leg finish */
router.put('/:id/undo', function (req, res, next) {
    axios.put(`${req.app.locals.kcapp.api}/leg/${req.params.id}/undo`)
        .then(() => {
            this.socketHandler.setupLegsNamespace(req.params.id);
            res.status(200).end();
        }).catch(error => {
            debug('Unable to undo finish: %s', error);
            next(error);
        });
});

module.exports = function (app, socketHandler) {
    this.socketHandler = socketHandler;

    // Create socket.io namespaces for all legs which are currently active
    axios.get(`${app.locals.kcapp.api}/leg/active`)
        .then(response => {
            var legs = response.data;
            for (var i = 0; i < legs.length; i++) {
                this.socketHandler.setupLegsNamespace(legs[i].id);
            }
        }).catch(error => {
            debug('Unable to get active legs: %s', error);
        });
    return router;
};
