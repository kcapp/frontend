var debug = require('debug')('kcapp:tournaments');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/** Get all tournaments */
router.get('/', function (req, res, next) {
    console.log('dupa');
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/tournament'),
        axios.get(req.app.locals.kcapp.api + '/tournament/standings')
    ]).then(axios.spread((tournaments, standings) => {
        res.render('tournaments', {
            tournaments: tournaments.data, standings: standings.data
        });
    })).catch(error => {
        debug('Error when getting data for tournament ' + error);
        next(error);
    });
});

/* Get tournament with the given ID */
router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/overview'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/matches'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/statistics')
    ]).then(axios.spread((players, tournament, overview, matches, statisticsResponse) => {
        var statistics = statisticsResponse.data;
        if (!_.isEmpty(statistics)) {
            statistics.checkout_highest = _.sortBy(statistics.checkout_highest, (stats) => -stats.value);
            statistics.best_ppd = _.sortBy(statistics.best_ppd, (stats) => -stats.value);
            statistics.best_first_nine_ppd = _.sortBy(statistics.best_first_nine_ppd, (stats) => -stats.value);
            if (statistics.best_301_darts_thrown) {
                statistics.best_301_darts_thrown = _.sortBy(statistics.best_301_darts_thrown, (stats) => stats.value);
            }
            if (statistics.best_501_darts_thrown) {
                statistics.best_501_darts_thrown = _.sortBy(statistics.best_501_darts_thrown, (stats) => stats.value);
            }
        }

        var bracket = {
            "eightfinals": [
                {
                    "home": "EF1",
                    "away": "EF2",
                    "home_score": 2,
                    "away_score": 0
                },
                {
                    "home": "EF3",
                    "away": "EF4",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "EF5",
                    "away": "EF6",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "EF7",
                    "away": "EF8",
                    "home_score": 2,
                    "away_score": 0
                },
                {
                    "home": "EF9",
                    "away": "EF10",
                    "home_score": 2,
                    "away_score": 0
                },
                {
                    "home": "EF11",
                    "away": "EF12",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "EF13",
                    "away": "EF14",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "EF15",
                    "away": "EF16",
                    "home_score": 2,
                    "away_score": 0
                }
            ],
            "quarterfinals": [
                {
                    "home": "QF1",
                    "away": "QF2",
                    "home_score": 2,
                    "away_score": 0
                },
                {
                    "home": "QF3",
                    "away": "QF4",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "QF5",
                    "away": "QF6",
                    "home_score": 1,
                    "away_score": 2
                },
                {
                    "home": "QF7",
                    "away": "QF8",
                    "home_score": 2,
                    "away_score": 0
                }
            ],
            "semifinals": [
                {
                    "home": "SF1",
                    "away": "SF2",
                    "home_score": 3,
                    "away_score": 2
                },
                {
                    "home": "SF3",
                    "away": "SF4",
                    "home_score": 0,
                    "away_score": 3
                }
            ],
            "finals": [
                {
                    "home": "F1",
                    "away": "F2",
                    "home_score": 2,
                    "away_score": 3
                }
            ]
        };

        res.render('tournament', {
            bracket: bracket, tournament: tournament.data, overview: overview.data,
            players: players.data, matches: matches.data, statistics: statistics
        });
    })).catch(error => {
        debug('Error when getting data for tournament ' + error);
        next(error);
    });
});

module.exports = router
