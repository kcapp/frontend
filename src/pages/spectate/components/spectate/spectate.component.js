const _ = require("underscore");
const io = require('../../../../util/socket.io-helper.js');

module.exports = {
    onCreate(input) {
        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            legId: input.leg.id,
            roundNumber: roundNumber,
            matchName: matchName,
            submitting: false,
            socket: {},
            audioAnnouncer: undefined,
            voiceAnnouncements: false
        }
    },

    onMount() {
        var socket = io.connect(window.location.origin + '/legs/' + this.state.legId);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('possible_throw', this.onPossibleThrow.bind(this));
        socket.on('leg_finished', (data) => {
            var match = data.match;
            if (match.is_finished) {
                location.href = `${window.location.origin}/matches/${match.id}/result`;
            }
        });
        socket.on('new_leg', (data) => {
            var match = data.match;
            location.href = `${window.location.origin}/matches/${match.id}/spectate`;
        });
        socket.on('connected', (data) => {
            socket.emit('spectator_connected', '');
        });
        socket.on('say', this.onSay.bind(this));

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
        var component = this.findActive(this.getComponents('players'));

        // Set current dart
        if (data.is_undo) {
            component.getDart(data.darts_thrown).reset();
        } else {
            component.setDart(data.score, data.multiplier, data.darts_thrown);
        }
        // Set total score
        component.state.totalScore += data.score * data.multiplier;

        // Update player score
        var header = this.getComponent('player-' + data.current_player_id);
        header.state.player.current_score -= (data.score * data.multiplier)
        header.setStateDirty('player');
    },

    findActive(components) {
        return _.filter(components, function (component) {
            if (component.state.isCurrentPlayer) {
                return component;
            }
        })[0];
    }
}