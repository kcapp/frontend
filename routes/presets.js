const debug = require('debug')('kcapp:presets');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const _ = require('underscore');

const template = require('marko');
const presetsTemplate = template.load(require.resolve('../src/pages/presets/presets-template.marko'));

/* Get a list of all presets */
router.get('/', function (req, res, next) {
    axios.all([
        axios.get(`${req.app.locals.kcapp.api}/preset`),
        axios.get(`${req.app.locals.kcapp.api}/match/types`),
        axios.get(`${req.app.locals.kcapp.api}/match/modes`)
    ]).then(axios.spread((presetResponse, typesResponse, modesResponse) => {
        res.marko(presetsTemplate, {
            presets: presetResponse.data,
            match_types: typesResponse.data,
            match_modes: modesResponse.data
        });
    })).catch(error => {
        debug(`Error when getting presets: ${error}`);
        next(error);
    });
});

/* Get a specific preset */
router.get('/:id', function (req, res, next) {
    axios.get(`${req.app.locals.kcapp.api}/preset/${req.params.id}`, req.body)
        .then(() => {
            res.redirect(303, '/presets');
        }).catch(error => {
            debug(`Error when updating preset: ${error}`);
            next(error);
        });
});

/* Add a new preset */
router.post('/', function (req, res, next) {
    const body = {
        name: req.body.name,
        match_type: { id: req.body.match_type_id },
        match_mode: { id: req.body.match_mode_id },
        starting_score: req.body.starting_score,
        smartcard_uid: req.body.smartcard_uid,
        description: req.body.description
    }
    axios.post(`${req.app.locals.kcapp.api}/preset`, body)
        .then(() => {
            res.redirect('/presets');
        }).catch(error => {
            debug(`Error when adding new preset: ${error}`);
            next(error);
        });
});

/* Update preset */
router.put('/:id', function (req, res, next) {
    const body = {
        name: req.body.name,
        match_type: { id: req.body.match_type_id },
        match_mode: { id: req.body.match_mode_id },
        starting_score: req.body.starting_score,
        smartcard_uid: req.body.smartcard_uid,
        description: req.body.description
    }
    axios.put(`${req.app.locals.kcapp.api}/preset/${req.params.id}`, body)
        .then(() => {
            res.redirect(303, '/presets');
        }).catch(error => {
            debug(`Error when updating preset: ${error}`);
            next(error);
        });
});

/* Delete preset */
router.delete('/:id', function (req, res, next) {
    axios.delete(`${req.app.locals.kcapp.api}/preset/${req.params.id}`)
        .then(() => {
            res.redirect(303, '/presets');
        }).catch(error => {
            debug(`Error when deleting preset: ${error}`);
            next(error);
        });
});

module.exports = router
