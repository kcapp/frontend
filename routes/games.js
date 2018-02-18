var debug = require('debug')('kcapp:games');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Get a list of all games */
router.get('/', function(req, res, next) {
	axios.get('http://localhost:8001/game')
        .then(response => {
            var games = response.data;
			axios.get('http://localhost:8001/player')
				.then(response => {
					var players = response.data;
					res.render('games', { games: games, players: players });
				})
				.catch(error => {
                    debug('Error when getting players: ' + error);
                    next(error);
					helper.renderError(res, error);
	            });
		}).catch(error => {
            debug('Error when getting games: ' + error);
            next(error)
		});
});


/** Continue the given game */
router.get('/:id', function (req, res, next) {
    axios.get('http://localhost:8001/game/' + req.params.id)
        .then(response => {
			var game = response.data
			axios.put('http://localhost:8001/game/' + req.params.id + '/continue')
				.then(response => {
					var match = response.data;
					// TODO Do we need to setup nsp here?
					socketHandler.setupNamespace(match.id);

					// Forward all spectating clients to next match
					socketHandler.emitMessage(game.current_match_id, 'match_finished', {
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
	axios.get('http://localhost:8001/game/' + req.params.id)
	.then(response => {
		var game = response.data;
		res.redirect('/match/' + game.current_match_id + '/spectate');
	  }).catch(error => {
	    debug('Error when getting game: ' + error);
		next(error);
	  });
});

/* Render the results view */
router.get('/:id/results', function (req, res, next) {
	var id = req.params.id;
	axios.get('http://localhost:8001/game/' + id)
        .then(response => {
			var game = response.data;
		    axios.get('http://localhost:8001/player')
			    .then(response => {
				    var players = response.data;
				    axios.get('http://localhost:8001/game/' + id + '/statistics')
						.then(response => {
						    var stats = response.data;
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
	if (players.constructor !== Array) {
		// If this is only a single player players is sent as a String, so make it an
		// array so that we select from the array instead of a substring below
		players = [ players ];
	}
	var body = {
		owe_type_id: req.body.game_stake == 0 ? null : parseInt(req.body.game_stake),
		game_type: { id: parseInt(req.body.game_type) },
		players: players.map(Number),
		matches: [ { starting_score: parseInt(req.body.starting_score) }]
	}
	axios.post('http://localhost:8001/game', body)
        .then(response => {
			var game = response.data;
			socketHandler.setupNamespace(game.current_match_id);
			res.redirect('/matches/' + game.current_match_id);
		}).catch(error => {
            debug('Error when getting statistics: ' + error);
            next(error);
		});
});


module.exports = function (socketHandler) {
	this.socketHandler = socketHandler;
	return router;
};