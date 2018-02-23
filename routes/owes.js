var debug = require('debug')('kcapp:owes');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/* Method to get overview over who owes who what */
router.get('/', function (req, res, next) {
    axios.get(req.app.locals.kcapp.api + '/player')
        .then(function (response) {
            var playersMap = response.data;
            axios.get(req.app.locals.kcapp.api + '/owe')
                .then(response => {
                    var owes = response.data;
                    res.render('owes', { owes: owes, players: playersMap });
                }).catch(error => {
                    debug('Error when getting owes: ' + error);
                    next(error);
                });
        }).catch(error => {
            debug('Error when getting players: ' + error);
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