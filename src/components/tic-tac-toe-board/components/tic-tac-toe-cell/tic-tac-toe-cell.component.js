module.exports = {
    onInput(input) {
        this.state = {
            clean: true,
            original: input.parameters.numbers[input.idx],
            number: input.parameters.numbers[input.idx]
        }
    },
    reset() {
        this.state.number = this.state.original;
        this.clean = true;
    },
    updateValue(value, multiplier) {
        var num = value;

        if (this.state.number == 'HIT' && value === 0) {
            num = "HIT";
        } else if (num == 0 && multiplier == 2) {
            num = "HIT";
        } else if (num <= 1) {
            num = "Miss";
        } else if ((num % 2 == 0 && num <= 40)) {
            num = `D-${num/2}`;
        } else if (num == 50) {
            num = `D-Bull`;
        }
        this.state.number = num;
        this.state.clean = false;
    }
};
