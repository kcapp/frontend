const _ = require("underscore");
const io = require('../../util/socket.io-helper.js');
const localStorage = require('../../util/localstorage.js');
const types = require('../scorecard/components/match_types');

module.exports = {
    onCreate(input) {
        const matchName = input.match.match_mode.short_name;
        this.state = {
            leg: input.leg,
            players: input.leg_players,
            roundNumber: input.leg.round,
            matchName: matchName,
            matchType: input.leg.leg_type.id || input.match.match_type.id,
            submitting: false,
            socket: {},
            audioAnnouncer: undefined,
            voiceAnnouncements: false
        }
    },

    onMount() {
        const socket = io.connect(`${window.location.origin}/legs/${this.state.leg.id}`);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('possible_throw', this.onPossibleThrow.bind(this));
        socket.on('leg_finished', (data) => {
            const match = data.match;
            const isVenueSpectate = this.input.venue !== undefined;
            if (match.is_finished) {
                if (isVenueSpectate) {
                    return;
                }
                location.href = `${window.location.origin}/matches/${match.id}/result`;
            } else {
                location.href = isVenueSpectate ? `/venues/${data.match.venue.id}/spectate` : `/matches/${match.id}/spectate`;
            }
        });
        socket.on('connected', (data) => {
            socket.emit('spectator_connected', '');
        });
        socket.on('say', this.onSay.bind(this));

        if (this.input.venue) {
            const venueSocket = io.connect(`${window.location.origin}/venue/${this.input.venue.id}`);
            const forwardFnc = (data) => {
                if (location.pathname.endsWith(`${data.match.id}/spectate`)) {
                    return;
                }
                location.href = `/venues/${data.match.venue.id}/spectate`;
            };
            venueSocket.on('venue_new_match', forwardFnc);
            venueSocket.on('warmup_started', forwardFnc);
        }
        this.state.audioAnnouncer = new Audio();
        this.state.socket = socket;
    },

    onEnableAnnouncement(data) {
        this.state.voiceAnnouncements = data;
    },

    onSay(data) {
        if (this.state.voiceAnnouncements) {
            io.say(data, this);
        }
    },

    onScoreUpdate(data) {
        io.onScoreUpdate(data, this);
        this.getComponent('visits').setVisits(data.leg.visits);
    },

    onPossibleThrow(data) {
        const component = this.findActive(this.getComponents('players'));
        if (this.state.matchType === types.X01) {
            // Set current dart
            if (data.is_undo) {
                component.getDart(data.darts_thrown).reset();
            } else {
                component.setDart(data.score, data.multiplier, data.darts_thrown);
            }
            // Set total score
            component.state.totalScore += data.score * data.multiplier;

            // Update player score
            const header = this.getComponent(`player-${data.current_player_id}`);
            header.state.player.current_score -= (data.score * data.multiplier)
            header.setStateDirty('player');
        } else {
            if (data.is_undo) {
                component.removeLast();
            } else {
                component.setDart(data.score, data.multiplier, data.darts_thrown);
                component.confirmThrow();
            }
        }
    },

    onScoreChange(scored, playerId, component) {
        if (!playerId) {
            playerId = this.findActive(this.getComponents('players')).state.player.player_id;
        }
        this.getComponent(`player-${playerId}`).setScored(scored);
    },

    findActive(components) {
        return _.filter(components, function (component) {
            if (component.state.isCurrentPlayer) {
                return component;
            }
        })[0];
    }
}