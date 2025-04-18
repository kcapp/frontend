const debug = require('debug')('kcapp:legs');

const types = require('../src/components/scorecard/components/match_types.js');

const express = require('express');
const router = express.Router();
const _ = require('underscore');

const skill = require('kcapp-bot/bot-skill');

const axios = require('axios');

const template = require('marko');
const x01InputTemplate = template.load(require.resolve('../src/pages/leg/leg-template.marko'));
const spectateTemplate = template.load(require.resolve('../src/pages/spectate/spectate-template.marko'));
const legResultTemplate = template.load(require.resolve('../src/pages/leg-result/leg-result-template.marko'));

/* Render the leg view with beta features */
router.get('/:id/beta', function (req, res, next) {
    renderLegView(req, res, next, true, false);
});

/* Render the leg view */
router.get('/:id', function (req, res, next) {
    renderLegView(req, res, next, false, false);
});

/* Render the leg view for tablet-controllers */
router.get('/:id/controller', function (req, res, next) {
    renderLegView(req, res, next, false, true);
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
        .then(response => {
            const players = response.data;
            this.socketHandler.emitMessage('/active', 'order_changed', { leg_id: req.params.id });
            axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`)
                .then(response => {
                    const leg = response.data;
                    this.socketHandler.emitMessage(`/legs/${req.params.id}`, 'order_changed', { leg: leg, players: players} );
                    res.status(200).send({ leg: leg, players: players}).end();
                }).catch(error => {
                    debug('Unable to change order: %s', error);
                    next(error);
                });
        }).catch(error => {
            debug('Unable to change order: %s', error);
            next(error);
        });
});

/** Method to finish a leg */
router.put('/:id/finish', function (req, res, next) {
    let legId = req.params.id;
    axios.put(`${req.app.locals.kcapp.api}/leg/${legId}/finish`, req.body)
        .then(response => {
            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/leg/${legId}`),
                axios.get(`${req.app.locals.kcapp.api}/leg/${legId}/players`),
                axios.get(`${req.app.locals.kcapp.api}/statistics/global/fnc`)
            ]).then(axios.spread((legData, playersData, globalData) => {
                const leg = legData.data;
                const players = playersData.data;
                const currentPlayer = _.findWhere(players, { is_current_player: true });
                const globalstat = globalData.data[0];

                axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
                    .then((response) => {
                        const match = response.data;

                        const winnerPlayer = _.findWhere(players, { player_id: leg.winner_player_id });
                        //announceLegFinished(winnerPlayer, match)

                        if (!match.is_finished) {
                            this.socketHandler.setupLegsNamespace(match.current_leg_id);

                            // Forward all spectating clients to next leg
                            this.socketHandler.emitMessage(`/legs/${legId}`, 'new_leg', { match: match, leg: leg });
                        }
                        this.socketHandler.emitMessage(`/active`, 'leg_finished', { match: match, leg: leg });
                        this.socketHandler.emitMessage(`/legs/${legId}`, 'score_update', { leg: leg, players: players, match: match });
                        this.socketHandler.emitMessage(`/legs/${legId}`,'leg_finished', { leg: leg, match: match });

                        setTimeout(() => {
                            // Remove the namespace in a bit, once announcements are finished
                            this.socketHandler.removeNamespace(legId);
                        }, 15000);
                        res.status(200).send({ leg_id: match.current_leg_id, match: match }).end();
                    }).catch(error => {
                        const message = `${error.message}(${error})`;
                        debug(`[${legId}] Error when getting match: ${message}`);
                        next(error);
                    });
            })).catch(error => {
                const message = `${error.message} (${error})`;
                debug(`[${legId}] Error when getting leg: ${message}`);
                next(error);
            });
        }).catch(error => {
            debug(`[${legId}] Unable to finish leg: ${error}`);
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

function renderLegView(req, res, next, isExperimental, isController) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/leg/${req.params.id}/players`)
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        const leg = legResponse.data;
        axios.get(`${req.app.locals.kcapp.api}/match/${leg.match_id}`)
            .then(response => {
                const match = response.data;

                if (isController && match.is_finished) {
                    res.redirect('/controller');
                    return;
                }

                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.marko(x01InputTemplate, {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers,
                    experimental: isExperimental,
                    controller: isController,
                    locals: req.app.locals
                });
            }).catch(error => {
                debug(`Error when getting match: ${error}`);
                next(error);
            });
    })).catch(error => {
        debug(`Error when getting data for leg ${error}`);
        next(error);
    });
}

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
