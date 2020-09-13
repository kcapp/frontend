var debug = require('debug')('kcapp:socketio-handler');
var _ = require('underscore');
var axios = require('axios');
var moment = require('moment');
var bottleneck = require("bottleneck/es5");
var skill = require('kcapp-bot/bot-skill');

var _this = this;

function getClientIP(client) {
    var realIP = client.handshake.headers["x-real-ip"]
    return realIP ? realIP : client.handshake.address;
}

const limiter = new bottleneck({ minTime: 51 });

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
            debug(`[${namespace}] removed`);
        },
        addNamespace: (namespace) => {
            if (this.io.nsps[namespace] === undefined) {
                var nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    debug(`[${namespace}] connection from ${ip}`);
                });
                debug(`[${namespace}] created`);
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

                // To not spam the API with too many requests, we add a short limit to the requests here
                limiter.schedule(() => {
                    axios.get(app.locals.kcapp.api + '/leg/' + legId + '/players')
                        .then((response) => {
                            var legPlayers = response.data;
                            for (var id in legPlayers) {
                                var player = legPlayers[id].player;
                                if (player.is_bot) {
                                    // TODO Make sure this works correctly
                                    debug(`[${legId}] Adding bot ${player.id}/${player.name}`);
                                    var config = legPlayers[id].bot_config;
                                    var bot = require('kcapp-bot/kcapp-bot')(player.id, "localhost", 3000);
                                    if (config && config.skill_level === 0) {
                                        bot.replayLeg(legId, config.player_id);
                                    } else {
                                        var botSkill = config ? skill.fromInt(config.skill_level) : skill.MEDIUM;
                                        bot.playLeg(legId, botSkill);
                                    }
                                }
                            }
                        }).catch(error => {
                            var message = error.message + ' (' + error + ')'
                            debug(`[${legId}] Error when getting players for leg: ${message}`);
                        });
                });

                nsp.on('connection', function (client) {
                    var ip = getClientIP(client);
                    log('connection', namespace);
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
                        log('announce', JSON.stringify(data));
                        nsp.emit('announce', data);
                    });

                    client.on('spectator_connected', function () {
                        log('spectator_connected', namespace);
                        nsp.emit('spectator_connected', 'Spectator');
                    });

                    client.on('disconnect', function () {
                        log('disconnect', namespace);
                        nsp.emit('spectator_disconnected', 'Spectator');
                    });

                    client.on('possible_throw', function (data) {
                        log('possible_throw', JSON.stringify(data));
                        nsp.emit('possible_throw', data);
                    });

                    client.on('undo_throw', function (data) {
                        log('undo_throw', data);
                        nsp.emit('possible_throw', data);
                    });

                    client.on('chat_message', function (data) {
                        log('chat_message', data);
                        var message = '[' + moment().format('HH:mm') + '] ' + ip + ': ' + data + '\r\n';
                        chatHistory.push(message);
                        nsp.emit('chat_message', message);
                    });

                    client.on('warmup_started', function (data) {
                        log('warmup_started');
                        _this.io.of('/active').emit('warmup_started', { leg: data.leg, match: data.match });
                        if (data.match.venue) {
                            _this.io.of('/venue/' + data.match.venue.id).emit('venue_new_match', { leg: data.leg });
                        }
                    });

                    client.on('reconnect_smartboard', function (data) {
                        log('reconnect_smartboard');
                        _this.io.of('/active').emit('reconnect_smartboard', { leg: data.leg, match: data.match });
                    });

                    client.on('speak', function (data) {
                        log('speak', JSON.stringify(data));
                        nsp.emit('say', {
                            voice: "US English Female",
                            text: data.text,
                            type: data.type,
                            options: data.options
                        });
                    });

                    client.on('throw', function (data) {
                        var body = JSON.parse(data);
                        log('throw', data);
                        axios.post(app.locals.kcapp.api + '/visit', body)
                            .then((response) => {
                                var visit = response.data;
                                axios.all([
                                    axios.get(app.locals.kcapp.api + '/leg/' + body.leg_id),
                                    axios.get(app.locals.kcapp.api + '/leg/' + body.leg_id + '/players'),
                                    axios.get(app.locals.kcapp.api + '/statistics/global/fnc')
                                ]).then(axios.spread((legData, playersData, globalData) => {
                                    var leg = legData.data;
                                    var players = playersData.data;
                                    var currentPlayer = _.findWhere(players, { is_current_player: true });
                                    var globalstat = globalData.data[0];

                                    if (leg.is_finished) {
                                        axios.get(app.locals.kcapp.api + '/match/' + leg.match_id)
                                            .then((response) => {
                                                var match = response.data;
                                                var winnerPlayer = _.findWhere(players, { player_id: leg.winner_player_id });
                                                announceLegFinished(winnerPlayer, match)

                                                _this.io.of('/active').emit('leg_finished', { leg: leg, match: match, throw: body });
                                                nsp.emit('score_update', { leg: leg, players: players, match: match });
                                                nsp.emit('leg_finished', { leg: leg, match: match, throw: body });
                                            }).catch(error => {
                                                var message = error.message + ' (' + error + ')'
                                                debug(`[${legId}] Error when getting match: ${message}`);
                                                nsp.emit('error', { message: error.message, code: error.code });
                                            });
                                    } else {
                                        if (leg.visits.length === 1) {
                                            _this.io.of('/active').emit('first_throw', { leg: leg, players: players, globalstat: globalstat });
                                        }
                                        announceScored(leg.visits[leg.visits.length - 1]);
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
                                var message = error.response.data.trim();
                                var status = error.response.status;
                                debug(`[${legId}] Error when adding visit: (${status}) ${message}`);
                                nsp.emit('error', { message: message, code: status });
                            });
                    });

                    client.on('undo_visit', function (data) {
                        log('undo_visit');
                        axios.delete(app.locals.kcapp.api + '/visit/' + legId + '/last')
                            .then(() => {
                                axios.all([
                                    axios.get(app.locals.kcapp.api + '/leg/' + legId),
                                    axios.get(app.locals.kcapp.api + '/leg/' + legId + '/players'),
                                    axios.get(app.locals.kcapp.api + '/statistics/global/fnc')
                                ]).then(axios.spread((leg, players, globalstat) => {
                                    nsp.emit('undo_visit', {});
                                    nsp.emit('score_update', { leg: leg.data, players: players.data, globalstat: globalstat.data[0], is_undo: true });
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

                    client.on('stream', (data) => {
                        //log ('frame', JSON.stringify(data));
                        nsp.emit('board2', data);
                    });

                    function log(event, data = '') {
                        debug(`[${legId}] ${event} ${data} from ${ip}`);
                    }
                });

                function announceScored(visit) {
                    var score = visit.score;
                    var text = '' + score;
                    if (visit.is_bust) {
                        text = 'Noscore';
                    }
                    announce(text, 'score');
                }

                function announceScoreRemaining(player) {
                    var score = player.current_score;
                    if (score < 171 && ![169, 168, 166, 165, 163, 162, 159].includes(score)) {
                        var name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                        announce(name + " you require " + score, 'remaining_score');
                    }
                }

                function announceLegFinished(player, match) {
                    var name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                    if (match.is_finished) {
                        if (match.winner_id === null) {
                            announce(`Game shot, in the ${match.current_leg_num} leg, ${name}. The match a DRAW!!!`, 'game_shot');
                        } else {
                            announce(`Game shot, AND THE MATCH!!!, ${name}!`, 'game_shot');
                        }
                    } else {
                        announce(`Game shot in the ${match.current_leg_num} leg!, ${name}!`, 'game_shot');
                    }
                }

                function announce(text, type) {
                    var data = { text: text, type: type }
                    debug(`[${legId}] say ${JSON.stringify(data)}`);
                    nsp.emit('say', data);
                }
                debug(`[${namespace}] created`);
            }
        }
    };
};