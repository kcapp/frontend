var debug = require('debug')('kcapp:statistics');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var moment = require('moment');
var _ = require('underscore');

var statisticsTemplate = require('../src/pages/statistics/statistics-template.marko');

/** Get statistics for all players during the given time */
router.get('/:from/:to/old', function (req, res, next) {
    var from = req.params.from;
    var to = req.params.to;
    getStatistics(from, to, req, res, next);
});

/** Get statistics fro the past two weeks for all players */
router.get('/weekly/old', function (req, res, next) {
    var from = moment().isoWeekday(1).format('YYYY-MM-DD');
    var to = moment().isoWeekday(7).format('YYYY-MM-DD');
    getStatistics(from, to, req, res, next);
});

function getStatistics(from, to, req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/statistics/x01/' + from + '/' + to),
        axios.get(req.app.locals.kcapp.api + '/statistics/shootout/' + from + '/' + to)
    ]).then(axios.spread((players, x01, shootout) => {
        x01 = x01.data;
        x01.from = from
        x01.to = to

        shootout = shootout.data;
        shootout.from = from;
        shootout.to = to;
        shootout = sort(shootout);

        res.render('weekly_statistics', {
            players: players.data,
            statistics_x01: x01,
            statistics_shootout: shootout
        });
    })).catch(error => {
        debug('Error when getting data for statistics ' + error);
        next(error);
    });
}

/** Get statistics for all players during the given time */
router.get('/:from/:to', function (req, res, next) {
    var from = req.params.from;
    var to = req.params.to;
    getStatisticsMarko(from, to, req, res, next);
});

/** Get statistics fro the past two weeks for all players */
router.get('/weekly', function (req, res, next) {
    var from = moment().isoWeekday(1).format('YYYY-MM-DD');
    var to = moment().isoWeekday(7).format('YYYY-MM-DD');
    getStatisticsMarko(from, to, req, res, next);
});

function getStatisticsMarko(from, to, req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/statistics/x01/' + from + '/' + to),
        axios.get(req.app.locals.kcapp.api + '/statistics/shootout/' + from + '/' + to)
    ]).then(axios.spread((players, x01, shootout) => {
        x01 = x01.data;
        shootout = shootout.data;
        shootout = sort(shootout);

        res.marko(statisticsTemplate, {
            players: players.data,
            statistics_x01: x01,
            statistics_shootout: shootout,
            from: from, to: to
        });
    })).catch(error => {
        debug('Error when getting data for statistics ' + error);
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