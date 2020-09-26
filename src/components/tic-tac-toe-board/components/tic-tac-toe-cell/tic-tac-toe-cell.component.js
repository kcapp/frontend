var types = require('../../../scorecard/components/match_types');

module.exports = {
    onInput(input) {
        this.state = {
            clean: true,
            original: input.parameters.numbers[input.idx],
            number: input.parameters.numbers[input.idx],
            outshotTypeId: input.parameters.outshot_type.id
        }
        if (!input.parameters.hits[this.state.number]) {
            this.state.number = this.getText(this.state.original, 1);
        }
    },
    reset() {
        this.state.number = this.getText(this.state.original, 1);
        this.clean = true;
    },
    getText(value, multiplier) {
        var isHit = (this.state.outshotTypeId == types.OUTSHOT_ANY) || (this.state.outshotTypeId == types.OUTSHOT_DOUBLE && multiplier == 2)
            || (this.state.outshotTypeId == types.OUTSHOT_MASTER && (multiplier == 2 || multiplier == 3));

        var text = value;
        var outDouble = (value > 0 && value % 2 == 0 && (value <= 40 || value == 50)) ? (value == 50 ? `D-Bull` : `D-${value/2}`) : undefined
        var outTriple = (this.state.outshotTypeId == types.OUTSHOT_MASTER || this.state.outshotTypeId == types.OUTSHOT_ANY) && (value > 0 && value % 3 == 0 && value <= 60) ? `T-${value/3}` : undefined;
        var outSingle = (this.state.outshotTypeId == types.OUTSHOT_ANY) && (value <= 20 || value == 25) ? (value == 25 ? "Bull" : value) : undefined;

        if (outSingle) {
            text = outSingle;
        } else if (outDouble && outTriple) {
            text = `${outDouble} / ${outTriple}`;
        } else if (outTriple) {
            text = outTriple;
        } else if (outDouble) {
            text = outDouble;
        }

        if (this.state.number == 'HIT' && value === 0) {
            text = "HIT";
        } else if (value == 0 && isHit) {
            text = "HIT";
        } else if (value <= 1 && this.state.outshotTypeId != types.OUTSHOT_ANY) {
            text = "Miss";
        } else if (value < 1) {
            text = "Miss";
        }

        return text;
    },
    updateValue(value, multiplier) {
        this.state.number = this.getText(value, multiplier);
        this.state.clean = false;
    }
};
