var debug = require('debug')('kcapp:matches');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/* Redirect requests to /matches to /matches/page/1 */
router.get('/', function (req, res) {
    res.redirect('/matches/page/1');
});

/* Get the given page of matches */
router.get('/page/:page', function (req, res, next) {
    var limit = 25;
    var start = (req.params.page - 1) * limit;

    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/match'),
        axios.get(req.app.locals.kcapp.api + '/match/' + start + '/' + limit)
    ]).then(axios.spread((players, matches, matchPage) => {
        res.render('matches', {
            matches: matchPage.data,
            players: players.data,
            total_pages: Math.ceil(matches.data.length / limit),
            page_num: req.params.page
        });
    })).catch(error => {
        debug('Error when getting data for matches ' + error);
        next(error);
    });
});

/** Continue the given match */
router.get('/:id', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/match/' + req.params.id)
        .then(response => {
            var match = response.data
            axios.put(req.app.locals.kcapp.api + '/match/' + req.params.id + '/continue')
                .then(response => {
                    var leg = response.data;
                    // TODO Do we need to setup nsp here?
                    this.socketHandler.setupLegsNamespace(leg.id);

                    // Forward all spectating clients to next leg
                    this.socketHandler.emitMessage('/legs/' + match.current_leg_id, 'leg_finished', {
                        old_leg_id: match.current_leg_id,
                        new_leg_id: leg.id
                    });
                    res.redirect('/legs/' + leg.id);
                }).catch(error => {
                    debug('Unable to continue leg: ' + error);
                    res.redirect('/match/' + req.params.id + '/result');
                });
        }).catch(error => {
            debug('Error when getting match: ' + error);
            next(error)
        });
});

/* Spectate the given match */
router.get('/:id/spectate', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/match/' + req.params.id)
    ]).then(axios.spread((players, response) => {
        var match = response.data;
        if (match.is_finished) {
            return res.redirect('/matches/' + req.params.id + "/result");
        } else {
            axios.all([
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id),
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id + '/players')
            ]).then(axios.spread((leg, legPlayers) => {
                res.render('leg/spectate', {
                    leg: leg.data,
                    leg_players: legPlayers.data,
                    players: players.data,
                    match: match
                });
            })).catch(error => {
                debug('Error when getting data for matches ' + error);
                next(error);
            });
        }
    })).catch(error => {
        debug('Error when getting data for match ' + error);
        next(error);
    });
});

/* Spectate the given match */
router.get('/:id/spectate/compact', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/match/' + req.params.id)
    ]).then(axios.spread((players, response) => {
        var match = response.data;
        if (match.is_finished) {
            return res.redirect('/matches/' + req.params.id + "/result");
        } else {
            axios.all([
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id),
                axios.get(req.app.locals.kcapp.api + '/leg/' + match.current_leg_id + '/players')
            ]).then(axios.spread((leg, legPlayers) => {
                res.render('leg/spectate_compact', {
                    leg: leg.data,
                    leg_players: legPlayers.data,
                    players: players.data,
                    match: match
                });
            })).catch(error => {
                debug('Error when getting data for matches ' + error);
                next(error);
            });
        }
    })).catch(error => {
        debug('Error when getting data for match ' + error);
        next(error);
    });
});

/* Render the results view */
router.get('/:id/result', function (req, res, next) {
    var id = req.params.id;

    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/match/' + id),
        axios.get(req.app.locals.kcapp.api + '/match/' + id + '/statistics')
    ]).then(axios.spread((playerResponse, match, statisticsResponse) => {
        var players = playerResponse.data;
        var statistics = statisticsResponse.data;
        _.each(statistics, stats => {
            stats.player_name = players[stats.player_id].name;
        });
        res.render('match_result', {
            match: match.data,
            players: players,
            stats: statistics
        });
    })).catch(error => {
        debug('Error when getting data for match result ' + error);
        next(error);
    });
});

/* Method for starting a new match */
router.post('/new', function (req, res, next) {
    var players = req.body.players;
    if (players === undefined) {
        debug('No players specified, unable to start leg');
        return res.redirect('/');
    }
    var body = {
        owe_type_id: req.body.match_stake == 0 ? null : req.body.match_stake,
        venue_id: req.body.venue,
        match_type: { id: req.body.match_type },
        match_mode: { id: req.body.match_mode },
        players: players.map(Number),
        player_handicaps: req.body.player_handicaps,
        legs: [{ starting_score: req.body.starting_score }]
    }
    axios.post(req.app.locals.kcapp.api + '/match', body)
        .then(response => {
            var match = response.data;
            this.socketHandler.setupLegsNamespace(match.current_leg_id);

            // Forward all spectating clients to next leg
            if (match.venue) {
                this.socketHandler.emitMessage('/venue/' + match.venue.id, 'venue_new_match', {
                    match_id: match.id, leg_id: match.current_leg_id
                });
                this.socketHandler.emitMessage('/active', 'new_match', {
                    match: match
                });
            }
            res.status(200).send(match).end();
        }).catch(error => {
            debug('Error when starting new match: ' + error);
            next(error);
        });
});

/* Method for starting a new match */
router.post('/:id/rematch', function (req, res, next) {
    axios.post(req.app.locals.kcapp.api + '/match/' + req.params.id + '/rematch', null)
        .then(response => {
            var match = response.data;
            this.socketHandler.setupLegsNamespace(match.current_leg_id);
            res.status(200).send(match).end();
        }).catch(error => {
            debug('Error when starting new match: ' + error);
            next(error);
        });
});

module.exports = function (socketHandler) {
    this.socketHandler = socketHandler;
    return router;
};