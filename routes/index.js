var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  axios.get('http://localhost:8001/player')
    .then(response => {
      var players = response.data
      axios.get('http://localhost:8001/gametype')
        .then(response => {
          var gameTypes = response.data;
          axios.get('http://localhost:8001/owetype')
            .then(response => {
              var oweTypes = response.data;
              res.render('index', { players: players, game_types: gameTypes, owe_types: oweTypes });
            }).catch(error => {
              debug('Error when getting owe types: ' + error);
              helper.renderError(res, error);
            });
        }).catch(error => {
         	debug('Error when getting game types: ' + error);
          helper.renderError(res, error);
        });
    }).catch(error => {
      debug('Error when getting match players: ' + error);
      helper.renderError(res, error);
    });
});

module.exports = router;
