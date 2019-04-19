var debug = require('debug')('kcapp:legs');

const express = require('express');
const router = express.Router();
const _ = require('underscore');
const request = require('request');

const axios = require('axios');

var x01InputTemplate = require('../src/pages/leg/leg-template.marko');
var spectateTemplate = require('../src/pages/spectate/spectate-template.marko');
var legResultTemplate = require('../src/pages/leg-result/leg-result-template.marko');

/* Render the leg view */
router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/players'),
        axios.get(req.app.locals.kcapp.api + '/statistics/global')
    ]).then(axios.spread((players, legResponse, legPlayers, globalStatistics) => {
        var leg = legResponse.data;
        axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
            .then(response => {
                var match = response.data;
                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                if (match.match_type.id === 2) {
                    // TODO Move this view to marko
                    res.render('leg/entry_shootout.pug', {
                        leg: leg,
                        players: players.data,
                        match: match,
                        leg_players: legPlayers
                    });
                } else {
                    res.marko(x01InputTemplate, {
                        leg: leg,
                        players: players.data,
                        match: match,
                        leg_players: legPlayers,
                        global_statistics: globalStatistics.data
                    });
                }
            }).catch(error => {
                debug('Error when getting match: ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for leg ' + error);
        next(error);
    });
});

/* Render the vertical leg view */
router.get('/:id/vertical', function (req, res, next) {
    getLegView(req, res, next, true);
});

function getLegView(req, res, next, vertical) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/players')
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        var leg = legResponse.data;
        axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
            .then(response => {
                var match = response.data;

                var pugView = vertical ? 'leg/entry_x01_vertical.pug' : 'leg/entry_x01.pug';
                if (match.match_type.id === 2) {
                    pugView = 'leg/entry_shootout.pug';
                }

                // Sort players based on order
                legPlayers = _.sortBy(legPlayers.data, (player) => player.order)
                res.render(pugView, {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers
                });
            }).catch(error => {
                debug('Error when getting match: ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for leg ' + error);
        next(error);
    });
}

/* Render the leg spectate view */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/players')
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        var leg = legResponse.data;
        axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
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
                debug('Error when getting match: ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for leg spectate ' + error);
        next(error);
    });
});

/* Render the leg umpire view */
router.get('/:id/umpire', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/players')
    ]).then(axios.spread((players, legResponse, legPlayers) => {
        var leg = legResponse.data;
        axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
            .then(response => {
                var match = response.data;

                res.render('leg/umpire', {
                    leg: leg,
                    players: players.data,
                    match: match,
                    leg_players: legPlayers.data
                });
            }).catch(error => {
                debug('Error when getting match: ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for umpire ' + error);
        next(error);
    });
});

/* Method for getting results for a given leg */
router.get('/:id/result', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/players'),
        axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/statistics')
    ]).then(axios.spread((playerResponse, legResponse, legPlayersResponse, statistics) => {
        var leg = legResponse.data;
        axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
            .then(response => {
                var match = response.data;

                var players = playerResponse.data;
                var legPlayers = legPlayersResponse.data;
                _.each(legPlayers, (player) => {
                    players[player.player_id].starting_score = leg.starting_score + player.handicap;
                    players[player.player_id].remaining_score = leg.starting_score + player.handicap;
                });

                _.each(leg.visits, (visit, index) => {
                    var player = players[visit.player_id]
                    var visitScore = (visit.first_dart.value * visit.first_dart.multiplier) +
                        (visit.second_dart.value * visit.second_dart.multiplier) +
                        (visit.third_dart.value * visit.third_dart.multiplier);
                    if (!visit.is_bust) {
                        if (match.match_type.id == 2) {
                            player.remaining_score += visitScore;
                        }
                        else {
                            player.remaining_score -= visitScore;
                        }
                    }

                    var scores = player.remaining_score;
                    for (var i = 1; i < leg.players.length; i++) {
                        var nextVisit = leg.visits[index + i];
                        if (!nextVisit) {
                            // There is no next visit, so look at previous instead
                            // Need to look in reverese order to keep the order of scores the same
                            nextVisit = leg.visits[index - (leg.players.length - i)]
                        }
                        if (nextVisit) {
                            scores += ' : ' + players[nextVisit.player_id].remaining_score;
                        }
                    }
                    visit.scores = scores;
                });

                res.marko(legResultTemplate, {
                    leg: leg,
                    players: players,
                    stats: statistics.data,
                    match: match,
                    leg_players: legPlayers
                });
            }).catch(error => {
                debug('Error when getting match: ' + error);
                next(error);
            });
    })).catch(error => {
        debug('Error when getting data for leg ' + error);
        next(error);
    });
});

/* Delete the given visit */
router.delete('/:id/visit/:visitid', function (req, res, next) {
    axios.delete(req.app.locals.kcapp.api + '/visit/' + req.params.visitid)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug('Unable to dlete visit: ' + error);
            next(error);
        });
});

/* Modify the score */
router.post('/:id/result', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/visit/' + req.body.id + '/modify', req.body)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug('Error when modifying scores: ' + error);
            next(error);
        });
});

/* Method to cancel a leg in progress */
router.delete('/:id/cancel', function (req, res, next) {
    var legId = req.params.id;
    axios.delete(req.app.locals.kcapp.api + '/leg/' + legId)
        .then(() => {
            res.status(204).end();
        }).catch(error => {
            debug('Error when modifying scores: ' + error);
            next(error);
        });
});

/* Method to finalize a leg */
router.post('/:id/finish', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/finish', req.body)
        .then(response => {
            var leg = response.data;
            axios.get(req.app.locals.kcapp.api + '/match/' + leg.match_id)
                .then(response => {
                    var match = response.data;
                    if (match.is_finished && match.venue) {
                        this.socketHandler.emitMessage('/venue/' + match.venue.id, 'venue_match_finished', { match_id: match.id });
                    }
                    this.socketHandler.emitMessage('/active', 'leg_finished', { leg: leg, match: match });
                    res.status(200).send(match).end();
                }).catch(error => {
                    debug('Error when getting match match: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Unable to finish leg: ' + error);
            next(error);
        });
});

/** Method to change player order */
router.put('/:id/order', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/order', req.body)
        .then(() => {
            this.socketHandler.emitMessage('/active', 'order_changed', { leg_id: req.params.id });
            res.status(200).end();
        }).catch(error => {
            debug('Unable to change order: %s', error);
            next(error);
        });
});

/** Method to change player order */
router.put('/:id/undo', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/leg/' + req.params.id + '/undo')
        .then(() => {
            this.socketHandler.setupLegsNamespace(req.params.id);
            res.status(200).end();
        }).catch(error => {
            debug('Unable to undo finish: %s', error);
            next(error);
        });
});

/** Method for piping live stream */
router.get('/:id/stream', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/leg/' + req.params.id)
        .then(response => {
            var leg = response.data;

            var req_pipe = request({ url: leg.board_stream_url });
            req_pipe.pipe(res);

            req_pipe.on('error', function (e) {
                debug(e)
            });
            // Client quit normally
            req.on('end', function () {
                debug('Live stream ended');
                req_pipe.abort();

            });
            // Client quit unexpectedly
            req.on('close', function () {
                debug('Live stream closed');
                req_pipe.abort()
            });
        }).catch(error => {
            debug('Error when getting leg: ' + error);
            next(error);
        });
});

module.exports = function (app, socketHandler) {
    this.socketHandler = socketHandler;

    // Create socket.io namespaces for all legs which are currently active
    axios.get(app.locals.kcapp.api + '/leg/active')
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