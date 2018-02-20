var debug = require('debug')('kcapp:matches');

const express = require('express');
const router = express.Router();
const _ = require('underscore');

const axios = require('axios');

/* Render the match view (button entry) */
router.get('/:id', function (req, res, next) {
    renderMatchView('match/button_entry', req, res, next);
});

/** Render the match view (keyboard entry) */
router.get('/:id/keyboard', function (req, res, next) {
    renderMatchView('match/keyboard_entry', req, res, next);
});

/* Render the match spectate view */
router.get('/:id/spectate', function (req, res, next) {
    axios.get('http://localhost:8001/player')
        .then(response => {
            var playersMap = response.data;
            axios.get('http://localhost:8001/match/' + req.params.id)
                .then(response => {
                    var match = response.data;
                    axios.get('http://localhost:8001/game/' + match.game_id)
                        .then(response => {
                            var game = response.data;
                            axios.get('http://localhost:8001/match/' + req.params.id + '/players')
                                .then(response => {
                                    var matchPlayers = response.data;
                                    res.render('match/spectate', { match: match, players: playersMap, game: game, match_players: matchPlayers });
                                }).catch(error => {
                                    debug('Error when getting match players: ' + error);
                                    next(error);
                                });
                        }).catch(error => {
                            debug('Error when getting game: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting match: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

/* Method for getting results for a given leg */
router.get('/:id/leg', function (req, res, next) {
    axios.get('http://localhost:8001/player')
        .then(response => {
            var playersMap = response.data;
            axios.get('http://localhost:8001/match/' + req.params.id)
                .then(response => {
                    var match = response.data;
                    axios.get('http://localhost:8001/match/' + req.params.id + '/statistics')
                        .then(response => {
                            var stats = response.data;
                            axios.get('http://localhost:8001/game/' + match.game_id)
                                .then(response => {
                                    var game = response.data;
                                    res.render('match_result', { match: match, players: playersMap, stats: stats, game: game });
                                }).catch(error => {
                                    debug('Error when getting game: ' + error);
                                    next(error);
                                });
                        }).catch(error => {
                            debug('Error when getting statistics: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting match: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

/* Delete the given visit */
router.delete('/:id/leg/:visitid', function (req, res, next) {
    axios.delete('http://localhost:8001/visit/' + req.params.visitid)
        .then(() => {
            res.status(200).send().end();
        }).catch(error => {
            debug('Unable to set current player: ' + error);
            next(error);
        });
});

/* Modify the score */
router.post('/:id/leg', function (req, res, next) {
    axios.put('http://localhost:8001/visit/' + req.body.id + '/modify', req.body)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug('Error when modifying scores: ' + error);
            next(error);
        });
});

/* Method to cancel a match in progress */
router.delete('/:id/cancel', function (req, res) {
    var matchId = req.params.id;
    // TODO
});

/* Method to finalize a match */
router.post('/:id/finish', function (req, res, next) {
    axios.put('http://localhost:8001/match/' + req.params.id + '/finish', req.body)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug('Unable to finish game: ' + error);
            next(error);
        });
});

/** Method to change player order */
router.put('/:id/order', function (req, res, next) {
    axios.put('http://localhost:8001/match/' + req.params.id + '/order', req.body)
        .then(() => {
            res.status(200).end();
        }).catch(error => {
            debug('Unable to change order: %s', error);
            next(error);
        });
});

/** TODO Comments */
function renderMatchView(pugFile, req, res, next) {
    axios.get('http://localhost:8001/player')
        .then(response => {
            var playersMap = response.data;
            axios.get('http://localhost:8001/match/' + req.params.id)
                .then(response => {
                    var match = response.data;
                    axios.get('http://localhost:8001/game/' + match.game_id)
                        .then(response => {
                            var game = response.data;
                            axios.get('http://localhost:8001/match/' + req.params.id + '/players')
                                .then(response => {
                                    var matchPlayers = response.data;
                                    // Sort players based on order
                                    matchPlayers = _.sortBy(matchPlayers, (player) => player.order)
                                    res.render(pugFile, { match: match, players: playersMap, game: game, match_players: matchPlayers });
                                }).catch(error => {
                                    debug('Error when getting match players: ' + error);
                                    next(error);
                                });
                        }).catch(error => {
                            debug('Error when getting game: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting match: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
}

module.exports = function (socketHandler) {
    this.socketHandler = socketHandler;

    // Create socket.io namespaces for all matches which are currently active
    axios.get('http://localhost:8001/match/active')
        .then(response => {
            var matches = response.data;
            for (var i = 0; i < matches.length; i++) {
                socketHandler.setupNamespace(matches[i].id);
            }
        }).catch(error => {
            debug('Unable to get active matches: %s', error);
        });
    return router;
};