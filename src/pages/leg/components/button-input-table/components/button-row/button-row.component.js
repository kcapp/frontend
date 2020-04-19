module.exports = {
    onButtonPressed(score, multiplier, isUndo) {
        this.emit('button-press', score, multiplier, isUndo);
    }
}