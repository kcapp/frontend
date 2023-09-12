const _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = this.updateState(input.leg.parameters);
    },
    onMount() {
        this.updateBoard();
    },
    updateState(params) {
        const closed = [];
        for (let i = 0; i < params.numbers.length; i++) {
            const num = params.numbers[i];
            if (params.hits[num]) {
                closed.push(i);
            }
        }
        return {
            hits: params.hits,
            parameters: JSON.parse(JSON.stringify(params)), // make a copy since we modify the numbers
            closed: closed
        }
    },
    resetBoard(parameters) {
        this.state = this.updateState(parameters);
        this.updateBoard();
    },
    updateBoard(score = 0, multiplier = 1, isUndo = false) {
        const cells = this.getComponents("tic-tac-toe-cell");
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            let num = this.state.parameters.numbers[i];

            if (!this.state.closed.includes(i)) {
                const scored = score * multiplier;
                num = isUndo ? num + scored : num - scored;
                cell.updateValue(num, multiplier);
            }
            this.state.parameters.numbers[i] = num;
        }
    }
};
