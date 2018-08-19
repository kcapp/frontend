const _ = require("underscore");

module.exports = {
    onCreate() {
    },
    onInput(input) {
        this.state = {
            players: input.players,
            player: {},
            selected: []
        }
    },
    playerChecked(playerId) {
        this.state.player = _.findWhere(this.state.players, { id: playerId });
    },
    addPlayer() {
        // When add player button is clicked, clear the selected player
        this.state.player = {};
    }
};