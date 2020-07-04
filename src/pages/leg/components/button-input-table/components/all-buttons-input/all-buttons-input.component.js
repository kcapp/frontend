module.exports = {
    onButtonPress(score, multiplier, isUndo) {
        this.emit('button-press', score, multiplier, isUndo);
    }
}