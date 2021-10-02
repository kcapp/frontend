var _ = require('underscore');

module.exports = {
    onCreate(input) {
        this.state = {
            compactMode: false,
            allButtonsMode: false,
            players: input.players,
            current: this.findCurrent(input.players),
            currentDart: 0
        }
    },

    findCurrent(players) {
        return _.find(players, (player) => player.is_current_player);
    },

    onButtonPress(score, multiplier, isUndo) {
        this.state.currentDart = isUndo ? this.state.currentDart - 1 : this.state.currentDart + 1;
        this.emit('score-button-pressed', score, multiplier, isUndo);
    },

    onScoreUpdate(data) {
        this.state.currentDart = 0;
        this.state.players = data.players;
        this.state.current = this.findCurrent(this.state.players);
        this.setStateDirty("players");
    }
}