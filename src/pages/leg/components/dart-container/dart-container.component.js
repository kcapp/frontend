const alertify = require("../../../../util/alertify");

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
    getMultiplier() {
        return this.state.multiplier;
    },
    reset() {
        this.state = this.initialState();
    },
    setDart(value, multiplier) {
        var dart = this.state;

        var newValue = parseInt(dart.value + '' + value);
        if (newValue > 20 && newValue !== 25) {
            alertify.alert('Invalid Value', () => { });
            return;
        }

        dart.text += value;
        dart.value = newValue;
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
    },
    toJSON() {
        return {
            value: this.state.value,
            multiplier: this.state.multiplier
        }
    }
};
