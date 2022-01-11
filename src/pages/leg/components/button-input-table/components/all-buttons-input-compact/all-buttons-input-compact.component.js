module.exports = {
    onCreate(input) {
        this.state = {
            multiplier: 1
        }
    },
    onButtonPress(score, multiplier, isUndo) {
        this.emit('button-press', score, multiplier, isUndo);
    },
    onMultiplierButtonPress(multiplier) {
        if (this.state.multiplier === multiplier) {
            this.state.multiplier = 1;
        } else {
            this.state.multiplier = multiplier;
        }
    }
}