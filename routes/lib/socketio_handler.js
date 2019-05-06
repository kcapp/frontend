var debug = require('debug')('kcapp:socketio-handler');
var _ = require('underscore');
var axios = require('axios');
var moment = require('moment');

var _this = this;

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
        addNamespace: (namespace) => {
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    debug("Client %s connected to '%s'", ip, namespace);
                });
                debug("Created socket.io namespace '%s'", namespace);
            }
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

                axios.get(app.locals.kcapp.api + '/leg/' + legId + '/players')
                    .then((response) => {
                        var legPlayers = response.data;
                        for (var id in legPlayers) {
                            var player = legPlayers[id].player;
                            if (player.is_bot) {
                                // TODO Make sure this works correctly
                                //debug(`[${legId}] Adding bot ${player.id}/${player.name}`);
                                //var bot = require('kcapp-bot/kcapp-bot')(player.id, "localhost", 3000);
                                //bot.playLeg(legId);
                            }
                        }
                    }).catch(error => {
                        var message = error.message + ' (' + error + ')'
                        debug(`[${legId}] Error when getting players for leg: ${message}`);
                    });

                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    debug(`[${legId}] Client ${ip} connected to '${namespace}'`);
                    client.on('join', function () {
                        axios.all([
                            axios.get(app.locals.kcapp.api + '/leg/' + legId),
                            axios.get(app.locals.kcapp.api + '/leg/' + legId + '/players')
                        ]).then(axios.spread((legData, playersData) => {
                            var leg = legData.data;
                            var players = playersData.data;
                            client.emit('connected', { leg: leg, players: players });
                        })).catch(error => {
                            var message = error.message + ' (' + error + ')'
                            debug(`[${legId}] Error when getting leg: ${message}`);
                            nsp.emit('error', { message: error.message, code: error.code });
                        });
                    });

                    client.on('announce', function(data) {
                        debug(`[${legId}] Got announcement: ${JSON.stringify(data)}`);
                        nsp.emit('announce', data);
                    });

                    client.on('spectator_connected', function () {
                        debug(`[${legId}] Spectator connected: ${ip}`);
                        nsp.emit('spectator_connected', 'Spectator');
                    });

                    client.on('disconnect', function () {
                        debug(`[${legId}] Client disconnected: ${ip}`);
                        nsp.emit('spectator_disconnected', 'Spectator');
                    });

                    client.on('possible_throw', function (data) {
                        debug(`[${legId}] possible_throw ${JSON.stringify(data)}`)
                        nsp.emit('possible_throw', data);
                    });

                    client.on('undo_throw', function (data) {
                        nsp.emit('possible_throw', data);
                    });

                    client.on('chat_message', function (data) {
                        debug('Received chat message from %s: %s', ip, data)
                        var message = '[' + moment().format('HH:mm') + '] ' + ip + ': ' + data + '\r\n';
                        chatHistory.push(message);
                        nsp.emit('chat_message', message);
                    });

                    client.on('warmup_started', function (data) {
                        _this.io.of('/active').emit('warmup_started', { leg: data.leg, match: data.match });
                        if (data.match.venue) {
                            _this.io.of('/venue/' + data.match.venue.id).emit('venue_new_match', { leg: data.leg });
                        }
                    });

                    client.on('speak', function (data) {
                        debug(`[${legId}]  Recived voice line ${JSON.stringify(data)}`);
                        nsp.emit('say', {
                            voice: "US English Female",
                            text: data.text,
                            type: data.type,
                            options: data.options
                        });
                    });

                    client.on('throw', function (data) {
                        var body = JSON.parse(data);
                        debug(`[${legId}] throw from ${ip} (${data})`);
                        axios.post(app.locals.kcapp.api + '/visit', body)
                            .then((response) => {
                                var visit = response.data;
                                axios.all([
                                    axios.get(app.locals.kcapp.api + '/leg/' + body.leg_id),
                                    axios.get(app.locals.kcapp.api + '/leg/' + body.leg_id + '/players'),
                                    axios.get(app.locals.kcapp.api + '/statistics/global')
                                ]).then(axios.spread((legData, playersData, globalData) => {
                                    var leg = legData.data;
                                    var players = playersData.data;
                                    var currentPlayer = _.findWhere(players, { is_current_player: true });
                                    var globalstat = globalData.data;

                                    if (leg.is_finished) {
                                        axios.get(app.locals.kcapp.api + '/match/' + leg.match_id)
                                            .then((response) => {
                                                var match = response.data;
                                                announceLegFinished(currentPlayer, match)

                                                _this.io.of('/active').emit('leg_finished', { leg: leg, match: match });
                                                nsp.emit('score_update', { leg: leg, players: players, match: match });
                                                nsp.emit('leg_finished', { leg: leg, match: match });
                                            }).catch(error => {
                                                var message = error.message + ' (' + error + ')'
                                                debug(`[${legId}] Error when getting match: ${message}`);
                                                nsp.emit('error', { message: error.message, code: error.code });
                                            });
                                    } else {
                                        if (leg.visits.length === 1) {
                                            _this.io.of('/active').emit('first_throw', { leg: leg, players: players, globalstat: globalstat });
                                        }
                                        announceScored(visit);
                                        setTimeout(() => {
                                            // There is a race between these two announcements, so delay the one slightly
                                            announceScoreRemaining(currentPlayer);
                                        }, 300);
                                        nsp.emit('score_update', { leg: leg, players: players, globalstat: globalstat });
                                    }
                                })).catch(error => {
                                    var message = error.message + ' (' + error + ')'
                                    debug(`[${legId}] Error when getting leg: ${message}`);
                                    nsp.emit('error', { message: error.message, code: error.code });
                                });
                            }).catch(error => {
                                var message = error.message + ' (' + error + ')'
                                debug(`[${legId}] Error when adding visit: ${message}`);
                                nsp.emit('error', { message: message, code: error.code });
                            });
                    });

                    client.on('undo_visit', function (data) {
                        debug(`[${legId}] Received undo_visit from ${ip}`);
                        axios.delete(app.locals.kcapp.api + '/visit/' + legId + '/last')
                            .then(() => {
                                axios.all([
                                    axios.get(app.locals.kcapp.api + '/leg/' + legId),
                                    axios.get(app.locals.kcapp.api + '/leg/' + legId + '/players'),
                                    axios.get(app.locals.kcapp.api + '/statistics/global')
                                ]).then(axios.spread((leg, players, globalstat) => {
                                    nsp.emit('undo_visit', {});
                                    nsp.emit('score_update', { leg: leg.data, players: players.data, globalstat: globalstat.data, is_undo: true });
                                })).catch(error => {
                                    var message = error.message + ' (' + error.response.data.trim() + ')'
                                    debug(`[${legId}] Error when getting leg: ${message}`);
                                    nsp.emit('error', { message: error.message, code: error.code });
                                });
                            }).catch(error => {
                                var message = error.message + ' (' + error.response.data.trim() + ')'
                                debug(`[${legId}] Error when undoing visit: ${message}`);
                                nsp.emit('error', { message: message, code: error.code });
                            });
                    });
                });

                function announceScored(visit) {
                    var score = visit.first_dart.value * visit.first_dart.multiplier +
                        visit.second_dart.value * visit.second_dart.multiplier +
                        visit.third_dart.value * visit.third_dart.multiplier;
                    var text = '' + score;
                    var options = {};
                    if (visit.is_bust) {
                        text = 'Noscore';
                        options = { pitch: 0.8 };
                    }
                    announce(text, 'score', options);
                }

                function announceScoreRemaining(player) {
                    var score = player.current_score;
                    if (score < 171 && ![169, 168, 166, 165, 163, 162, 159].includes(score)) {
                        var name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                        announce(name + " you require " + score, 'remaining_score', {});
                    }
                }

                function announceLegFinished(player, match) {
                    var legNum = match.legs.length + (["st", "nd", "rd"][((match.legs.length + 90) % 100 - 10) % 10 - 1] || "th");
                    var name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                    if (match.is_finished) {
                        announce(`Game shot, AND THE MATCH!!!, ${name}!`, 'game_shot', {});
                    } else {
                        announce(`Game shot in the ${legNum} leg!, ${name}!`, 'game_shot', {});
                    }
                }

                function announce(text, type, options) {
                    var voice = "US English Female";
                    nsp.emit('say', { voice: voice, text: text, type: type, options: options });
                }
                debug("Created socket.io namespace '%s'", namespace);
            }
        }
    };
};