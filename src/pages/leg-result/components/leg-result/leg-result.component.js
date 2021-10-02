var types = require("../../../../components/scorecard/components/match_types");

var moment = require("moment");
var axios = require("axios");
var alertify = require("../../../../util/alertify");
var _ = require('underscore');
var Chart = require("chart.js");

module.exports = {
    onCreate(input) {
        var leg = input.leg;

        leg.started = moment(leg.created_at).format('YYYY-MM-DD HH:mm:ss');
        leg.finished = leg.end_time === null ? '-' : moment(leg.end_time).format('YYYY-MM-DD HH:mm:ss');
        leg.duration = "-";
        if (leg.visits.length > 0) {
            leg.duration = moment.duration(moment(leg.end_time).diff(leg.visits[0].created_at)).asMinutes().toFixed();
        }
        for (var i = 0; i < leg.visits.length; i++) {
            var visit = leg.visits[i];

            var count = leg.players.length;
            var idx = leg.players.indexOf(visit.player_id);

            var order = [ leg.players[idx] ];
            for (var j = 1; j < leg.players.length; j++) {
                order[j] = leg.players[(idx + j) < count ? idx + j : (j - (count - idx))];
            }
            var scores = visit.scores[order[0]];
            for (var j = 1; j < order.length; j++) {
                var id = order[j];
                if (leg.is_finished) {
                    scores += " : " + visit.scores[id];
                } else {
                    scores += " : " + (visit.scores[id] ? visit.scores[id] : 0);
                }
            }
            visit.score_str = scores;
        }
        this.state = {
            leg: leg,
            matchId: leg.match_id,
            legPlayers: input.leg_players,
            players: input.players
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        var legPlayers = this.state.legPlayers;
        var players = this.state.players;
        var leg = this.state.leg;
        var match = this.input.match;
        var visits = leg.visits;

        var chartMaxValue = match.match_type.id === types.X01 || match.match_type.id === types.X01HANDICAP ? leg.starting_score : 0;
        var labels = [];
        var values = { }
        for (let i = 0; i < legPlayers.length; i++) {
            const player = legPlayers[i];

            let score = leg.starting_score + player.handicap
            if (match.match_type.id === types.DARTS_AT_X || match.match_type.id === types.GOTCHA) {
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
                if (match.match_type.id === types.SHOOTOUT || match.match_type.id === types.DARTS_AT_X || match.match_type.id === types.CRICKET ||
                    match.match_type.id === types.AROUND_THE_CLOCK || match.match_type.id === types.AROUND_THE_WORLD || match.match_type.id === types.SHANGHAI ||
                    match.match_type.id === types.TIC_TAC_TOE || match.match_type.id === types.BERMUDA_TRIANGLE || match.match_type.id === types.JDC_PRACTICE) {
                    current = current + visit.score;
                    values[visit.player_id].push(current);
                    if (current > chartMaxValue) {
                        chartMaxValue = current;
                    }
                } else if (match.match_type.id === types.GOTCHA) {
                    if (visit.score === 0) {
                        current = 0
                    } else {
                        current += visit.score;
                    }
                    values[visit.player_id].push(current);
                } else if (match.match_type.id === types.KILL_BULL) {
                    if (visit.score === 0) {
                        current = leg.starting_score;
                    } else {
                        current = current - visit.score;
                    }
                    values[visit.player_id].push(current);
                } else {
                    values[visit.player_id].push(current - visit.score);
                }
            }
        }

        var datasets = []
        for (var i = 0; i < legPlayers.length; i++) {
            var player = players[legPlayers[i].player_id];
            datasets.push({
                label: player.name,
                backgroundColor: player.color,
                borderColor: player.color,
                data: values[player.id],
                fill: false
            });
        }
        var config = {
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
                    xAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Round' } }],
                    yAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Scores' } }]
                },
                elements: { line: { tension: 0 } }
            }
        }
        config.options.scales.yAxes[0].ticks = { max: chartMaxValue, stepSize: 20, beginAtZero: true };
        new Chart("canvas-scores", config);
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
        location.href = '/matches/' + this.state.matchId;
    },
    viewMatchResult(event) {
        location.href = '/matches/' + this.state.matchId + '/result';
    },
    undoLegFinish(event) {
        alertify.confirm('Leg will no longer be finalized',
            () => {
                axios.put(window.location.origin + '/legs/' + this.state.leg.id + '/undo', null)
                    .then(response => {
                        location.href = '/legs/' + this.state.leg.id;
                    }).catch(error => {
                        alert('Unable to undo leg, see log for details (' + error.statusText + ')');
                    });
            }, () => { /* NOOP */ });
    },
    rematch(event) {
        axios.post(window.location.origin + '/matches/' + this.state.matchId + '/rematch', null)
            .then(response => {
                location.href = '/legs/' + response.data.current_leg_id
            }).catch(error => {
                alert('Unable to rematch, see log for details (' + error.statusText + ')');
            });
    }
}