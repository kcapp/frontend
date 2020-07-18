var _ = require("underscore");
var axios = require('axios');
var localStorageUtil = require("../../../../util/localstorage");
var skill = require('kcapp-bot/bot-skill');

var NINE_DART_SHOOTOUT = 2;

module.exports = {
    onCreate(input) {
        this.state = {
            selected: [],
            bots:  _.reject(input.players, function (player) { return player.is_bot === false; }),
            bot: { mock_player_id: null, skill: 2, type: skill.TYPE_SKILL },
            mock_players: _.reject(input.players, (player) =>  { return player.matches_played < 100; }),
            skill: skill,
            players: _.reject(input.players, function (player) { return player.is_bot === true }),
            input: input,
            officeId: 0,
            venues: input.venues,
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
        var officeId = localStorageUtil.getInt("office_id");
        if (officeId) {
            this.changeOffice(officeId);
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

                // If this is 9 Dart Shootout, make sure to set score to 0 and disable the selector
                var scoreComponent = this.getComponent('starting-score')
                if (this.state.options.game_type === NINE_DART_SHOOTOUT) {
                    scoreComponent.state.index = 0;
                    scoreComponent.state.enabled = false;
                } else if (this.state.options.starting_score === 0) {
                    scoreComponent.state.index = scoreComponent.state.defaultValue;
                    scoreComponent.state.enabled = true;
                }
                this.state.options.starting_score = scoreComponent.state.index
                break;
            case '*':
                // Don't allow cycling of score when 9 Dart Shootout is selected
                if (this.state.options.game_type !== NINE_DART_SHOOTOUT) {
                    var component = this.getComponent('starting-score');
                    var score = this.cycleValues(this.state.input.scores, this.state.options.starting_score);
                    if (score === 0) {
                        // Don't allow cycling to 0 as starting score
                        score = this.cycleValues(this.state.input.scores, score);
                    }
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
                component.state.index = this.cycleValues(this.state.input.stakes, this.state.options.stake);
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

        var bot = this.state.bots[0];

        var botPlayerConfig = {};
        if (this.state.bot.type == this.state.skill.TYPE_MOCK) {
            botPlayerConfig[bot.id] = { player_id: this.state.bot.mock_player_id, skill_level: 0 };
        } else {
            botPlayerConfig[bot.id] = { player_id: null, skill_level: this.state.bot.skill };
        }
        var players = this.state.selected.map(player => player.id);
        players.push(bot.id);

        var body = {
            starting_score: this.state.options.starting_score,
            match_type: this.state.options.game_type,
            match_mode: this.state.options.game_mode,
            match_stake: this.state.options.stake,
            venue: this.state.options.venue,
            players: players,
            office_id: officeId,
            bot_player_config: botPlayerConfig,
            // TODO need to add support for handicaps
            player_handicaps: {}
        }
        axios.post(window.location.origin + '/matches/new', body)
            .then(response => {
                // Store venue in localstorage so it doesn't have to be selected each time
                localStorageUtil.set('venue', this.state.options.venue);
                location.href = 'legs/' + response.data.current_leg_id
            }).catch(error => {
                alert("Error starting match. See log for details");
                console.log(error);
            });
        if (event) {
            event.preventDefault();
        }
    },
    changeOffice(officeId) {
        this.state.officeId = officeId;

        if (officeId == 0) {
            this.state.players = this.input.players;
            this.state.venues = this.input.venues;
        } else {
            this.state.players = _.reject(this.input.players, (player) => { return player.office_id != officeId || player.is_bot;  });
            this.state.venues = _.reject(this.input.venues, (venue) => { return venue.office_id != officeId; });
        }

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
        localStorageUtil.set('office_id', this.state.officeId);
    },
    botTypeChanged(event) {
        this.state.bot.type = parseInt(event.target.value);
        if (this.state.bot.type === skill.TYPE_MOCK) {
            this.state.bot.mock_player_id = this.state.mock_players[0].id;
        } else {
            this.state.bot.mock_player_id = null;
        }
        this.setStateDirty('bot');
    },
    changeBotMock(event) {
        this.state.bot.mock_player_id = parseInt(event.target.value);
        event.preventDefault();
    },
    changeBotSkill(event) {
        this.state.bot.skill = parseInt(event.target.value);
        event.preventDefault();
    }
}