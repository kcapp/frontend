var debug = require('debug')('kcapp:venue');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/** Spectate a given venue */
router.get('/:id/spectate', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/venue/' + req.params.id)
        .then(response => {
            var venue = response.data;
            axios.get(req.app.locals.kcapp.api + '/venue/' + req.params.id + '/spectate')
                .then(response => {
                    var match = response.data;

                    if (match.length > 0) {
                        match = match[0];
                        axios.get(req.app.locals.kcapp.api + '/player')
                            .then(response => {
                                var playersMap = response.data;
                                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id)
                                    .then(response => {
                                        var leg = response.data;
                                        axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id + '/players')
                                            .then(response => {
                                                var legPlayers = response.data;
                                                res.render('venue_spectate', {
                                                    live_match: true, leg: leg, players: playersMap, match: match,
                                                    leg_players: legPlayers, venue: venue
                                                });
                                            }).catch(error => {
                                                debug('Error when getting leg players: ' + error);
                                                next(error);
                                            });
                                    }).catch(error => {
                                        debug('Error when getting leg: ' + error);
                                        next(error);
                                    });
                            }).catch(error => {
                                debug('Error when getting players: ' + error);
                                next(error);
                            });
                    }
                    else {
                        res.render('venue_spectate', {
                            live_match: false, leg: { is_finished: true }, players: {}, match: {},
                            leg_players: [], venue: venue
                        });
                    }
                }).catch(error => {
                    debug('Error when spectating venue: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting venue: ' + error);
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
