var debug = require('debug')('kcapp:matches');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Redirect requests to /matches to /matches/page/1 */
router.get('/', function (req, res) {
    res.redirect('/matches/page/1');
});

/* Get the given page of matches */
router.get('/page/:page', function (req, res, next) {
    var limit = 25;
    var start = (req.params.page - 1) * limit;
    axios.get(req.app.locals.kcapp.api + '/match')
        .then(response => {
            var total = Math.ceil(response.data.length / limit);
            axios.get(req.app.locals.kcapp.api + '/player')
                .then(response => {
                    var players = response.data;
                    axios.get(req.app.locals.kcapp.api + '/match/' + start + '/' + limit)
                        .then(response => {
                            var matches = response.data;
                            res.render('matches', {
                                matches: matches, players: players,
                                total_pages: total, page_num: req.params.page
                            });
                        })
                        .catch(error => {
                            debug('Error when getting matches: ' + error);
                            next(error);
                        });
                })
                .catch(error => {
                    debug('Error when getting players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting matches: ' + error);
            next(error);
        });
});

/** Continue the given match */
router.get('/:id', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/match/' + req.params.id)
        .then(response => {
            var match = response.data
            axios.put(req.app.locals.kcapp.api + '/match/' + req.params.id + '/continue')
                .then(response => {
                    var leg = response.data;
                    // TODO Do we need to setup nsp here?
                    this.socketHandler.setupNamespace(leg.id);

                    // Forward all spectating clients to next leg
                    this.socketHandler.emitMessage(match.current_leg_id, 'leg_finished', {
                        old_leg_id: match.current_leg_id,
                        new_leg_id: leg.id
                    });
                    res.redirect('/legs/' + leg.id);
                }).catch(error => {
                    debug('Unable to continue leg: ' + error);
                    res.redirect('/match/' + req.params.id + '/result');
                });
        }).catch(error => {
            debug('Error when getting match: ' + error);
            next(error)
        });
});

/* Spectate the given match */
router.get('/:id/spectate', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/match/' + req.params.id)
        .then(response => {
            var match = response.data;
            res.redirect('/legs/' + match.current_leg_id + '/spectate');
        }).catch(error => {
            debug('Error when getting match: ' + error);
            next(error);
        });
});

/* Render the results view */
router.get('/:id/result', function (req, res, next) {
    var id = req.params.id;
    axios.get(req.app.locals.kcapp.api + '/match/' + id)
        .then(response => {
            var match = response.data;
            axios.get(req.app.locals.kcapp.api + '/player')
                .then(response => {
                    var players = response.data;
                    axios.get(req.app.locals.kcapp.api + '/match/' + id + '/statistics')
                        .then(response => {
                            var stats = response.data;
                            _.each(stats, stat => {
                                stat.player_name = players[stat.player_id].name;
                            });
                            res.render('match_result', { match: match, players: players, stats: stats });
                        }).catch(error => {
                            debug('Error when getting statistics: ' + error);
                            next(error)
                        });
                }).catch(error => {
                    debug('Error when getting players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting match: ' + error);
            next(error);
        });
});

/* Method for starting a new match */
router.post('/new', function (req, res, next) {
    var players = req.body.players;
    if (players === undefined) {
        debug('No players specified, unable to start leg');
        return res.redirect('/');
    }
    var body = {
        owe_type_id: req.body.match_stake == 0 ? null : req.body.match_stake,
        match_type: { id: req.body.match_type },
        match_mode: { id: req.body.match_mode },
        players: players.map(Number),
        player_handicaps: req.body.player_handicaps,
        legs: [{ starting_score: req.body.starting_score }]
    }
    axios.post(req.app.locals.kcapp.api + '/match', body)
        .then(response => {
            var match = response.data;
            this.socketHandler.setupNamespace(match.current_leg_id);
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