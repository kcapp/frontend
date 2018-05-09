var debug = require('debug')('kcapp:tournaments');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/** Get all tournaments */
router.get('/', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/tournament')
        .then(response => {
            var tournaments = response.data;
            res.render('tournaments', { tournaments: tournaments });
        }).catch(error => {
            debug('Error when getting tournaments: ' + error);
            next(error);
        });
});

/* Get tournament with the given ID */
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    axios.get(req.app.locals.kcapp.api + '/tournament/' + id)
        .then(response => {
            var tournament = response.data;
            axios.get(req.app.locals.kcapp.api + '/tournament/' + id + '/statistics')
                .then(response => {
                    var statistics = response.data;
                    axios.get(req.app.locals.kcapp.api + '/player')
                        .then(response => {
                            var players = response.data;
                            axios.get(req.app.locals.kcapp.api + '/tournament/' + id + '/matches')
                                .then(response => {
                                    var matches = response.data;
                                    res.render('tournament', { tournament: tournament, statistics: statistics, players: players, matches: matches });
                                }).catch(error => {
                                    debug('Error when getting players: ' + error);
                                    next(error);
                                });
                        }).catch(error => {
                            debug('Error when getting players: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting tournament statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting tournament: ' + error);
            next(error);
        });
});

module.exports = router
