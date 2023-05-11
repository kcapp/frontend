const _ = require("underscore");
const io = require('../../../../util/socket.io-helper.js');
const matchTypes = require('../../../../components/scorecard/components/match_types');

module.exports = {
    onCreate(input) {
        const throws = {};
        for (let i = 0; i < input.leg_players.length; i++) {
            const player = input.leg_players[i];
            throws[player.player_id] = [];
        }
        this.state = {
            leg: input.leg,
            leg_players: input.leg_players,
            matchType: input.leg.leg_type.id,
            throws: throws,
            socket: {}
        }
    },

    onMount() {
        let params = (new URL(window.location)).searchParams;
        let officeId = params.get("officeId");

        const activeSocket = io.connect(`${window.location.origin}/active`);
        activeSocket.on('warmup_started', (data) => {
            if (data.match.tournament_id !== null) {
                if (officeId) {
                    // Check if we are looking only at specific ?officeId=X
                    if (data.match.office_id && parseInt(officeId) === data.match.office_id) {
                        location.href = `/matches/${data.match.id}/obs?officeId=${officeId}`;
                    }
                } else {
                    location.href = `/matches/${data.match.id}/obs`;
                }
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
            return player.player_id === data.current_player_id;
        });
        if (data.is_finished) {
            player.wins++;
            return;
        }
        if (data.is_undo) {
            delete this.state.throws[data.current_player_id][data.darts_thrown]
        } else {
            this.state.throws[data.current_player_id][data.darts_thrown] = { score: data.score, multiplier: data.multiplier };
        }

        if (this.state.matchType === matchTypes.SHOOTOUT || this.state.matchType === matchTypes.CRICKET || this.state.matchType === matchTypes.DARTS_AT_X ||
            this.state.matchType === matchTypes.AROUND_THE_WORLD || this.state.matchType === matchTypes.SHANGHAI || this.state.matchType === matchTypes.AROUND_THE_CLOCK ||
            this.state.matchType === matchTypes.TIC_TAC_TOE || this.state.matchType === matchTypes.BERMUDA_TRIANGLE || this.state.matchType === matchTypes.GOTCHA ||
            this.state.matchType === matchTypes.JDC_PRACTICE || this.state.matchType === matchTypes.KNOCKOUT) {
            if (data.is_undo) {
                player.current_score -= (data.score * data.multiplier);
            } else {
                player.current_score += (data.score * data.multiplier);
            }
        } else  {
            if (data.is_undo) {
                player.current_score += (data.score * data.multiplier);
            } else {
                player.current_score -= (data.score * data.multiplier);
            }
        }
        this.setStateDirty("throws");
    },

    onScoreUpdate(data) {
        for (let i = 0; i < data.players.length; i++) {
            const player = data.players[i];
            if (player.is_current_player) {
                this.state.throws[player.player_id] = [];
            }
        }
        this.state.leg_players = data.players;
    }
};