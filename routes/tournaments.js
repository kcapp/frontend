var debug = require('debug')('kcapp:tournaments');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

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
                generateBrackets(metadataResponse.data, matchesResponse.data, players, (brackets) => {
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
            generateBrackets(metadata, matches, players, (brackets) => {
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

function generateBrackets(metadata, matches, players, callback) {
    fs.readFile('public/images/bracket.svg', 'utf-8', function (err, data) {
        if (err) {
            debug('Error when reading SVG ' + err);
            return;
        }
        var bracketSVG = new DOMParser().parseFromString(data, 'text/xml');
        var doc = _.clone(bracketSVG);
        var groupedMetadata = _.groupBy(metadata, (obj) => obj.tournament_group.id);

        var matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }

        var brackets = {};
        for (var group in groupedMetadata) {
            var matchMetadatas = groupedMetadata[group];

            for (var i = 0; i < matchMetadatas.length; i++) {
                var matchMetadata = matchMetadatas[i];
                var match = matchesMap[matchMetadata.match_id];
                var wins = _.countBy(match.legs_won);
                var prefix = matchMetadata.match_displayname.toLowerCase().replace(" ", "_");

                var preliminaryFinal = doc.getElementById("prelimination_final_show");
                if (group == 12) {
                    preliminaryFinal.setAttribute("opacity", "1.0");
                } else {
                    preliminaryFinal.setAttribute("opacity", "0.0");
                }
                var home = matchMetadata.player_home;
                var away = matchMetadata.player_away;

                doc.getElementById(prefix + "_player_home").childNodes[0].data = players[home].name;
                doc.getElementById(prefix + "_player_away").childNodes[0].data = players[away].name;
                doc.getElementById(prefix + "_player_home_score").childNodes[0].data = wins[home] ? "" + wins[home] : "0";
                doc.getElementById(prefix + "_player_away_score").childNodes[0].data = wins[away] ? "" + wins[away] : "0";
                doc.getElementById(prefix + "_current_match").setAttribute("opacity", "0.0");
            }
            brackets[group] = new XMLSerializer().serializeToString(doc);
        }
        callback(brackets);
    });
}

module.exports = router;