const CLASS_DART_SINGLE = 'dart-score-single';
const CLASS_DART_DOUBLE = 'dart-score-double';
const CLASS_DART_TRIPLE = 'dart-score-triple';

module.exports = {
    onCreate() {
        this.state = this.initialState();
    },
    initialState() {
        return {
            text: '',
            class: '',
            value: 0,
            multiplier: 1
        }
    },
    getValue() {
        return this.state.value * this.state.multiplier;
    },
    reset() {
        this.state = this.initialState();
    },
    setDart(value, multiplier) {
        var dart = this.state;

        dart.text += value;
        dart.value = parseInt(dart.value + '' + value);
        dart.multiplier = multiplier;

        if (dart.value === 0) {
            dart.text = 'Miss';
            dart.class = CLASS_DART_SINGLE;
        } else if (multiplier === 3) {
            dart.class = CLASS_DART_TRIPLE;
            dart.text = 'T-' + dart.value;
        } else if (multiplier === 2) {
            dart.class = CLASS_DART_DOUBLE;
            dart.text = 'D-' + dart.value;
        } else {
            dart.class = CLASS_DART_SINGLE;
            dart.text = dart.value;
        }
    }
};
