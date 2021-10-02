const _ = require("underscore");
const axios = require('axios');
const localStorage = require("../../../../util/localstorage");
const types = require("../../../../components/scorecard/components/match_types.js")

module.exports = {
    onCreate(input) {
        this.state = {
            selected: [],
            players: _.reject(input.players, (player) => { return player.is_bot; }),
            input: input,
            officeId: 0,
            venues: input.venues,
            options: {
                starting_score: 501,
                game_type: types.X01,
                game_mode: 1,
                outshot_type: types.OUTSHOT_DOUBLE,
                stake: null,
                venue: null
            },
            playerId: "",
            submitting: false
        }
    },
    onMount() {
        const officeId = localStorage.getInt("office_id");
        if (officeId) {
            if (!this.input.offices[officeId]) {
                // Unset stored value if it points to a non-existing office
                localStorage.remove("office_id");
                localStorage.remove("venue");
            } else {
                this.changeOffice(officeId, this.input.offices[officeId]);
            }
        }
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
                    if (!this.state.submitting) {
                        this.newGame();
                    }
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
            case '1':
                this.state.playerId += '1'; break;
            case '2':
                this.state.playerId += '2'; break;
            case '3':
                this.state.playerId += '3'; break;
            case '4':
                this.state.playerId += '4'; break;
            case '5':
                this.state.playerId += '5'; break;
            case '6':
                this.state.playerId += '6'; break;
            case '7':
                this.state.playerId += '7'; break;
            case '8':
                this.state.playerId += '8'; break;
            case '9':
                this.state.playerId += '9'; break;
            case '0':
                this.state.playerId += '0'; break;
            case '/':
                var component = this.getComponent('game-type');
                component.state.index = this.cycleValues(this.state.input.types, this.state.options.game_type);
                this.state.options.game_type = component.state.index;
                this.onGameTypeChanged('game_type', component.state.index);
                break;
            case '*':
                var component = this.getComponent('starting-score');
                if (this.state.options.game_type === types.X01 || this.state.options.game_type === types.X01HANDICAP) {
                    var score = this.cycleValues(this.state.input.scores, this.state.options.starting_score);
                    if (score === 0) {
                        // Don't allow cycling to 0 as starting score
                        score = this.cycleValues(this.state.input.scores, score);
                    }
                    component.state.index = score
                    this.state.options.starting_score = component.state.index;
                } else if (this.state.options.game_type === types.DARTS_AT_X || this.state.options.game_type === types.TIC_TAC_TOE) {
                    var score = this.cycleValues(component.state.values, component.state.index);
                    component.state.index = score
                    this.state.options.starting_score = component.state.index;
                }
                break;
            case '-':
                var component = this.getComponent('game-mode');
                component.state.index = this.cycleValues(this.state.input.modes, this.state.options.game_mode);
                this.state.options.game_mode = component.state.index;
                break;
            case '+':
                var component = this.getComponent('stake');
                if (component.state.index === this.input.stakes.length) {
                    component.state.index = -1;
                } else {
                    component.state.index = this.cycleValues(this.state.input.stakes, this.state.options.stake);
                }
                this.state.options.stake = component.state.index;
                break;
            default:
                break; // NOOP
        }
    },
    cycleValues(values, current) {
        if (values.length > 0) {
            var index = _.findIndex(values, (value) => { return value.id === current });
            return values[(index + 1) % values.length].id;
        }
    },
    onGameTypeChanged(attribute, value) {
        if (attribute == 'game_type') {
            // If this is 9 Dart Shootout or Cricket, make sure to set score to 0 and disable the selector
            var scoreComponent = this.getComponent('starting-score');
            scoreComponent.updateOptions(this.input.scores);
            if (this.state.options.game_type === types.SHOOTOUT || this.state.options.game_type == types.CRICKET || this.state.options.game_type === types.AROUND_THE_WORLD ||
                this.state.options.game_type === types.SHANGHAI || this.state.options.game_type === types.AROUND_THE_CLOCK || this.state.options.game_type === types.BERMUDA_TRIANGLE ||
                this.state.options.game_type === types.JDC_PRACTICE) {
                scoreComponent.state.index = 0;
                scoreComponent.state.enabled = false;
            } else if (this.state.options.game_type == types.TIC_TAC_TOE) {
                scoreComponent.updateOptions(types.SCORES_TIC_TAC_TOE);
                scoreComponent.state.index = 20;
                scoreComponent.state.enabled = true;
            } else if (this.state.options.game_type == types.DARTS_AT_X) {
                scoreComponent.updateOptions(types.SCORES_DARTS_AT_X);
                scoreComponent.state.index = 20;
                scoreComponent.state.enabled = true;
            } else if (this.state.options.game_type === types.FOUR_TWENTY) {
                scoreComponent.updateOptions(types.SCORES_FOUR_TWENTY);
                scoreComponent.state.index = 420;
                scoreComponent.state.enabled = false;
            } else if (this.state.options.game_type === types.KILL_BULL) {
                scoreComponent.updateOptions(types.SCORES_KILL_BULL);
                scoreComponent.state.index = 200;
                scoreComponent.state.enabled = true;
            } else if (this.state.options.starting_score === 0) {
                scoreComponent.state.index = scoreComponent.state.defaultValue;
                scoreComponent.state.enabled = true;
            } else if (this.state.options.game_type === types.GOTCHA) {
                scoreComponent.updateOptions(types.SCORES_GOTCHA);
                scoreComponent.state.index = 200;
                scoreComponent.state.enabled = true;
            } else {
                scoreComponent.state.index = scoreComponent.state.defaultValue;
                scoreComponent.state.enabled = true;
            }
            this.state.options.starting_score = scoreComponent.state.index

            var selectedPlayers = this.getComponents('players');
            for (var i = 0; i < selectedPlayers.length; i++) {
                selectedPlayers[i].handleTypeChange(this.state.options.game_type);
            }
            this.setStateDirty("options");
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
        this.state.submitting = true;

        var officeId = this.state.officeId;
        if (officeId <= 0) {
            if (officeId == 0 && this.state.options.venue && this.state.options.venue !== -1) {
                officeId = this.input.venues[this.state.options.venue].office_id;
            } else {
                officeId = null;
            }
        }

        var venueId = this.state.options.venue;
        if (venueId <= 0) {
            venueId = null;
        }

        var handicaps = {};
        if (this.state.options.game_type === types.X01HANDICAP) {
            for (var i = 0; i < this.state.selected.length; i++) {
                var player = this.state.selected[i];
                if (player.handicap) {
                    handicaps[player.id] = player.handicap;
                }
            }
        }

        var body = {
            starting_score: this.state.options.starting_score,
            match_type: this.state.options.game_type,
            match_mode: this.state.options.game_mode,
            match_stake: this.state.options.stake,
            outshot_type: this.state.options.outshot_type,
            venue: venueId,
            players: this.state.selected.map(player => player.id),
            office_id: officeId,
            player_handicaps: handicaps
        }
        axios.post(window.location.origin + '/matches/new', body)
            .then(response => {
                // Store venue in localstorage so it doesn't have to be selected each time
                localStorage.set('venue', this.state.options.venue);
                location.href = 'legs/' + response.data.current_leg_id
            }).catch(error => {
                this.state.submitting = false;

                var msg = error.response.data ? error.response.data : "See log for details";
                alert(`Error starting match. ${msg}`);
                console.log(error);
            });
        if (event) {
            event.preventDefault();
        }
    },
    playOfficial(event) {
        location.href = '/tournaments/current#unplayed';
        event.preventDefault();
    },
    changeOffice(officeId, office) {
        this.state.officeId = officeId;

        if (officeId == 0) {
            this.state.players =  _.reject(this.input.players, (player) => { return player.is_bot; });
            this.state.venues = this.input.venues;
        } else {
            if (office.is_global) {
                this.state.players =  _.reject(this.input.players, (player) => { return player.is_bot; });
            } else {
                this.state.players = _.reject(this.input.players, (player) => { return player.office_id != officeId || player.is_bot; });
            }
            this.state.venues = _.reject(this.input.venues, (venue) => { return venue.office_id != officeId; });
        }
        this.getComponent('venue').updateOptions(this.state.venues);

        // Remove any players already selected
        this.state.players = _.reject(this.state.players, (player) => {
            for (var i = 0; i < this.state.selected.length; i++) {
                if (player.id === this.state.selected[i].id) {
                    return true;
                }
            }
            return false;
        });

        this.setStateDirty('players');
        this.setStateDirty('venues');
        localStorage.set('office_id', this.state.officeId);
    }
}