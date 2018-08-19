module.exports = {
    onCreate() {

    },
    onInput(input) {
        var player = input.player;
        this.state = {
            isCurrentPlayer: player.is_current_player,
            totalScore: 0,
            throws: [],
            currentDart: 1
        }
        // Make this array 1-index based, so it matches thrown darts
        this.state.throws[1] = { value: 0, text: '', multiplier: 1, class: 'dart-score-single' };
        this.state.throws[2] = { value: 0, text: '', multiplier: 1, class: 'dart-score-single' };
        this.state.throws[3] = { value: 0, text: '', multiplier: 1, class: 'dart-score-single' };
    },
    getCurrentValue() {
        return this.state.throws[this.state.currentDart].value;
    },
    getCurrentMultiplier() {
        return this.state.throws[this.state.currentDart].multiplier;
    },
    confirmThrow() {
        var dart = this.state.throws[this.state.currentDart];
        this.state.totalScore += dart.value * dart.multiplier;
        this.state.currentDart++;
    },
    setMultiplier(multiplier) {
        if (this.state.currentDart > 3) {
            return;
        }
        var dart = this.state.throws[this.state.currentDart];
        dart.multiplier = multiplier;
        if (dart.value !== 0) {
            if (multiplier === 3) {
                dart.class = 'dart-score-triple';
                dart.text = 'T-' + dart.value;
            } else if (multiplier === 2) {
                dart.class = 'dart-score-double';
                dart.text = 'D-' + dart.value;
            } else {
                dart.class = 'dart-score-single';
                dart.text = dart.value;
            }
        }
        this.setStateDirty('throws');
    },
    setValue(value) {
        if (value === '') {
            return;
        }
        var dart = this.state.throws[this.state.currentDart];
        dart.text += value;
        dart.value = parseInt(dart.value + '' + value);
        this.setStateDirty('throws');
    }
};