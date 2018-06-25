var debug = require('debug')('kcapp:venue');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/** Spectate a given venue */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/venue/' + req.params.id),
        axios.get(req.app.locals.kcapp.api + '/venue/' + req.params.id + '/spectate')
    ]).then(axios.spread((venueResponse, spectateResponse) => {
        var venue = venueResponse.data;
        var match = spectateResponse.data;

        if (match.length > 0) {
            match = match[0];

            axios.all([
                axios.get(req.app.locals.kcapp.api + '/player'),
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id),
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id + '/players')
            ]).then(axios.spread((playerResponse, legResponse, legPlayersResponse) => {
                res.render('venue_spectate', {
                    live_match: true, venue: venue, match: match,
                    leg: legResponse.data,
                    players: playerResponse.data,
                    leg_players: legPlayersResponse.data
                });
            })).catch(error => {
                debug('Error when getting data for venue spectate ' + error);
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
        debug('Error when getting data for venue spectate ' + error);
        next(error);
    });
});

module.exports = function (app, socketHandler) {
    this.socketHandler = socketHandler;

    // Create socket.io namespaces for all venues
    axios.get(app.locals.kcapp.api + '/venue')
        .then(response => {
            var venues = response.data;
            for (var i = 0; i < venues.length; i++) {
                this.socketHandler.setupVenueNamespace(venues[i].id);
            }
        }).catch(error => {
            debug('Unable to get venues: %s', error);
        });
    return router;
};
