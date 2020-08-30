var _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = this.updateState(input.leg.parameters);
    },
    updateState(params) {
        var closed = [];
        for (var i = 0; i < params.numbers.length; i++) {
            var num = params.numbers[i];
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

        var cells = this.getComponents("tic-tac-toe-cell");
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.reset();
        }
        this.setStateDirty("parameters");
    },
    updateBoard(score, multiplier, isUndo) {
        var cells = this.getComponents("tic-tac-toe-cell");
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var num = this.state.parameters.numbers[i];

            if (!this.state.closed.includes(i)) {
                var scored = score * multiplier;
                num = isUndo ? num + scored : num - scored;
                cell.updateValue(num, multiplier);
            }
            this.state.parameters.numbers[i] = num;
        }
    }
};
