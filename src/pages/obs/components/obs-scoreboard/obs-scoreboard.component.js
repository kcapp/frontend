var _ = require("underscore");
var io = require('../../../../util/socket.io-helper.js');

module.exports = {
    onCreate(input) {
        var throws = {};
        for (var i = 0; i < input.leg_players.length; i++) {
            var player = input.leg_players[i];
            throws[player.player_id] = [];
        }
        this.state = {
            leg: input.leg,
            leg_players: input.leg_players,
            throws: throws,
            socket: {}
        }
    },

    onMount() {
        const activeSocket = io.connect(`${window.location.origin}/active`);
        activeSocket.on('warmup_started', (data) => {
            if (data.match.tournament_id !== null) {
                location.href = `/matches/${data.match.id}/obs`;
            }
        });

        // Setup socket endpoints
        const socket = io.connect(`${window.location.origin}/legs/${this.state.leg.id}`);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('possible_throw',this.onPossibleThrowEvent.bind(this));
        socket.on('new_leg', (data) => {
            location.reload();
        });
        this.state.socket = socket;
    },
    onPossibleThrowEvent(data) {
        this.state.leg.is_finished = data.is_finished;

        const player = _.find(this.state.leg_players, (player) => {
            return player.player_id == data.current_player_id;
        });
        if (data.is_finished) {
            player.wins++;
            return;
        }
        this.state.throws[data.current_player_id][data.darts_thrown] = { score: data.score, multiplier: data.multiplier };
        player.current_score -= (data.score * data.multiplier);
        this.setStateDirty("throws");
    },

    onScoreUpdate(data) {
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            if (player.is_current_player) {
                this.state.throws[player.player_id] = [];
            }
        }
        this.state.leg_players = data.players;
    }
};