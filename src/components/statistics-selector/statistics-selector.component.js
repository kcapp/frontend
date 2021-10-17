var types = require("../scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        this.state = {
            type: types.X01,
            types: [
                { id: types.X01, name: "X01" },
                { id: types.SHOOTOUT, name: "Shooutout" },
                { id: types.X01HANDICAP, name: "X01 Handicap" },
                { id: types.CRICKET, name: "Cricket" },
                { id: types.DARTS_AT_X, name: "99 Darts At" },
                { id: types.AROUND_THE_WORLD, name: "Around The World" },
                { id: types.SHANGHAI, name: "Shanghai" },
                { id: types.AROUND_THE_CLOCK, name: "Around The Clock" },
                { id: types.TIC_TAC_TOE, name: "Tic Tac Toe" },
                { id: types.BERMUDA_TRIANGLE, name: "Bermuda Triangle" },
                { id: types.FOUR_TWENTY, name: "420" },
                { id: types.KILL_BULL, name: "Kill Bull" },
                { id: types.GOTCHA, name: "Gotcha" },
                { id: types.JDC_PRACTICE, name: "JDC Practice" },
                { id: types.KNOCKOUT, name: "Knockout" },
            ]
        }
    },
    changeType(event) {
        this.state.type = event.target.value;
        this.emit('type-changed', this.state.type);
    }
}