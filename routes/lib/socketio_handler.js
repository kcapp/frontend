var debug = require('debug')('kcapp:socketio-handler');
const axios = require('axios');

module.exports = (io) => {
    this.io = io;
    return {
        emitMessage: (matchId, type, message) => {
            var nsp = this.io.of('/matches/' + matchId);
            nsp.emit(type, message);
        },
        removeNamespace: (matchId) => {
            if (matchId === undefined) {
                return;
            }
            var namespace = '/matches/' + matchId;
            delete this.io.nsps[namespace];
            debug("Removed socket.io namespace '%s'", namespace)
        },
        setupNamespace: (matchId) => {
            if (matchId === undefined) {
                return;
            }
            var namespace = '/matches/' + matchId;
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    debug('Client connected: ' + client.handshake.address);

                    client.on('join', function () {
                        client.emit('connected', 'Connected to server');
                    });

                    client.on('spectator_connected', function (data) {
                        nsp.emit('spectator_connected', data);
                    });

                    client.on('disconnect', function () {
                        debug('Client disconnected: ' + client.handshake.address);
                        nsp.emit('spectator_disconnected');
                    });
                    client.on('possible_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });
                    client.on('undo_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });

                    client.on('throw', function (data) {
                        debug('Received throw from ' + client.handshake.address);
                        var body = JSON.parse(data);
                        axios.post(req.app.locals.kcapp.api + '/visit', body)
                            .then(() => {
                                axios.get(req.app.locals.kcapp.api + '/match/' + body.match_id)
                                    .then(response => {
                                        var match = response.data;
                                        axios.get(req.app.locals.kcapp.api + '/match/' + body.match_id + '/players')
                                            .then(response => {
                                                var players = response.data;
                                                nsp.emit('score_update', { players: players, match: match });
                                            }).catch(error => {
                                                var message = error.message + ' (' + error.response.data.trim() + ')'
                                                debug('Error when getting match players: ' + message);
                                                nsp.emit('error', { message: error.message, code: error.code });
                                            });
                                    }).catch(error => {
                                        var message = error.message + ' (' + error.response.data.trim() + ')'
                                        debug('Error when getting match: ' + message);
                                        nsp.emit('error', { message: error.message, code: error.code });
                                    });
                            }).catch(error => {
                                var message = error.message + ' (' + error.response.data.trim() + ')'
                                debug('Error when adding visit: ' + message);
                                nsp.emit('error', { message: message, code: error.code });
                            });
                    });
                });
                debug("Created socket.io namespace '%s'", namespace);
            }
        }
    };
};