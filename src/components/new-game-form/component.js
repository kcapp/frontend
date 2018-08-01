const _ = require("underscore");

module.exports = {
    onCreate() {

    },
    onInput(input) {
        this.state = {
            selected: [],
            players: input.players,
            input: input,
            options: {
                starting_score: 301,
                game_type: 1,
                game_mode: 1,
                stake: null,
                venue: null
            }
        }
    },
    addPlayer(event, selected) {
        var player = selected.input.player;

        this.state.players = _.reject(this.state.players, function (el) { return el.id === player.id; });
        this.setStateDirty('players');

        this.state.selected.push(player);
        this.setStateDirty('selected');
    },
    removePlayer(event, selected) {
        var player = selected.input.player;

        this.state.selected = _.reject(this.state.selected, function (el) { return el.id === player.id; });
        this.setStateDirty('selected');

        var players = this.state.players;
        players.push(player);
        this.state.players = _.sortBy(players, 'name');
        this.setStateDirty('players');
    },
    newGame(event) {
        console.log(this.state.options);
        event.preventDefault();
    },

    handleScoreChange(event, selectedEl) {
        this.state.options.starting_score = selectedEl.value;
    },
    handleTypeChange(event, selectedEl) {
        this.state.options.game_type = selectedEl.value;
    },
    handleModeChange(event, selectedEl) {
        this.state.options.game_mode = selectedEl.value;
    },
    handleStakeChange(event, selectedEl) {
        this.state.options.stake = selectedEl.value;
    },
    handleVenueChange(event, selectedEl) {
        this.state.options.venue = selectedEl.value;
    }
}