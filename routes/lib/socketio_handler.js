const debug = require('debug')('kcapp:socketio-handler');
const fs = require('fs');

const _ = require('underscore');
const axios = require('axios');
const moment = require('moment');
const bottleneck = require("bottleneck/es5");
const skill = require('kcapp-bot/bot-skill');
const types = require('../../src/components/scorecard/components/match_types');

const _this = this;

function readFiles(src) {
    const map = {};
    map.random = (text) => {
        const key = text.toString().toLowerCase();
        if (map[key]) {
            return { file: map[key][Math.floor(Math.random() * map[key].length)] };
        }
        return { text: `${key}` };
    }
    fs.readdirSync(src).forEach(file => {
        const name = file.split("_")[0];
        const path = src.replace("public", "");
        if (map[name]) {
            map[name].push(`${path}/${file}`);
        } else {
            map[name] = [ `${path}/${file}` ];
        }
    });
    return map;
}

function readFolders(src) {
    const map = {};
    fs.readdirSync(src).forEach(folder => {
        map[folder] = readFiles(`${src}/${folder}`);
    });
    return map;
}

const AUDIO_NUMBERS = readFiles('public/audio/announcer/numbers');
const AUDIO_SCORES = readFiles('public/audio/announcer/scores');
const AUDIO_MARKS = readFiles('public/audio/announcer/marks');
const AUDIO_NAMES = readFolders('public/audio/announcer/names');
const AUDIO_SENTENCES = readFiles('public/audio/announcer/sentences');
const AUDIO_GAMESHOT = readFiles('public/audio/announcer/sentences/gameshot');

function getClientIP(client) {
    const realIP = client.handshake.headers["x-real-ip"]
    return realIP ? realIP : client.handshake.address;
}

const limiter = new bottleneck({ minTime: 51 });

