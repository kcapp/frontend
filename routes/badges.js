const debug = require('debug')('kcapp:badges');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');

const template = require('marko');
const badgeTemplate = template.load(require.resolve('../src/pages/badge-details/badge-details-template.marko'));
const badgesTemplate = template.load(require.resolve('../src/pages/badges/badges-template.marko'));

/** Get Badges */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/badge`),
        axios.get(`${req.app.locals.kcapp.api}/badge/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/player`)
    ]).then(axios.spread((badgesData, statistics, players) => {
        const badges = badgesData.data;
        const badgesNew = [];
        for (let i = 0; i < badges.length; i++) {
            const badge = badges[i];
            if (badge.levels) {
                const levels = [];
                for (let j = 1; j < badge.levels; j++) {
                    const copy = { ...badge };
                    copy.level = j+1;
                    levels.push(copy);
                }
                badgesNew.push(...levels);
            }
        }

        badges.push(...badgesNew);
        res.marko(badgesTemplate, {
            badges: badges,
            statistics: statistics.data,
            players: players.data,
        });
    })).catch(error => {
        debug(`Error when getting data for badges ${error}`);
        next(error);
    });
});

router.get('/:id', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/badge/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/badge/${req.params.id}/statistics`),
        axios.get(`${req.app.locals.kcapp.api}/tournament`),
        axios.get(`${req.app.locals.kcapp.api}/player`)
    ]).then(axios.spread((badge, statisticsData, tournaments, players) => {
        const level = req.query.level;
        let statistics = statisticsData.data;
        if (level) {
            statistics = statistics.filter((statistic) => statistic.level == level);
        }
        res.marko(badgeTemplate, {
            badge: badge.data,
            statistics: statistics,
            tournaments: tournaments.data,
            players: players.data,
        });
    })).catch(error => {
        debug(`Error when getting data for badges ${error}`);
        next(error);
    });
});

module.exports = router
