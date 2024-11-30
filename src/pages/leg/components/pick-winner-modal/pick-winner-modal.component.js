const _ = require("underscore");
const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            legId: input.legId,
            players: input.players,
            winner: undefined,
            submitting: false
        }
    },

    onMount() {
        const modal = document.getElementById('pick-winner-modal');
        modal.addEventListener("keydown", this.onKeyDown.bind(this), false);
        modal.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },
    onKeyPress(e) {
        e.stopPropagation();
    },
    onKeyDown(e) {
        if (e.key === 'Enter') {
            if (this.state.submitting) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            this.confirmWinner();

            // We don`t want to submit darts in the background
            e.preventDefault();
        } else if (e.key == 'ESC') {
            // Don`t allow closing this modal
            e.preventDefault();
        } else {
            const player = this.input.players[parseInt(e.key) - 1];
            if (player) {
                const exist = _.findWhere(this.state.players, { player_id: player.player_id });
                if (exist) {
                    this.addPlayer(player);
                } else {
                    this.removePlayer(player);
                }
            }
        }
        e.stopPropagation();
    },

    playerSelected(playerId) {
        const player = _.findWhere(this.input.players, { player_id: playerId });
        this.addPlayer(player);
    },

    addPlayer(player) {
        this.state.players = _.reject(this.input.players, (p) => p.player_id === player.player_id);
        this.setStateDirty('players');

        this.state.winner = player;
        this.setStateDirty('winner');
    },

    removePlayer(player) {
        this.state.winner = undefined;
        this.setStateDirty('winner');

        this.state.players.push(player);
        this.setStateDirty('players');
    },

    confirmWinner(event) {
        this.state.submitting = true;
        if (!this.state.winner) {
            alert("Please select a winner");
            this.state.submitting = false;
            return;
        }
        axios.put(`${window.location.origin}/legs/${this.state.legId}/finish`, { winner_id: this.state.winner.player_id })
            .then(response => {
                const match = response.data.match;
                if (match.is_finished) {
                    location.href = `/matches/${match.id}/result?finished=true`;
                } else {
                    location.href = `/legs/${response.data.leg_id}`;
                }
            }).catch(error => {
                this.state.submitting = false;
                alert('Error choosing winner. Please reload');
                console.log(error);
                location.reload();
            });
    }
};