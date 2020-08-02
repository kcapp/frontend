var types = require("../scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        this.state = {
            type: types.X01,
            types: [
                { id: types.X01, name: "X01" },
                { id: types.SHOOTOUT, name: "Shooutout" },
                { id: types.CRICKET, name: "Cricket" },
                { id: types.DARTS_AT_X, name: "99 Darts At" },
                { id: types.AROUND_THE_WORLD, name: "Around The World" },
                { id: types.SHANGHAI, name: "Shanghai" },
                { id: types.AROUND_THE_CLOCK, name: "Around The Clock" },
                { id: types.TIC_TAC_TOE, name: "Tic Tac Toe" }
            ]
        }
    },
    changeType(event) {
        this.state.type = event.target.value;
        this.emit('type-changed', this.state.type);
    }
}