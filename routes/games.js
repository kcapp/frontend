var debug = require('debug')('kcapp:games');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Redirect requests to /games to /games/1 */
router.get('/', function (req, res) {
    res.redirect('/games/page/1');
});

/* Get the given page of games */
router.get('/page/:page', function (req, res, next) {
    var limit = 25;
    var start = (req.params.page - 1) * limit;
    axios.get(req.app.locals.kcapp.api + '/game')
        .then(response => {
            var total = Math.ceil(response.data.length / limit);
            axios.get(req.app.locals.kcapp.api + '/player')
                .then(response => {
                    var players = response.data;
                    axios.get(req.app.locals.kcapp.api + '/game/' + start + '/' + limit)
                        .then(response => {
                            var games = response.data;
                            res.render('games', {
                                games: games, players: players,
                                total_pages: total, page_num: req.params.page
                            });
                        })
                        .catch(error => {
                            debug('Error when getting games: ' + error);
                            next(error);
                        });
                })
                .catch(error => {
                    debug('Error when getting players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting games: ' + error);
            next(error);
        });
});

/** Continue the given game */
router.get('/:id', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/game/' + req.params.id)
        .then(response => {
            var game = response.data
            axios.put(req.app.locals.kcapp.api + '/game/' + req.params.id + '/continue')
                .then(response => {
                    var match = response.data;
                    // TODO Do we need to setup nsp here?
                    this.socketHandler.setupNamespace(match.id);

                    // Forward all spectating clients to next match
                    this.socketHandler.emitMessage(game.current_match_id, 'match_finished', {
                        old_match_id: game.current_match_id,
                        new_match_id: match.id
                    });
                    res.redirect('/matches/' + match.id);
                }).catch(error => {
                    debug('Unable to continue match: ' + error);
                    res.redirect('/game/' + req.params.id + '/results');
                });
        }).catch(error => {
            debug('Error when getting game: ' + error);
            next(error)
        });
});

/* Spectate the given game */
router.get('/:id/spectate', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/game/' + req.params.id)
        .then(response => {
            var game = response.data;
            res.redirect('/matches/' + game.current_match_id + '/spectate');
        }).catch(error => {
            debug('Error when getting game: ' + error);
            next(error);
        });
});

/* Render the results view */
router.get('/:id/results', function (req, res, next) {
    var id = req.params.id;
    axios.get(req.app.locals.kcapp.api + '/game/' + id)
        .then(response => {
            var game = response.data;
            axios.get(req.app.locals.kcapp.api + '/player')
                .then(response => {
                    var players = response.data;
                    axios.get(req.app.locals.kcapp.api + '/game/' + id + '/statistics')
                        .then(response => {
                            var stats = response.data;
                            _.each(stats, stat => {
                                stat.player_name = players[stat.player_id].name;
                            });
                            res.render('game_result', { game: game, players: players, stats: stats });
                        }).catch(error => {
                            debug('Error when getting statistics: ' + error);
                            next(error)
                        });
                }).catch(error => {
                    debug('Error when getting players: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting game: ' + error);
            next(error);
        });
});

/* Method for starting a new game */
router.post('/new', function (req, res, next) {
    var players = req.body.players;
    if (players === undefined) {
        debug('No players specified, unable to start match');
        return res.redirect('/');
    }
    var body = {
        owe_type_id: req.body.game_stake == 0 ? null : req.body.game_stake,
        game_type: { id: req.body.game_type },
        game_mode: { id: req.body.game_mode },
        players: players.map(Number),
        player_handicaps: req.body.player_handicaps,
        matches: [{ starting_score: req.body.starting_score }]
    }
    axios.post(req.app.locals.kcapp.api + '/game', body)
        .then(response => {
            var game = response.data;
            this.socketHandler.setupNamespace(game.current_match_id);
            res.status(200).send(game).end();
        }).catch(error => {
            debug('Error when starting new game: ' + error);
            next(error);
        });
});

module.exports = function (socketHandler) {
    this.socketHandler = socketHandler;
    return router;
};