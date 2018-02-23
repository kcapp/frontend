var debug = require('debug')('kcapp:statistics');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var moment = require('moment');
var _ = require('underscore');

/** Get statistics for all players during the given time */
router.get('/:from/:to', function (req, res, next) {
    var from = req.params.from;
    var to = req.params.to;
    axios.get('http://localhost:8001/player')
        .then(response => {
            var playersMap = response.data;
            axios.get('http://localhost:8001/statistics/x01/' + from + '/' + to)
                .then(response => {
                    var statistics = response.data;
                    statistics = sort(statistics);
                    statistics.from = from
                    statistics.to = to
                    res.render('weekly_statistics', { players: playersMap, statistics: statistics });
                }).catch(error => {
                    debug('Error when getting player statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

/** Get statistics fro the past two weeks for all players */
router.get('/weekly', function (req, res, next) {
    var from = moment().isoWeekday(1).format('YYYY-MM-DD');
    var to = moment().isoWeekday(7).format('YYYY-MM-DD');
    axios.get('http://localhost:8001/player')
        .then(response => {
            var playersMap = response.data;
            axios.get('http://localhost:8001/statistics/x01/' + from + '/' + to)
                .then(response => {
                    var statistics = response.data;
                    statistics = sort(statistics);
                    statistics.from = from
                    statistics.to = to
                    res.render('weekly_statistics', { players: playersMap, statistics: statistics });
                }).catch(error => {
                    debug('Error when getting player statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
});

function sort(statistics) {
    statistics = _.sortBy(statistics, (stats) => stats.player_id);
    statistics = _.sortBy(statistics, (stats) => {
        if (stats.games_won === undefined) {
            return 0;
        }
        return -(stats.games_won / stats.games_played)
    });
    return statistics;
}

module.exports = router