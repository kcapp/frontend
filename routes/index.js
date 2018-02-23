var debug = require('debug')('kcapp:index');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* GET home page. */
router.get('/', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var players = response.data
            players = _.sortBy(players, (player) => player.name);
            axios.get(req.app.locals.kcapp.api + '/gametype')
                .then(response => {
                    var gameTypes = response.data;
                    axios.get(req.app.locals.kcapp.api + '/owetype')
                        .then(response => {
                            var oweTypes = response.data;
                            res.render('index', { players: players, game_types: gameTypes, owe_types: oweTypes });
                        }).catch(error => {
                            debug('Error when getting owe types: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting game types: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting match players: ' + error);
            next(error);
        });
});

module.exports = router;