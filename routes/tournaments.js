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

                                    /*var bracket = {
                                        "qualifying": {
                                            "home": "Qualify1",
                                            "away": "Qualify2",
                                            "home_score": 2,
                                            "away_score": 3
                                        },
                                        "elimination": {
                                            "home": "Elim1",
                                            "away": "Elim2",
                                            "home_score": 0,
                                            "away_score": 0
                                        },
                                        "majorsemi": {
                                            "home": "Major1",
                                            "away": "Major2",
                                            "home_score": 0,
                                            "away_score": 0
                                        },
                                        "minorsemi": {
                                            "home": "Minor1",
                                            "away": "Minor2",
                                            "home_score": 0,
                                            "away_score": 0
                                        },
                                        "preliminary": {
                                            "home": "PF1",
                                            "away": "PF2",
                                            "home_score": 0,
                                            "away_score": 0
                                        },
                                        "grand": {
                                            "home": "GF1",
                                            "away": "GF2",
                                            "home_score": 0,
                                            "away_score": 0
                                        }
                                    };*/

                                    res.render('tournament', {
                                        bracket: bracket, tournament: tournament, statistics: statistics, players: players, matches: matches
                                    });
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
