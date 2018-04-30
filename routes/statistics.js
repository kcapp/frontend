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
    getStatistics(from, to, req, res, next);
});

/** Get statistics fro the past two weeks for all players */
router.get('/weekly', function (req, res, next) {
    var from = moment().isoWeekday(1).format('YYYY-MM-DD');
    var to = moment().isoWeekday(7).format('YYYY-MM-DD');
    getStatistics(from, to, req, res, next);
});

function getStatistics(from, to, req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player')
        .then(response => {
            var playersMap = response.data;
            axios.get(req.app.locals.kcapp.api + '/statistics/x01/' + from + '/' + to)
                .then(response => {
                    var statisticsX01 = response.data;
                    //statisticsX01 = sort(statisticsX01);
                    statisticsX01.from = from
                    statisticsX01.to = to
                    axios.get(req.app.locals.kcapp.api + '/statistics/shootout/' + from + '/' + to)
                        .then(response => {
                            var statisticsShootout = response.data;
                            statisticsShootout = sort(statisticsShootout);
                            res.render('weekly_statistics', { players: playersMap, statistics_x01: statisticsX01, statistics_shootout: statisticsShootout });
                        }).catch(error => {
                            debug('Error when getting shootout statistics: ' + error);
                            next(error);
                        });
                }).catch(error => {
                    debug('Error when getting x01 statistics: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
            next(error);
        });
}

function sort(statistics) {
    statistics = _.sortBy(statistics, (stats) => stats.player_id);
    statistics = _.sortBy(statistics, (stats) => {
        if (stats.matches_won === undefined) {
            return 0;
        }
        return -(stats.matches_won / stats.matches_played)
    });
    return statistics;
}

module.exports = router