const _ = require("underscore");
const axios = require('axios');
const localStorageUtil = require("../../util/localStorage");

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
            },
            playerId: ""
        }
    },
    onMount() {
        // Read venue from localStorage and set it
        this.state.options.venue = localStorageUtil.getInt("venue") || null;
        this.setStateDirty('options');

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },
    onKeyDown(e) {
        if (e.key === 'Backspace' || e.key === ',') {
            // Remove last player if Backspace or DEL is pressed
            var player = this.state.selected[this.state.selected.length - 1];
            this.removePlayer(null, { input: { player: player } });
            e.preventDefault();
        }
    },
    onKeyPress(e) {
        switch (e.key) {
            // Add players by entering player id and ENTER
            case 'Enter':
                var playerId = this.state.playerId;
                if (playerId == '00') {
                    this.newGame();
                    return;
                }
                this.state.playerId = '';

                var player = _.find(this.state.players, function (player) { return player.id == playerId; })
                if (player) {
                    // Player is not already added, so add it
                    this.addPlayer(null, { input: { player: player } });
                } else {
                    // Player is already added, so remove it
                    player = _.find(this.state.selected, function (player) { return player.id == playerId; })
                    if (!player) {
                        return;
                    }
                    this.removePlayer(null, { input: { player: player } });
                }
                break;
            case '1': this.state.playerId += '1'; break;
            case '2': this.state.playerId += '2'; break;
            case '3': this.state.playerId += '3'; break;
            case '4': this.state.playerId += '4'; break;
            case '5': this.state.playerId += '5'; break;
            case '6': this.state.playerId += '6'; break;
            case '7': this.state.playerId += '7'; break;
            case '8': this.state.playerId += '8'; break;
            case '9': this.state.playerId += '9'; break;
            case '0': this.state.playerId += '0'; break;
            case '/':
                var value = this.cycleValues(this.state.input.types, this.state.options.game_type);
                this.handleTypeChange(null, { value: value });
                break;
            case '*':
                var value = this.cycleValues(this.state.input.scores, this.state.options.starting_score, true);
                this.handleScoreChange(null, { value: value });
                break;
            case '-':
                var value = this.cycleValues(this.state.input.modes, this.state.options.game_mode);
                this.handleModeChange(null, { value: value });
                break;
            case '+':
                var value = this.cycleValues(this.state.input.stakes, this.state.options.stake);
                this.handleStakeChange(null, { value: value });
                break;
            default: /* NOOP */; break;
        }
    },
    cycleValues(values, current, raw = false) {
        var index = _.findIndex(values, (value) => { return (raw ? value : value.id) === current });
        index = (index + 1) % values.length;
        return raw ? values[index] : values[index].id;
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
        var body = {
            starting_score: this.state.options.starting_score,
            match_type: this.state.options.game_type,
            match_mode: this.state.options.game_mode,
            match_stake: this.state.options.stake,
            venue: this.state.options.venue,
            players: this.state.selected.map(player => player.id),
            // TODO need to add support for handicaps
            player_handicaps: {}
        }
        axios.post(window.location.origin + '/matches/new', body)
            .then(response => {
                // Store venue in localstorage so it doesn't have to be selected each time
                localStorageUtil.set('venue', this.state.options.venue);
                location.href = 'legs/' + response.data.current_leg_id
            }).catch(error => {
                console.log(error);
            });

        if (event) {
            event.preventDefault();
        }
    },
    handleTypeChange(event, selectedEl) {
        this.state.options.game_type = parseInt(selectedEl.value);
        if (this.state.options.game_type === 2) {
            this.state.options.starting_score = 0;
        } else if (this.state.options.starting_score === 0) {
            this.state.options.starting_score = 301;
        }
        this.setStateDirty('options');
    },
    handleScoreChange(event, selectedEl) {
        if (this.state.options.game_type !== 2) {
            this.state.options.starting_score = parseInt(selectedEl.value);
            this.setStateDirty('options');
        }
    },
    handleModeChange(event, selectedEl) {
        this.state.options.game_mode = parseInt(selectedEl.value);
        this.setStateDirty('options');
    },
    handleStakeChange(event, selectedEl) {
        this.state.options.stake = parseInt(selectedEl.value);
        this.setStateDirty('options');
    },
    handleVenueChange(event, selectedEl) {
        this.state.options.venue = parseInt(selectedEl.value);
        this.setStateDirty('options');
    }
}