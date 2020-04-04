var debug = require('debug')('kcapp:office');

var express = require('express');
var router = express.Router();

var axios = require('axios');
var officeTemplate = require('../src/pages/offices/offices-template.marko');

/* Add a new office */
router.post('/', function (req, res, next) {
    axios.post(req.app.locals.kcapp.api + '/office', req.body)
        .then(() => {
            res.redirect('/offices');
        }).catch(error => {
            debug('Error when adding new office: ' + error);
            next(error);
        });
});

/* Edit office */
router.put('/:id', function (req, res, next) {
    axios.put(req.app.locals.kcapp.api + '/office/' + req.params.id, req.body)
        .then(() => {
            res.redirect(303, '/offices');
        }).catch(error => {
            debug('Error when editing office: ' + error);
            next(error);
        });
});

/* Get all offices */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(req.app.locals.kcapp.api + '/office'),
        axios.get(req.app.locals.kcapp.api + '/venue')
    ]).then(axios.spread((offices, venues) => {
        res.marko(officeTemplate, {
            offices: offices.data,
            venues: venues.data
        });
    })).catch(error => {
        debug('Error when getting data for offices ' + error);
        next(error);
    });
});

module.exports = router