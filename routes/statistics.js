const debug = require('debug')('kcapp:statistics');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const moment = require('moment');
const _ = require('underscore');

const template = require('marko');
const statisticsTemplate = template.load(require.resolve('../src/pages/statistics/statistics-template.marko'));
const leaderboardTemplate = template.load(require.resolve('../src/pages/leaderboard/leaderboard-template.marko'));

/** Get statistics for all players during the given time */
router.get('/:from/:to', function (req, res, next) {
    var from = req.params.from;
    var to = req.params.to;
    getStatistics(from, to, req, res, next);
});

/** Get statistics fro the past two weeks for all players */
router.get('/weekly', function (req, res, next) {
    var from = moment().isoWeekday(1).format('YYYY-MM-DD');
    var to = moment().isoWeekday(8).format('YYYY-MM-DD');
    getStatistics(from, to, req, res, next);
});

/** Get statistics fro the past two weeks for all players */
router.get('/leaderboard', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/option/default`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/x01/player/`),
        axios.get(`${req.app.locals.kcapp.api}/leaderboard/matchtypes`)
    ]).then(axios.spread((players, offices, matchTypes, defaults, x01LeaderboardData, matchTypesLeaderboard) => {
        const x01Leaderboard = x01LeaderboardData.data;

        const kings = _.chain(x01Leaderboard)
            .groupBy('office_id')
            .mapObject(players => _.first(players).player_id)
            .value();

        _.each(x01Leaderboard, player => {
            player.isKing = kings[player.office_id] === player.player_id;
        });
        res.marko(leaderboardTemplate, {
            players: players.data,
            offices: offices.data,
            defaults: defaults.data,
            matchTypes: matchTypes.data,
            x01Leaderboard: x01Leaderboard,
            matchTypesLeaderboard: matchTypesLeaderboard.data
        });
    })).catch(error => {
        debug(`Error when getting data for leaderboard ${error}`);
        next(error);
    });
});

function getStatistics(from, to, req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/office`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/1/${from}/${to}`),
        axios.get(`${req.app.locals.kcapp.api}/statistics/office/${from}/${to}`)
    ]).then(axios.spread((players, offices, x01, office) => {
        res.marko(statisticsTemplate, {
            players: players.data,
            offices: offices.data,
            statistics_x01: x01.data,
            checkout_statistics: office.data,
            from: from, to: to,
            locals: req.app.locals
        });
    })).catch(error => {
        debug(`Error when getting data for statistics ${error}`);
        next(error);
    });
}

module.exports = router
