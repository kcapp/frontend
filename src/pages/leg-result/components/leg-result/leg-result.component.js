var moment = require("moment");
var axios = require("axios");
var alertify = require("../../../../util/alertify");
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

        var chartMaxValue = match.match_type.id == 1 || match.match_type.id == 3 ? leg.starting_score : 0;
        var labels = [];
        var values = { }
        for (var i = 0; i < legPlayers.length; i++) {
            var player = legPlayers[i];
            var score = leg.starting_score + player.handicap
            values[player.player_id] = [ score ];
            if (score > chartMaxValue) {
                chartMaxValue = score;
            }
        }
        var round = 0;
        labels.push(round);

        for (var i = 0; i < visits.length; i++) {
            var visit = visits[i];
            if (i % legPlayers.length === 0) {
                round++;
                labels.push(round);
            }
            var current = values[visit.player_id][values[visit.player_id].length - 1];
            if (visit.is_bust) {
                values[visit.player_id].push(current);
            }
            else {
                var visitScore = ((visit.first_dart.value * visit.first_dart.multiplier) +
                    (visit.second_dart.value * visit.second_dart.multiplier) +
                    (visit.third_dart.value * visit.third_dart.multiplier))
                if (match.match_type.id == 2) {
                    current = current + visitScore
                    values[visit.player_id].push(current);
                    if (current > chartMaxValue) {
                        chartMaxValue = current;
                    }
                }
                else {
                    values[visit.player_id].push(current - visitScore);
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
                title: { display: true, text: 'Scores' },
                tooltips: { mode: 'index', intersect: false, },
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
                alert('Unable to undo leg, see log for details (' + error.statusText + ')');
            });
    }
}