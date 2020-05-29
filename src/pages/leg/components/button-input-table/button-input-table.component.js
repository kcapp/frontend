var _ = require('underscore');

module.exports = {
    onCreate(input) {
        this.state = {
            compactMode: false,
            players: input.players,
            current: this.findCurrent(input.players)
        }
    },

    findCurrent(players) {
        return _.find(players, (player) => player.is_current_player);
    },

    onButtonPress(score, multiplier, isUndo) {
        this.emit('score-button-pressed', score, multiplier, isUndo);
    },

    onScoreUpdate(data) {
        this.state.players = data.players;
        this.state.current = this.findCurrent(this.state.players);
        this.setStateDirty("players");
    }
}