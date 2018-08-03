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
        res.render('elo', {
            standings: standings.data
        });
    })).catch(error => {
        debug('Error when getting data for elo ' + error);
        next(error);
    });
});

module.exports = router