module.exports = (io, app) => {
    this.io = io;
    this.config = {
        emitMessage: (namespace, type, message) => {
            const nsp = this.io.of(namespace);
            nsp.emit(type, message);
        },
        removeNamespace: (legId) => {
            if (legId === undefined) {
                return;
            }
            const namespace = `/legs/${legId}`;

            const nsp = io.of(namespace);
            nsp.removeAllListeners();

            delete this.io._nsps[namespace];
            debug(`[${namespace}] removed`);
        },
        setupActiveNamespace: () => {
            const namespace = "/active";
            if (this.io._nsps[namespace] === undefined) {
                const nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    const ip = getClientIP(client);
                    debug(`[${namespace}] connection from ${ip}`);

                    client.on('smartcard', (data) => {
                        debug(`[${namespace}] smartcard ${JSON.stringify(data)} from ${ip}`);

                        // TODO Emit on venue namespace?
                        nsp.emit('smartcard', data);
                    })
                });
                debug(`[${namespace}] created`);
            }
        },
        setupVenueNamespace: (venueId) => {
            const namespace = `/venue/${venueId}`;
            if (this.io._nsps[namespace] === undefined) {
                const nsp = this.io.of(namespace);
                nsp.on('connection', function (client) {
                    const ip = getClientIP(client);
                    debug("Client %s connected to '%s'", ip, namespace);
                });
                debug("Created socket.io namespace '%s'", namespace);
            }
        },
        setupLegsNamespace: (legId) => {
            if (legId === undefined) {
                return;
            }
            const namespace = `/legs/${legId}`;
            if (this.io._nsps[namespace] === undefined) {
                const nsp = this.io.of(namespace);

                // To not spam the API with too many requests, we add a short limit to the requests here
                limiter.schedule(() => {
                    axios.get(`${app.locals.kcapp.api}/leg/${legId}/players`)
                        .then((response) => {
                            const legPlayers = response.data;
                            for (let id in legPlayers) {
                                const player = legPlayers[id].player;
                                if (player.is_bot) {
                                    debug(`[${legId}] Adding bot ${player.id}/${player.name}`);
                                    const config = legPlayers[id].bot_config;
                                    const bot = require('kcapp-bot/kcapp-bot')(player.id, "localhost", 3000, `${app.locals.kcapp.api}`);
                                    if (config && config.skill_level === 0) {
                                        bot.replayLeg(legId, config.player_id, legPlayers[id].starting_score);
                                    } else {
                                        const botSkill = config ? skill.fromInt(config.skill_level) : skill.MEDIUM;
                                        bot.playLeg(legId, botSkill);
                                    }
                                }
                            }
                        }).catch(error => {
                            const message = `${error.message} (${error})`;
                            debug(`[${legId}] Error when getting players for leg: ${message}`);
                        });
                });

                nsp.on('connection', function (client) {
                    const ip = getClientIP(client);
                    log('connection', namespace);
                    client.on('join', function () {
                        axios.all([
                            axios.get(`${app.locals.kcapp.api}/leg/${legId}`),
                            axios.get(`${app.locals.kcapp.api}/leg/${legId}/players`)
                        ]).then(axios.spread((legData, playersData) => {
                            const leg = legData.data;
                            const players = playersData.data;
                            client.emit('connected', { leg: leg, players: players });
                        })).catch(error => {
                            const message = `${error.message}(${error})`;
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
                        const message = `[${moment().format('HH:mm')}] ${ip}: ${data}\r\n`;
                        chatHistory.push(message);
                        nsp.emit('chat_message', message);
                    });

                    client.on('warmup_started', function (data) {
                        log('warmup_started');
                        axios.put(`${app.locals.kcapp.api}/leg/${data.leg.id}/warmup`, { id: data.venue} )
                            .then(() => {
                                _this.io.of('/active').emit('warmup_started', { leg: data.leg, match: data.match });
                                if (data.venue || data.match.venue) {
                                    const venue = data.venue || data.match.venue.id;
                                    _this.io.of(`/venue/${venue}`).emit('warmup_started', { leg: data.leg, match: data.match });
                                }
                            }).catch(error => {
                                const message = `${error.message}(${error})`;
                                debug(`[${legId}] Error when setting warmup: ${message}`);
                                nsp.emit('error', { message: error.message, code: error.code });
                            });
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

                    client.on('speak_finish', function (data) {
                        nsp.emit('say_finish');
                    });

                    client.on('throw', function (data) {
                        const body = JSON.parse(data);
                        log('throw', data);
                        axios.post(`${app.locals.kcapp.api}/visit`, body)
                            .then((response) => {
                                axios.all([
                                    axios.get(`${app.locals.kcapp.api}/leg/${body.leg_id}`),
                                    axios.get(`${app.locals.kcapp.api}/leg/${body.leg_id}/players`),
                                    axios.get(`${app.locals.kcapp.api}/statistics/global/fnc`)
                                ]).then(axios.spread((legData, playersData, globalData) => {
                                    const leg = legData.data;
                                    const players = playersData.data;
                                    const currentPlayer = _.findWhere(players, { is_current_player: true });
                                    const globalstat = globalData.data[0];

                                    axios.get(`${app.locals.kcapp.api}/match/${leg.match_id}`)
                                        .then((response) => {
                                            const match = response.data;

                                            if (leg.is_finished) {
                                                const winnerPlayer = _.findWhere(players, { player_id: leg.winner_player_id });
                                                announceLegFinished(winnerPlayer, match)

                                                if (!match.is_finished) {
                                                    _this.config.setupLegsNamespace(match.current_leg_id);

                                                    // Forward all spectating clients to next leg
                                                    nsp.emit('new_leg', { match: match, leg: leg });
                                                }
                                                _this.io.of('/active').emit('leg_finished', { leg: leg, match: match, throw: body });
                                                nsp.emit('score_update', { leg: leg, players: players, match: match });
                                                nsp.emit('leg_finished', { leg: leg, match: match, throw: body });
                                                setTimeout(() => {
                                                    // Remove the namespace in a bit, once announcements are finished
                                                    _this.config.removeNamespace(leg.id);
                                                }, 15000);
                                            } else {
                                                if (leg.visits.length === 1) {
                                                    _this.io.of('/active').emit('first_throw', { leg: leg, players: players, globalstat: globalstat });
                                                }
                                                announceScored(leg.visits[leg.visits.length - 1], leg.leg_type.id);
                                                setTimeout(() => {
                                                    // There is a race between these two announcements, so delay the one slightly
                                                    announceScoreRemaining(currentPlayer);
                                                }, 300);
                                                nsp.emit('score_update', { leg: leg, players: players, globalstat: globalstat });
                                            }
                                        }).catch(error => {
                                            const message = `${error.message}(${error})`;
                                            debug(`[${legId}] Error when getting match: ${message}`);
                                            nsp.emit('error', { message: error.message, code: error.code });
                                        });
                                })).catch(error => {
                                    const message = `${error.message} (${error})`;
                                    debug(`[${legId}] Error when getting leg: ${message}`);
                                    nsp.emit('error', { message: error.message, code: error.code });
                                });
                            }).catch(error => {
                                let message = "Unable to add visit";
                                let status = -1;
                                if (error.response) {
                                    message = error.response.data.trim();
                                    status = error.response.status;
                                }
                                debug(`[${legId}] Error when adding visit: (${status}) ${message}`);
                                nsp.emit('error', { message: message, code: status });
                            });
                    });

                    client.on('undo_visit', function (data) {
                        log('undo_visit');
                        axios.delete(`${app.locals.kcapp.api}/visit/${legId}/last`)
                            .then(() => {
                                axios.all([
                                    axios.get(`${app.locals.kcapp.api}/leg/${legId}`),
                                    axios.get(`${app.locals.kcapp.api}/leg/${legId}/players`),
                                    axios.get(`${app.locals.kcapp.api}/statistics/global/fnc`)
                                ]).then(axios.spread((leg, players, globalstat) => {
                                    nsp.emit('undo_visit', {});
                                    nsp.emit('score_update', { leg: leg.data, players: players.data, globalstat: globalstat.data[0], is_undo: true });
                                })).catch(error => {
                                    const message = `${error.message}(${error.response.data.trim()})`;
                                    debug(`[${legId}] Error when getting leg: ${message}`);
                                    nsp.emit('error', { message: error.message, code: error.code });
                                });
                            }).catch(error => {
                                const message = `${error.message}(${error.response.data.trim()})`;
                                debug(`[${legId}] Error when undoing visit: ${message}`);
                                nsp.emit('error', { message: message, code: error.code });
                            });
                    });

                    client.on('stream', (data) => {
                        nsp.emit('board2', data);
                    });

                    client.on('announce', (data) => {
                        if (data.type === "match_start") {
                            if (!this.matchStartAnnounced) {
                                const sentence = [
                                    AUDIO_SENTENCES.random(data.leg_num),
                                    getNameAnnouncement(data.player, "name"),
                                    AUDIO_SENTENCES.random("throwfirst"),
                                    AUDIO_SENTENCES.random("gameon")
                                ];
                                announce(`${data.leg_num} leg, ${data.player.name} to throw first. Game on!`, 'leg_start', sentence);
                            }
                            this.matchStartAnnounced = true;
                            setTimeout(() => {
                                // Reset the state after 10s, incase someone opened the match without starting to play
                                this.matchStartAnnounced = false;
                            }, 10000);
                        }
                    });

                    function log(event, data = '') {
                        debug(`[${legId}] ${event} ${data} from ${ip}`);
                    }
                });

                function getNameAnnouncement(player, type) {
                    const name = player.vocal_name === null || player.vocal_name.trim() === "" ? player.first_name : player.vocal_name;
                    if (name.includes(".wav")) {
                        const key = player.first_name.toLowerCase().replace(" ", "");
                        if (AUDIO_NAMES[key]) {
                            return AUDIO_NAMES[key].random(type);
                        }
                    }
                    return { text: `${name}` };
                }

                function announceScored(visit, matchType) {
                    const score = visit.score;
                    const audios = [];
                    let text = `${score}`;
                    if (matchType === types.SCAM && visit.is_stopper) {
                        audios.push(AUDIO_MARKS.random(`${visit.marks}marks`));
                    } else if (matchType === types.CRICKET) {
                        audios.push(AUDIO_MARKS.random(`${visit.marks}marks`));
                        if (visit.score > 0) {
                            audios.push(AUDIO_SCORES.random(text));
                        }
                    } else if (visit.is_bust || score === 0) {
                        audios.push(AUDIO_SCORES.random('Noscore'));
                    } else {
                        audios.push(AUDIO_SCORES.random(text));
                    }
                    announce(text, 'score', audios);
                }

                function announceScoreRemaining(player) {
                    const score = player.current_score;
                    if (score < 171 && ![169, 168, 166, 165, 163, 162, 159].includes(score)) {
                        const name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                        const sentence = [
                            getNameAnnouncement(player.player, "name"),
                            AUDIO_SENTENCES.random("yourequire"),
                            AUDIO_NUMBERS.random(score)
                        ];
                        announce(`${name} you require ${score}`, 'remaining_score', sentence);
                    }
                }

                function announceLegFinished(player, match) {
                    let name = "DRAW";
                    if (player) {
                        name = player.player.vocal_name === null ? player.player.first_name : player.player.vocal_name;
                    }
                    const legNum = match.legs.length;
                    if (match.is_finished) {
                        if (match.winner_id === null) {
                            const currentLeg = legNum + ["", "st", "nd", "rd", "th"][legNum > 4 ? 4 : legNum];
                            const sentence = [
                                AUDIO_GAMESHOT.random(currentLeg),
                                AUDIO_SENTENCES.random("matchdraw")
                            ];
                            announce(`Game shot, in the ${currentLeg} leg, ${name}. The match a DRAW!!!`, 'game_shot', sentence);
                        } else {
                            const sentence = [
                                AUDIO_SENTENCES.random("matchwon"),
                                getNameAnnouncement(player.player, "winner")
                            ];
                            announce(`Game shot, AND THE MATCH!!!, ${name}!`, 'game_shot', sentence);
                        }
                    } else {
                        const currentLeg = legNum - 1 + ["", "st", "nd", "rd", "th"][legNum > 4 ? 4 : legNum - 1];
                        const sentence = [
                            AUDIO_GAMESHOT.random(currentLeg),
                            getNameAnnouncement(player.player, "name")
                        ];
                        announce(`Game shot in the ${currentLeg} leg!, ${name}!`, 'game_shot', sentence);
                    }
                }

                function announce(text, type, audios) {
                    const data = { text: text, type: type, audios: audios }
                    debug(`[${legId}] say ${JSON.stringify(data)}`);
                    nsp.emit('say', data);
                }
                debug(`[${namespace}] created`);
            }
        }
    };
    return this.config;
};
