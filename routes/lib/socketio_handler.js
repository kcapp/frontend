var debug = require('debug')('kcapp:socketio-handler');
var axios = require('axios');
var moment = require('moment');

function getClientIP(client) {
    var realIP = client.handshake.headers["x-real-ip"]
    return realIP ? realIP : client.handshake.address;
}

module.exports = (io, app) => {
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
            var chatHistory = [];
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    debug('Client connected: ' + ip);

                    client.on('join', function () {
                        client.emit('connected', 'Connected to server');
                        client.emit('chat_message', chatHistory.join(''));
                    });

                    client.on('spectator_connected', function (data) {
                        debug('Client connected: ' + ip);
                        nsp.emit('spectator_connected', data);
                    });

                    client.on('disconnect', function () {
                        debug('Client disconnected: ' + ip);
                        nsp.emit('spectator_disconnected');
                    });
                    client.on('possible_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });
                    client.on('undo_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });

                    client.on('chat_message', function (data) {
                        debug('Received chat message from %s: %s', ip, data)
                        var message = '[' + moment().format('HH:mm') + ']: ' + data + '\r\n';
                        chatHistory.push(message);
                        nsp.emit('chat_message', message);
                    });

                    client.on('throw', function (data) {
                        var body = JSON.parse(data);
                        debug('Received throw from %s (%o)', ip, body);
                        axios.post(app.locals.kcapp.api + '/visit', body)
                            .then(() => {
                                axios.get(app.locals.kcapp.api + '/match/' + body.match_id)
                                    .then(response => {
                                        var match = response.data;
                                        axios.get(app.locals.kcapp.api + '/match/' + body.match_id + '/players')
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