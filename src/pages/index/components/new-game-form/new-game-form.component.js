var _ = require("underscore");
var axios = require('axios');
var localStorageUtil = require("../../../../util/localstorage");
var types = require("../../../../components/scorecard/components/match_types.js")

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
                game_type: 1,
                game_mode: 1,
                stake: null,
                venue: null
            },
            playerId: ""
        }
    },
    onMount() {
        var officeId = localStorageUtil.getInt("office_id");
        if (officeId) {
            if (!this.input.offices[officeId]) {
                // Unset stored value if it points to a non-existing office
                localStorageUtil.remove("office_id");
                localStorageUtil.remove("venue");
            } else {
                this.changeOffice(officeId);
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
                // Don't allow cycling of score when 9 Dart Shootout or Cricket is selected
                if (this.state.options.game_type === types.X01 || this.state.options.game_type === types.X01HANDICAP) {
                    var component = this.getComponent('starting-score');
                    var score = this.cycleValues(this.state.input.scores, this.state.options.starting_score);
                    if (score === 0) {
                        // Don't allow cycling to 0 as starting score
                        score = this.cycleValues(this.state.input.scores, score);
                    }
                    component.state.index = score
                    this.state.options.starting_score = component.state.index;
                } else if (this.state.options.game_type === types.DARTS_AT_X) {
                    var component = this.getComponent('starting-score');
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
        var index = _.findIndex(values, (value) => { return value.id === current });
        return values[(index + 1) % values.length].id;
    },
    onGameTypeChanged(attribute, value) {
        if (attribute == 'game_type') {
            // If this is 9 Dart Shootout or Cricket, make sure to set score to 0 and disable the selector
            var scoreComponent = this.getComponent('starting-score')
            scoreComponent.updateOptions(this.input.scores);
            if (this.state.options.game_type === types.SHOOTOUT || this.state.options.game_type == types.CRICKET ||
                this.state.options.game_type === types.AROUND_THE_WORLD || this.state.options.game_type === types.SHANGHAI || this.state.options.game_type === types.AROUND_THE_CLOCK) {
                scoreComponent.state.index = 0;
                scoreComponent.state.enabled = false;
            } else if (this.state.options.game_type == types.DARTS_AT_X) {
                scoreComponent.updateOptions([
                    { id: 20, name: 20 },  { id: 19, name: 19 }, { id: 18, name: 18 }, { id: 17, name: 17 },
                    { id: 16, name: 16 }, { id: 15, name: 15 }, { id: 14, name: 14 }, { id: 13, name: 13 },
                    { id: 12, name: 12 }, { id: 11, name: 11 }, { id: 10, name: 10 }, { id: 9, name: 9 },
                    { id: 8, name: 8 }, { id: 7, name: 7 }, { id: 6, name: 6 }, { id: 5, name: 5 },
                    { id: 4, name: 4 }, { id: 3, name: 3 }, { id: 2, name: 2 }, { id: 1, name: 1 }, { id: 25, name: 'Bull' } ]);
                scoreComponent.state.index = 20;
                scoreComponent.state.enabled = true;
            } else if (this.state.options.starting_score === 0) {
                scoreComponent.state.index = scoreComponent.state.defaultValue;
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
            venue: venueId,
            players: this.state.selected.map(player => player.id),
            office_id: officeId,
            player_handicaps: handicaps
        }
        axios.post(window.location.origin + '/matches/new', body)
            .then(response => {
                // Store venue in localstorage so it doesn't have to be selected each time
                localStorageUtil.set('venue', this.state.options.venue);
                location.href = 'legs/' + response.data.current_leg_id
            }).catch(error => {
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
    changeOffice(officeId) {
        this.state.officeId = officeId;

        if (officeId == 0) {
            this.state.players =  _.reject(this.input.players, (player) => { return player.is_bot; });
            this.state.venues = this.input.venues;
        } else {
            this.state.players = _.reject(this.input.players, (player) => { return player.office_id != officeId || player.is_bot; });
            this.state.venues = _.reject(this.input.venues, (venue) => { return venue.office_id != officeId; });
        }
        this.setStateDirty('players');
        this.setStateDirty('venues');
        localStorageUtil.set('office_id', this.state.officeId);
    }
}