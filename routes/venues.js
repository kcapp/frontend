const debug = require('debug')('kcapp:venue');

const express = require('express');
const router = express.Router();

const _ = require('underscore');
const axios = require('axios');

const template = require('marko');
const venueSpectateTemplate = template.load(require.resolve('../src/pages/venue-spectate/venue-spectate-template.marko'));

/* Add a new venue */
router.post('/', function (req, res, next) {
    axios.post(`${req.app.locals.kcapp.api}/venue`, req.body)
        .then(() => {
            res.redirect('/offices');
        }).catch(error => {
            debug(`Error when adding new venue: ${error}`);
            next(error);
        });
});

/* Edit venue */
router.put('/:id', function (req, res, next) {
    axios.put(`${req.app.locals.kcapp.api}/venue/${req.params.id}`, req.body)
        .then(() => {
            res.redirect(303, '/offices');
        }).catch(error => {
            debug(`Error when editing venue: ${error}`);
            next(error);
        });
});

/** Spectate a given venue */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/venue/${req.params.id}`),
        axios.get(`${req.app.locals.kcapp.api}/venue/${req.params.id}/spectate`)
    ]).then(axios.spread((venueResponse, spectateResponse) => {
        const venue = venueResponse.data;
        let match = spectateResponse.data;

        if (match.length > 0) {
            match = match[0];

            axios.all([
                axios.get(`${req.app.locals.kcapp.api}/player`),
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}`),
                axios.get(`${req.app.locals.kcapp.api}/leg/${match.current_leg_id}/players`)
            ]).then(axios.spread((playerResponse, legResponse, legPlayersResponse) => {
                const legPlayers = _.sortBy(legPlayersResponse.data, (player) => player.order)
                res.marko(venueSpectateTemplate, {
                    leg: legResponse.data,
                    leg_players: legPlayers,
                    players: playerResponse.data,
                    match: match,
                    venue: venue
                });
            })).catch(error => {
                debug(`Error when getting data for venue spectate ${error}`);
                next(error);
            });
        }
        else {
            res.render('venue_spectate', {
                live_match: false, leg: { is_finished: true }, players: {}, match: {},
                leg_players: [], venue: venue
            });
        }
    })).catch(error => {
        debug(`Error when getting data for venue spectate ${error}`);
        next(error);
    });
});

module.exports = function (app, socketHandler) {
    this.socketHandler = socketHandler;

    // Create socket.io namespaces for all venues
    axios.get(`${app.locals.kcapp.api}/venue`)
        .then(response => {
            const venues = response.data;
            for (let i = 0; i < venues.length; i++) {
                this.socketHandler.setupVenueNamespace(venues[i].id);
            }
        }).catch(error => {
            debug('Unable to get venues: %s', error);
        });
    return router;
};
