var _ = require("underscore");
var axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            legId: input.legId,
            warmupStarted: false,
            old: input.players,
            new: [],
            submitting: false
        }
    },

    onMount() {
        var modal = document.getElementById('modal-player-order');
        modal.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },

    onKeyPress(e) {
        if (e.key === 'Enter') {
            if (this.state.submitting) {
                e.preventDefault();
                return;
            }
            this.startMatch();
        } else if (e.key == '0') {
            this.startWarmup();
        } else if (e.key == 'r') {
            this.reconnectSmartboard();
        } else {
            var player = this.input.players[parseInt(e.key) - 1]
            if (player) {
                var exist = _.findWhere(this.state.old, { player_id: player.player_id });
                if (exist) {
                    this.addPlayer(player);
                } else {
                    this.removePlayer(player);
                }
            }
        }
        e.stopPropagation();
    },

    playerSelected(event, selected) {
        var playerId = parseInt(selected.getAttribute('data-player-id'));
        var player = _.findWhere(this.state.old, { player_id: playerId });
        this.addPlayer(player);
    },

    playerReset(event, selected) {
        var playerId = parseInt(selected.getAttribute('data-player-id'));
        var player = _.findWhere(this.state.new, { player_id: playerId });
        this.removePlayer(player);
    },

    addPlayer(player) {
        this.state.old = _.reject(this.state.old, function (el) { return el.player_id === player.player_id; });
        this.setStateDirty('old');

        this.state.new.push(player);
        this.setStateDirty('new');
    },

    removePlayer(player) {
        this.state.new = _.reject(this.state.new, function (el) { return el.player_id === player.player_id; });
        this.setStateDirty('new');

        this.state.old.push(player);
        this.setStateDirty('old');
    },

    startWarmup(event) {
        if (this.state.warmupStarted) {
            return;
        }
        this.emit('warmup-started');
        this.getEl('btn-start-warmup').disabled = true;
        this.state.warmupStarted = true;
    },

    reconnectSmartboard(event) {
        this.emit('smartboard-reconnect');
    },

    startMatch(event) {
        this.state.submitting = true;
        if (this.state.old.length !== 0) {
            alert("All players must be selected before starting");
            return;
        }
        // Announce warmup if it's not already done
        this.startWarmup();

        const players = this.state.new;
        const order = {};
        for (let i = 0; i < players.length; i++) {
            order[players[i].player_id] = i + 1;
        }
        axios.put(`${window.location.origin}/legs/${this.state.legId}/order`, order)
            .then(response => {
                this.emit('warmup-started');
                location.href = `/legs/${this.state.legId}`;
            }).catch(error => {
                this.state.submitting = false;
                alert('Error changing player order. Please reload');
                console.log(error);
                location.reload();
            });
    }
};