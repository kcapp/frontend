const debug = require('debug')('kcapp:elo');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');

const template = require('marko');
const eloTemplate = template.load(require.resolve('../src/pages/elo/elo-template.marko'));

/** Get elo */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/player`),
        axios.get(`${req.app.locals.kcapp.api}/tournament/standings`),
        axios.get(`${req.app.locals.kcapp.api}/office`)
    ]).then(axios.spread((players, standings, offices) => {
        const general = JSON.parse(JSON.stringify(standings.data));
        general.sort((player1, player2) => player2.current_elo - player1.current_elo );

        const tournamentData = standings.data;
        const tournament = [];
        for (let i = 0; i< tournamentData.length; i++) {
            const standing = tournamentData[i];
            if (standing.elo_matches >= 5) {
                tournament.push(standing);
            }
        }
        res.marko(eloTemplate, {
            players: players.data,
            tournament: tournament,
            offices: offices.data,
            general: general,
        });
    })).catch(error => {
        debug(`Error when getting data for elo ${error}`);
        next(error);
    });
});

module.exports = router
