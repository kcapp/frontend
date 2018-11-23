var debug = require('debug')('kcapp:tournaments');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');
var bracket = require('./lib/bracket_generator');

/** Get all tournaments */
router.get('/', function (req, res, next) {
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

/* Get current active tournament */
router.get('/current', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/tournament/current')
        .then((response) => {
            res.redirect("/tournaments/" + response.data.id);
        }).catch(error => {
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
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/statistics'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/metadata')
    ]).then(axios.spread((playersResponse, tournamentResponse, overviewData, matchesData, statisticsResponse, metadataResponse) => {
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

        var matches = matchesData.data;
        var metadata = _.sortBy(metadataResponse.data, 'order_of_play');
        var players = playersResponse.data;
        var tournament = tournamentResponse.data;

        var overview = overviewData.data;
        for (var groupId in overview) {
            var group = overview[groupId];
            // Sort players by points earned
            group.sort((p1, p2) => p2.points - p1.points);

            // Calculate rank for each player
            var rank = 0;
            for (var i = 0; i < group.length; i++) {
                var current = group[i];
                var prev = group[i - 1];

                if (prev && prev.points == current.points && prev.legs_difference === current.legs_difference) {
                    current.rank = prev.rank;
                } else {
                    current.rank = rank + 1;
                }
                rank++;
            }
        }
        if (tournament.playoffs_tournament_id !== null) {
            axios.all([
                axios.get(req.app.locals.kcapp.api + '/tournament/' + tournament.playoffs_tournament_id + '/matches'),
                axios.get(req.app.locals.kcapp.api + '/tournament/' + tournament.playoffs_tournament_id + '/metadata')
            ]).then(axios.spread((matchesResponse, metadataResponse) => {
                bracket.generate(metadataResponse.data, matchesResponse.data, players, '', (brackets) => {
                    res.render('tournament/tournament', {
                        brackets: brackets, tournament: tournament, overview: overview,
                        players: players, matches: matches, statistics: statistics
                    });
                });
            })).catch(error => {
                debug('Error when getting data for tournament ' + error);
                next(error);
            });
        } else {
            bracket.generate(metadata, matches, players, '', (brackets) => {
                res.render('tournament/tournament', {
                    brackets: brackets, tournament: tournament, overview: overview,
                    players: players, matches: matches, statistics: statistics
                });
            })
        }
    })).catch(error => {
        debug('Error when getting data for tournament ' + error);
        next(error);
    });
});

/* Get tournament with the given ID */
router.get('/:id/schedule', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/metadata'),
        axios.get(req.app.locals.kcapp.api + '/tournament/' + req.params.id + '/matches')
    ]).then(axios.spread((players, tournament, metadataData, matchesData) => {
        var matches = matchesData.data;
        var metadata = metadataData.data;

        var matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }

        metadata = _.sortBy(metadata, 'order_of_play');
        res.render('tournament/schedule', {
            tournament: tournament.data, players: players.data, metadata: metadata, matches: matchesMap
        });
    })).catch(error => {
        debug('Error when getting data for tournament ' + error);
        next(error);
    });
});

module.exports = router;