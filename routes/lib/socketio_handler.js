var debug = require('debug')('kcapp:socketio-handler');
var axios = require('axios');
var moment = require('moment');
var lookup = require('./dns_lookup');

function getClientIP(client) {
    var realIP = client.handshake.headers["x-real-ip"]
    return realIP ? realIP : client.handshake.address;
}

module.exports = (io, app) => {
    this.io = io;
    return {
        emitMessage: (namespace, type, message) => {
            var nsp = this.io.of(namespace);
            nsp.emit(type, message);
        },
        removeNamespace: (legId) => {
            if (legId === undefined) {
                return;
            }
            var namespace = '/legs/' + legId;
            delete this.io.nsps[namespace];
            debug("Removed socket.io namespace '%s'", namespace)
        },
        setupVenueNamespace: (venueId) => {
            var namespace = '/venue/' + venueId;
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    debug("Client %s connected to '%s'", ip, namespace);

                    client.on('get_next_match', function () {
                        nsp.emit('venue_new_match', '');
                    });
                });
                debug("Created socket.io namespace '%s'", namespace);
            }
        },
        setupLegsNamespace: (legId) => {
            if (legId === undefined) {
                return;
            }
            var namespace = '/legs/' + legId;
            var chatHistory = [];
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    var host = 'Unknown';

                    debug("Client %s connected to '%s'", ip, namespace);
                    lookup.reverse(ip, function (err, hostname) {
                        if (err) {
                            return;
                        }
                        host = hostname.substring(0, hostname.indexOf('.'));
                    });

                    client.on('join', function () {
                        client.emit('connected', 'Connected to server');
                        client.emit('chat_message', chatHistory.join(''));
                    });

                    client.on('spectator_connected', function () {
                        debug('Spectator connected: %s [%s]', host, ip);
                        nsp.emit('spectator_connected', host);
                    });

                    client.on('disconnect', function () {
                        debug('Client disconnected: %s [%s]', host, ip);
                        nsp.emit('spectator_disconnected', host);
                    });

                    client.on('possible_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });

                    client.on('undo_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });

                    client.on('chat_message', function (data) {
                        debug('Received chat message from %s [%s]: %s', host, ip, data)
                        var message = '[' + moment().format('HH:mm') + '] ' + host + ': ' + data + '\r\n';
                        chatHistory.push(message);
                        nsp.emit('chat_message', message);
                    });

                    client.on('throw', function (data) {
                        var body = JSON.parse(data);
                        debug('Received throw from %s (%o)', ip, body);
                        axios.post(app.locals.kcapp.api + '/visit', body)
                            .then(() => {
                                axios.get(app.locals.kcapp.api + '/leg/' + body.leg_id)
                                    .then(response => {
                                        var leg = response.data;
                                        axios.get(app.locals.kcapp.api + '/leg/' + leg.id + '/players')
                                            .then(response => {
                                                var players = response.data;
                                                nsp.emit('score_update', { players: players, leg: leg });
                                            }).catch(error => {
                                                var message = error.message + ' (' + error.response.data.trim() + ')'
                                                debug('Error when getting leg players: ' + message);
                                                nsp.emit('error', { message: error.message, code: error.code });
                                            });
                                    }).catch(error => {
                                        var message = error.message + ' (' + error.response.data.trim() + ')'
                                        debug('Error when getting leg: ' + message);
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