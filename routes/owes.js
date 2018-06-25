var debug = require('debug')('kcapp:owes');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/* Method to get overview over who owes who what */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/player'),
        axios.get(req.app.locals.kcapp.api + '/owe')
    ]).then(axios.spread((players, owes) => {
        res.render('owes', {
            owes: owes.data,
            players: players.data
        });
    })).catch(error => {
        debug('Error when getting data for owes ' + error);
        next(error);
    });
});

/* Method to register a payback between two players */
router.put('/payback', function (req, res) {
    axios.put(req.app.locals.kcapp.api + '/owe/payback', req.body)
        .then(() => {
            res.status(200).send().end();
        }).catch(error => {
            debug('Error when getting owes: ' + error);
            res.status(500).send().end();
        });
});

module.exports = router