const axios = require("axios");
const io = require('../../../util/socket.io-helper');
const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const statistics = input.statistics.general_statistics;
        this.state = {
            socket: undefined,
            statistics: statistics,
            legScores: { "60+": 0, "100+": 0, "140+": 0, "180s": 0, "fish-n-chips": 0 },
            valueLeg: 0,
            valueTournament: 0,
            label: ""
        }
    },

    onMount() {
        const activeSocket = io.connect(`${window.location.origin}/active`);
        activeSocket.on('warmup_started', (data) => {
            if (data.match.tournament_id !== null) {
                this.onNewLeg(data);
            }
        });

        const base = `${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}`;
        axios.get(`${base}/tournament/${this.input.tournament_id}/matches/result`)
            .then(response => {
                const matches = response.data;

                const activeMatch = _.find(matches, (match) => match.is_live);
                if (activeMatch) {
                    axios.get(`${base}/match/${activeMatch.match_id}`)
                        .then(response => {
                            this.onNewLeg({ match: response.data });
                        }).catch(error => {
                            console.log(error);
                        });
                }
            }).catch(error => {
                console.log(error);
            });
    },

    changeCount(key, label, scoresLeg, scoresTournament, timeMs) {
        this.state.valueLeg = scoresLeg[key];
        this.state.label = label;
        $('.count').each(function () {
            $(this).prop('Counter', 0).animate({
                Counter: scoresTournament[key]+scoresLeg[key]
            }, {
                duration: timeMs,
                easing: 'swing',
                step: function (now) {
                    $(this).text(Math.ceil(now));
                }
            });
        });
    },

    onNewLeg(data) {
        // Close any old connection;
        if (this.state.socket) {
            this.state.socket.close();
        }
        const socket = io.connect(`${window.location.origin}/legs/${data.match.current_leg_id}`);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('new_leg', this.onNewLeg.bind(this));
        this.state.socket = socket;
    },

    onScoreUpdate(data) {
        const scoresTournament = {
            "60+": this.state.statistics.scores_60s_plus,
            "100+": this.state.statistics.scores_100s_plus,
            "140+": this.state.statistics.scores_140s_plus,
            "180s": this.state.statistics.scores_180s,
            "fish-n-chips": this.state.statistics.scores_fish_n_chips
        };
        const scoresLeg = { "60+": 0, "100+": 0, "140+": 0, "180s": 0, "fish-n-chips": 0 };
        for (let i = 0; i < data.players.length; i++) {
            const player = data.players[i];

            scoresLeg["60+"] += player.visit_statistics.score_60_plus_counter;
            scoresLeg["100+"] += player.visit_statistics.score_100_plus_counter;
            scoresLeg["140+"] += player.visit_statistics.score_140_plus_counter;
            scoresLeg["180s"] += player.visit_statistics.score_180_counter;
            scoresLeg["fish-n-chips"] += player.visit_statistics.fish_and_chips_counter;
        }
        if (!data.is_undo) {
            // Only show change when it was not an undo
            if (this.state.legScores["60+"] < scoresLeg["60+"]) {
                this.changeCount("60+", "60+", scoresLeg, scoresTournament, 2000);
            } else if (this.state.legScores["100+"] < scoresLeg["100+"]) {
                this.changeCount("100+", "100+", scoresLeg, scoresTournament, 2000);
            } else if (this.state.legScores["140+"] < scoresLeg["140+"]) {
                this.changeCount("140+", "140+", scoresLeg, scoresTournament, 3000);
            } else if (this.state.legScores["180s"] < scoresLeg["180s"]) {
                this.changeCount("180s", "180s", scoresLeg, scoresTournament, 3000);
            } else if (this.state.legScores["fish-n-chips"] < scoresLeg["fish-n-chips"]) {
                this.changeCount("fish-n-chips", "Fish & Chips", scoresLeg, scoresTournament, 2000);
            }
        }
        this.state.legScores = scoresLeg;
    }
};