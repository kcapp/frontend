const _ = require("underscore");
const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            legId: input.legId,
            warmupStarted: false,
            old: input.players,
            new: []
        }
    },

    onMount() {
        var modal = document.getElementById('modal-player-order');
        modal.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },

    onKeyPress(e) {
        if (e.key === 'Enter') {
            this.startMatch();
        } else if (e.key == '0') {
            this.startWarmup();
        } else {
            var player = this.input.players[parseInt(e.key) - 1]
            if (player) {
                var exist = _.where(this.state.old, { player_id: player.player_id })[0];
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
        var player = _.where(this.state.old, { player_id: playerId })[0];
        this.addPlayer(player);
    },

    playerReset(event, selected) {
        var playerId = parseInt(selected.getAttribute('data-player-id'));
        var player = _.where(this.state.new, { player_id: playerId })[0];
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

    startMatch(event) {
        // Announce warmup if it's not already done
        this.startWarmup();

        if (this.state.old.length !== 0) {
            alert("All players must be selected before starting");
            return;
        }

        var players = this.state.new;
        var order = {};
        for (var i = 0; i < players.length; i++) {
            order[players[i].player_id] = i + 1;
        }
        axios.put(window.location.origin + '/legs/' + this.state.legId + '/order', order)
            .then(response => {
                location.href = '/legs/' + this.state.legId;
            }).catch(error => {
                alert('Error changing player order. Please reload');
                console.log(error);
                location.reload();
            });
    }
};