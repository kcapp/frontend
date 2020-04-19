module.exports = {
    onCreate(input) {
        this.state = {
            compactMode: false,
            players: input.players
        }
    },

    onButtonPress(score, multiplier, isUndo) {
        this.emit('score-button-pressed', score, multiplier, isUndo);
    },

    onScoreUpdate(data) {
        this.state.players = data.players;
        this.setStateDirty("players");
    }
}