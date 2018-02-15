var debug = require('debug')('kcapp:owes');

var express = require('express');
var router = express.Router();

var axios = require('axios');

/* Method to get overview over who owes who what */
router.get('/', function (req, res, next) {
    axios.get('http://localhost:8001/player')
        .then(function (response) {
            var playersMap = response.data;
            axios.get('http://localhost:8001/owe')
                .then(response => {
                    var owes = response.data;
                    res.render('owes', { owes: owes, players: playersMap });
                }).catch(error => {
                	debug('Error when getting owes: ' + error);
                    next(error);
                });
        }).catch(function (error) {
           	debug('Error when getting players: ' + error);
            next(error);
        });
});

/* Method to register a payback between two players */
router.put('/payback', function (req, res) {
    axios.put('http://localhost:8001/owe/payback', req.body)
        .then(response => {
            res.status(200).send().end();
        }).catch(error => {
        	debug('Error when getting owes: ' + error);
            res.status(500).send().end();
        });
});

module.exports = router