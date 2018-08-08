var debug = require('debug')('kcapp:elo');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var _ = require('underscore');

/** Get elo */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/tournament/standings')
    ]).then(axios.spread((standings) => {
        var currentStandings = JSON.parse(JSON.stringify(standings.data));
        currentStandings.sort(function(a, b) { 
            return b.current_elo - a.current_elo;
        });
        res.render('elo', {
            standings: standings.data,
            currentStandings: currentStandings,
        });
    })).catch(error => {
        debug('Error when getting data for elo ' + error);
        next(error);
    });
});

module.exports = router
