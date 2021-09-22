const _ = require('underscore');
const axios = require('axios');
const localStorage = require('../../../util/localstorage.js');
const types = require("../../../components/scorecard/components/match_types.js")
const io = require('../../../util/socket.io-helper.js');

module.exports = {
    onCreate(input) {
        input.players = _.filter(input.players, (player) => {
            return !player.is_bot;
        });
        const steps = {
            INITIAL: 0,
            SELECT_PLAYERS: 1,
            SELECT_GAME_TYPE: 2,
            SELECT_GAME_MODE: 3,
            START: 4,
            CONTINUE_MATCH: 5
        };
        this.state = {
            steps: steps,
            step: steps.INITIAL,
            officeId: undefined,
            venueId: undefined,
            playersSelected: [],
            players: _.sortBy(input.players, (player) => player.name),
            gameType: undefined,
            scores: input.scores,
            startingScore: undefined,
            outshotType: undefined,
            gameMode: input.modes[0].id,
            handicaps: [ { id: 0, name: "0"}, { id: 100, name: "+100"}, { id: 200, name: "+200"}, { id: -1, name: "Custom"} ],
            playerHandicaps: {},
            matches: []
        }
    },
    onMount() {
        if (location.search.indexOf('configure') >= 0) {
            localStorage.remove('office_id');
            localStorage.remove('venue_id');
            localStorage.remove('controller');
        }

        if (!localStorage.get('controller')) {
            $('#modal-configure-controller').modal({ backdrop: 'static', keyboard: false });
        } else {
            const office = localStorage.get('office_id');
            if (office) {
                this.state.officeId = parseInt(office);
                this.state.players = _.reject(this.input.players, (player) => {
                    return player.office_id !== this.state.officeId;
                });
                const venue = localStorage.get('venue_id');
                if (venue) {
                    this.state.venueId = parseInt(venue);

                    const socket = io.connect(`${window.location.origin}/venue/${this.state.venueId}`);
                    socket.on('venue_new_match', (data) => {
                        location.href = `/legs/${data.leg_id}`;
                    });
                    socket.on('navigation', (data) => {
                        console.log(`Got navigation ${data}`);
                    });
                }
                this.setStateDirty('players');
            }
            if (this.state.venueId) {
                axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/venue/${this.state.venueId}/players`)
                    .then((ids) => {
                        const playerIds = ids.data;
                        this.state.players = _.sortBy(_.reject(this.input.players, (player) => {
                            return !playerIds.includes(player.id);
                        }), (player) => player.name);
                        this.setStateDirty('players');
                    }).catch(error => {
                        console.log(`Error when getting recent players ${error}`);
                    });
        }
        }
    },
    onNewMatch(e) {
        this.state.step = this.state.steps.SELECT_PLAYERS;
    },
    onContinueMatch(e) {
        axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/venue/${this.state.venueId}/matches`)
            .then((matchesData) => {
                this.state.matches = matchesData.data;
                this.setStateDirty('matches');
                this.state.step = this.state.steps.CONTINUE_MATCH;
            }).catch(error => {
                console.log(`Error when getting recent matches ${error}`);
            });
    },
    onTournamentMatch(e) {
        location.href = '/tournaments/current#unplayed';
    },
    onPrevious(arg, e, target) {
        if (target) {
            this.state.step = arg;
            e.preventDefault();
        } else {
            this.state.step--;
            arg.preventDefault();
        }
    },
    onNext(e) {
        this.state.step++;
        e.preventDefault();
    },
    showAll(e) {
        this.state.players = _.sortBy(this.input.players, (player) => player.name);
        this.setStateDirty('players');
        e.preventDefault();
    },
    onStart(e) {
        this.state.submitting = true;

        const officeId = this.state.officeId;
        const venueId = this.state.venueId;

        const body = {
            starting_score: this.state.startingScore,
            match_type: this.state.gameType,
            match_mode: this.state.gameMode,
            outshot_type: this.state.outshotType,
            venue: venueId,
            players: this.state.playersSelected.map(player => player.id),
            office_id: officeId,
            player_handicaps: this.state.playerHandicaps
        }
        axios.post(`${window.location.origin}/matches/new`, body)
            .then(response => {
                window.location.href = `legs/${response.data.current_leg_id}`;
            }).catch(error => {
                this.state.submitting = false;

                const msg = error.response.data ? error.response.data : "See log for details";
                alert(`Error starting match. ${msg}`);
                console.log(error);
            });
        e.preventDefault();
    },
    addPlayer(event, selected) {
        const player = selected.input.data;

        this.state.players = _.reject(this.state.players, (el) => {
            return el.id === player.id;
        });
        this.setStateDirty('players');

        this.state.playersSelected.push(player);
        this.setStateDirty('playersSelected');
    },
    removePlayer(event, selected) {
        const player = selected.input.data;

        this.state.playersSelected = _.reject(this.state.playersSelected, (el) => {
            return el.id === player.id;
        });
        this.setStateDirty('playersSelected');

        const players = this.state.players;
        players.push(player);
        this.state.players = _.sortBy(players, 'name');
        this.setStateDirty('players');
    },
    gameTypeSelected(event, selected) {
        const type = selected.input.data.id;
        this.state.gameType = type;
        this.state.outshotType = null;
        this.state.startingScore = null;

        if (type === types.SHOOTOUT || type === types.CRICKET || type === types.AROUND_THE_WORLD ||
            type === types.SHANGHAI || type === types.AROUND_THE_CLOCK || type === types.BERMUDA_TRIANGLE) {
            this.state.startingScore = 0;
            this.state.scores = null;
        } else if (type === types.TIC_TAC_TOE) {
            this.state.scores = types.SCORES_TIC_TAC_TOE;
            this.state.outshotType = this.input.outshots[2].id;
        } else if (type === types.DARTS_AT_X) {
            this.state.scores = types.SCORES_DARTS_AT_X;
        } else if (type === types.FOUR_TWENTY) {
            this.state.scores = types.SCORES_FOUR_TWENTY;
        } else if (type === types.KILL_BULL) {
            this.state.scores = types.SCORES_KILL_BULL;
        } else if (type === types.GOTCHA) {
            this.state.scores = types.SCORES_GOTCHA;
        } else if (type === types.X01) {
            this.state.scores = types.SCORES_x01;
        } else if (type === types.X01HANDICAP) {
            this.state.scores = types.SCORES_x01;
            _.forEach(this.state.playersSelected, (player) => {
                this.state.playerHandicaps[player.id] = 0;
            });
            this.setStateDirty('handicaps');
        } else {
            this.state.scores = this.input.scores;
        }
        if (this.state.scores) {
            this.state.startingScore = this.state.scores[0].id;
        }
    },
    gameModeSelected(event, selected) {
        this.state.gameMode = selected.input.data.id;
    },
    scoreSelected(event, selected) {
        this.state.startingScore = selected.input.data.id;
    },
    outshotSelected(event, selected) {
        this.state.outshotType = selected.input.data.id;
    },
    handicapSelected(event, selected) {
        let handicap = selected.input.data.id
        if (handicap === -1) {
            const input = parseInt(window.prompt("Custom handicap", "300"));
            if (input === null || input === "" || isNaN(input)) {
                handicap = 0;
            } else {
                handicap = input;
                this.state.handicaps.push( { id: handicap, name: handicap } );
                this.setStateDirty("handicaps");
            }
        }
        this.state.playerHandicaps[selected.input.extra] = handicap;
        this.setStateDirty('playerHandicaps');
    }
}
