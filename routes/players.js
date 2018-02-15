var debug = require('debug')('kcapp:players');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Get a list of all players */
router.get('/', function (req, res, next) {
	axios.get('http://localhost:8001/player')
		.then(response => {
			var players = response.data;
			players = _.sortBy(players, (player) => player.name )
			res.render('players', { players: players });
		}).catch(error => {
		    debug('Error when getting players: ' + error);
			next(error);
		});
});

/* Add a new player */
router.post('/', function (req, res, next) {
	axios.post('http://localhost:8001/player', req.body)
		.then(function (response) {
			res.redirect('/players');
		}).catch(function (error) {
	    	debug('Error when adding new player: ' + error);
			next(error);
		});
});

/* Get specific statistics for a given player */
router.get('/:id/statistics', function(req, res, next) {
	var playerId = req.params.id;
	axios.get('http://localhost:8001/player/' + playerId)
		.then(function (response) {
			var player = response.data;
			axios.get('http://localhost:8001/player/' + playerId + '/statistics')
				.then(response => {
					var statistics = response.data;
					res.render('player', { player: player, statistics: statistics });
				}).catch(error => {
			    	debug('Error when getting player statistics: ' + error);
					next(error);
				});
		}).catch(function (error) {
			debug('Error when getting player: ' + error);
			next(error);
		});
});

/* Get comparable statistics for the given players */
router.get('/compare', function (req, res, next) {
	var playerIds = req.query.player_id;
	debug('Comparing players %s', playerIds);

	axios.get('http://localhost:8001/player')
		.then(function (response) {
			var players = response.data;
			axios.get('http://localhost:8001/player/compare?id=' + playerIds.join("&id="))
				.then(response => {
					var statistics = response.data;
					res.render('players_comparison', { players: players, statistics: statistics });
				}).catch(error => {
			    	debug('Error when comparing players: ' + error);
					next(error);
				});
		}).catch(function (error) {
			debug('Error when getting players: ' + error);
			next(error);
		});
});

module.exports = router