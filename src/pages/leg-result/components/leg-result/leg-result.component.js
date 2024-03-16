const types = require("../../../../components/scorecard/components/match_types");

const moment = require("moment");
const axios = require("axios");
const alertify = require("../../../../util/alertify");
const _ = require('underscore');
const Chart = require("chart.js");

module.exports = {
    onCreate(input) {
        const leg = input.leg;
        leg.started = moment(leg.created_at).format('YYYY-MM-DD HH:mm:ss');
        leg.finished = leg.end_time === null ? '-' : moment(leg.end_time).format('YYYY-MM-DD HH:mm:ss');
        leg.minutes_since_end = moment.utc().diff(moment.utc(input.leg.end_time), 'minutes');
        leg.duration = "-";
        if (leg.visits.length > 0) {
            leg.duration = moment.duration(moment(leg.end_time).diff(leg.visits[0].created_at)).asMinutes().toFixed();
        }
        for (let i = 0; i < leg.visits.length; i++) {
            const visit = leg.visits[i];

            const count = leg.players.length;
            const idx = leg.players.indexOf(visit.player_id);

            const order = [ leg.players[idx] ];
            for (let j = 1; j < leg.players.length; j++) {
                order[j] = leg.players[(idx + j) < count ? idx + j : (j - (count - idx))];
            }
            let scores = visit.scores[order[0]];
            for (let j = 1; j < order.length; j++) {
                var id = order[j];
                scores += ` : ${visit.scores[id] ? visit.scores[id] : 0}`;
            }
            visit.score_str = scores;
        }
        this.state = {
            leg: leg,
            matchId: leg.match_id,
            matchType: input.leg.leg_type.id || input.match.match_type.id,
            legPlayers: input.leg_players,
            players: input.players
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        let legPlayers = this.state.legPlayers;
        let players = this.state.players;
        let leg = this.state.leg;
        let visits = leg.visits;

        let chartMaxValue = this.state.matchType === types.X01 || this.state.matchType === types.X01HANDICAP ? leg.starting_score : 0;
        let labels = [];
        let values = { }
        for (let i = 0; i < legPlayers.length; i++) {
            const player = legPlayers[i];

            let score = leg.starting_score + player.handicap
            if (this.state.matchType === types.DARTS_AT_X || this.state.matchType === types.GOTCHA) {
                score = 0;
            }
            values[player.player_id] = [ score ];
            if (score > chartMaxValue) {
                chartMaxValue = score;
            }
        }
        let round = 0;
        labels.push(round);

        for (let i = 0; i < visits.length; i++) {
            const visit = visits[i];
            if (i % legPlayers.length === 0) {
                round++;
                labels.push(round);
            }
            let current = values[visit.player_id][values[visit.player_id].length - 1];
            if (visit.is_bust) {
                values[visit.player_id].push(current);
            }
            else {
                if (this.state.matchType === types.SHOOTOUT || this.state.matchType === types.DARTS_AT_X || this.state.matchType === types.CRICKET ||
                    this.state.matchType === types.AROUND_THE_CLOCK || this.state.matchType === types.AROUND_THE_WORLD || this.state.matchType === types.SHANGHAI ||
                    this.state.matchType === types.TIC_TAC_TOE || this.state.matchType === types.BERMUDA_TRIANGLE || this.state.matchType === types.JDC_PRACTICE ||
                    this.state.matchType === types.KNOCKOUT) {
                    current = current + visit.score;
                    values[visit.player_id].push(current);
                    if (current > chartMaxValue) {
                        chartMaxValue = current;
                    }
                } else if (this.state.matchType === types.GOTCHA) {
                    current = visit.scores[visit.player_id];
                    values[visit.player_id].push(current);
                } else if (this.state.matchType === types.KILL_BULL) {
                    if (visit.score === 0) {
                        current = leg.starting_score;
                    } else {
                        current = current - visit.score;
                    }
                    values[visit.player_id].push(current);
                } else if (this.state.matchType === types.SCAM) {
                    current = current + (visit.is_stopper ? 0 : visit.score);
                    values[visit.player_id].push(current);
                    if (current > chartMaxValue) {
                        chartMaxValue = current;
                    }
                } else if (this.state.matchType === types.ONESEVENTY) {
                    current = visit.scores[visit.player_id] - visit.score;
                    values[visit.player_id].push(current);
                } else {
                    values[visit.player_id].push(current - visit.score);
                }
            }
        }

        const datasets = []
        for (let i = 0; i < legPlayers.length; i++) {
            const player = players[legPlayers[i].player_id];
            datasets.push({
                label: player.name,
                backgroundColor: player.color,
                borderColor: player.color,
                data: values[player.id],
                fill: false
            });
        }
        new Chart("canvas-scores", {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Scores' },
                    tooltips: { mode: 'index', intersect: false, }
                },
                hover: { mode: 'nearest', intersect: true },
                scales: {
                    x: { display: true, scaleLabel: { display: true, labelString: 'Round' } },
                    y: { display: true, scaleLabel: { display: true, labelString: 'Scores' }, min: 0, 
                        max: chartMaxValue, beginAtZero: true }
                },
                elements: { line: { tension: 0 } }
            }
        });
    },
    onKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                this.continueMatch();
                e.preventDefault();
                break;
            case '.':
            case 'Backspace':
            case 'PageUp': // Intentional fall-through
                this.viewMatchResult();
                e.preventDefault();
                break;
            default: // NOOP
        }
    },
    continueMatch(event) {
        if (this.input.match.is_finished) {
            return;
        }
        location.href = `/matches/${this.state.matchId}`;
    },
    viewMatchResult(event) {
        location.href = `/matches/${this.state.matchId}/result`;
    },
    undoLegFinish(event) {
        alertify.confirm('Leg will no longer be finalized',
            () => {
                axios.put(`${window.location.origin}/legs/${this.state.leg.id}/undo`, null)
                    .then(response => {
                        location.href = `/legs/${this.state.leg.id}`;
                    }).catch(error => {
                        alert(`Unable to undo leg, see log for details (${error.statusText})`);
                    });
            }, () => { /* NOOP */ });
    },
    rematch(event) {
        axios.post(`${window.location.origin}/matches/${this.state.matchId}/rematch`, null)
            .then(response => {
                location.href = `/legs/${response.data.current_leg_id}`;
            }).catch(error => {
                alert(`Unable to rematch, see log for details (${error.statusText})`);
            });
    },
    nextMatch(event) {
        axios.get(`${window.location.origin}/tournaments/match/${this.state.matchId}/next`, null)
            .then(response => {
                if (response.data === 204) {
                    location.href = `/tournaments/${this.input.match.tournament_id}`;
                } else {
                    const leg = response.data.legs[0];
                    location.href = leg.is_finished ? `/legs/${leg.id}/result` : `/legs/${leg.id}`;
                }
            }).catch(error => {
                alert(`Unable to get next match, see log for details (${error.statusText})`);
            });
    }
}