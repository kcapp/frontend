var axios = require('axios');
var Chart = require("chart.js");
var types = require('../../../../components/scorecard/components/match_types');

const DARTBOARD = ['20', '1', '18', '4', '13', '6', '10', '15', '2', '17', '3', '19', '7', '16', '8', '11', '14', '9', '12', '5' ];

module.exports = {
    onCreate(input) {
        this.state = {
            x01: input.statistics.x01,
            shootout: input.statistics.shootout,
            cricket: input.statistics.cricket,
            dartsAtX: input.statistics.darts_at_x,

            progression: input.progression,

            statistics: undefined,
            history: [],
            limit: 15,
            type: types.X01,

            chart_hitrates: undefined
        }
    },
    onMount() {
        if (window.location.hash != "") {
            $('a[href="' + window.location.hash + '"]').click();
        }

        // TODO Do this without datatables
        document.write("<link rel='stylesheet' type='text/css' href='/stylesheets/datatables-1.10.16.min.css'/>");
        document.write('<script type="text/javascript" src="/javascripts/datatables-1.10.16.min.js"><\/script>');

        $(function () {
            $('#table-player-profile-hits').DataTable({
                searching: false, bInfo : false, bLengthChange: false,
                pageLength: 15,
                order: [[ 1,  'desc' ]]
            });
        });

        const stats = this.input.statistics.x01;
        const percentage = parseFloat(Math.round(stats.accuracy_overall * 100) / 100).toFixed(2);
        const accuracyOverallChart = new Chart('canvas-accuracy-overall', this.getPercentageChartConfig(percentage, 'Overall accuracy', 'doughnut', '', false));
        $('#canvas-accuracy-overall-percentage').text(percentage + '%');

        const percentage20 = parseFloat(Math.round(stats.accuracy_20 * 100) / 100).toFixed(2);
        const accuracy20sChart = new Chart('canvas-accuracy-20', this.getPercentageChartConfig(percentage20, 'Accuracy 20s', 'doughnut', '', false));
        $('#canvas-accuracy-20-percentage').text(percentage20 + '%');

        const percentage19 = parseFloat(Math.round(stats.accuracy_19 * 100) / 100).toFixed(2);
        const accuracy19sChart = new Chart('canvas-accuracy-19', this.getPercentageChartConfig(percentage19, 'Accuracy 19s', 'doughnut', '', false));
        $('#canvas-accuracy-19-percentage').text(percentage19 + '%');

        const player = this.input.player;
        const percentageMatches = player.matches_played == 0 ? '0.00' : (player.matches_won * 100 / player.matches_played).toFixed(2);
        const percentageLegs = player.legs_played == 0 ? '0.00' : (player.legs_won * 100 / player.legs_played).toFixed(2);

        const matchesChart = new Chart(
            'canvas-win-percentage-matches',
            this.getPolarChartConfig(
                percentageMatches,
                percentageLegs,
                percentageMatches + '% matches',
                percentageLegs + '% legs',
                'Winning Percentage'
            )
        );

        $('[data-toggle="tooltip"]').tooltip();

        this.state.chart_hitrates = new Chart("canvas-hit-rates", {
            type: 'radar',
            responsive: false,
            data: {
                labels: DARTBOARD,
                datasets: [{
                    label: "Hit Rates",
                    data: [ ],
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgb(54, 162, 235)",
                    pointBackgroundColor: "rgb(54, 162, 235)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgb(54, 162, 235)",
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },{
                    label: "Bullseye",
                    data: [ ],
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgb(255, 99, 132)",
                    pointBackgroundColor: "rgb(255, 99, 132)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "#fff",
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                title: {
                    display: true,
                    fontSize: 16,
                    text: 'Hit Rates'
                },
                elements: {
                    line: { tension: 0, borderWidth: 3 }
                },
                scale: {
                    angleLines: { display: false },
                    ticks: { suggestedMin: 0, suggestedMax: 100 },
                    pointLabels: { fontSize: 18 }
                },
                tooltips: {
                    callbacks: {
                        title: (item, data) => {
                            if (item[0].datasetIndex === 1) {
                                return `Hit Rate Bullseye`;
                            }
                            return `Hit Rate ${data.labels[item[0].index]}`;
                        },
                        label: (item, data) => { return `${parseFloat(item.value).toFixed(2)} %`; }
                    }
                }
            }
        });
        this.typeChanged(types.X01);
    },

    getPercentageChartConfig(value, chartTitle, type, label, displayLegend) {
        var fillValue = (100 - value).toFixed(2);
        return {
            type: type,
            data: {
                datasets: [{
                    data: [
                        value,
                        fillValue,
                    ],
                    backgroundColor: [
                        '#4daea8',
                        '#bbc3d4',
                    ]
                }],
                labels: [label, label]
            },
            options: {
                cutoutPercentage: 80,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        display: displayLegend
                    },
                    title: {
                        display: true,
                        text: chartTitle
                    },
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };
    },

    getPolarChartConfig(value1, value2, chartTitle1, chartTitle2, canvasTitle) {
        var lowerMargin = Math.min(value1, value2) * 0.8;
        var higherMargin = Math.ceil(Math.max(value1, value2) / 10) * 10;
        return {
            type: 'polarArea',
            data: {
                datasets: [
                    {
                        data: [
                            value1,
                            value2
                        ],
                        backgroundColor: [
                            'rgba(77, 174, 168, 0.5)',
                            'rgba(77, 174, 168, 0.8)',
                        ],
                        labels: [
                            'a',
                            'b'
                        ]
                    }
                ],
                labels: [
                    chartTitle1,
                    chartTitle2,
                ]
            },
            options: {
                scale: {
                    ticks: {
                        stepSize: 5,
                        max: higherMargin,
                        min: lowerMargin
                    }
                },
                responsive: false,
                plugins: {
                    legend: {
                        position: 'left'
                    },
                    title: {
                        display: true,
                        text: canvasTitle
                    },
                    tooltips: {
                        callbacks: {
                            label: function (item, data) {
                                return data.labels[item.index];
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };
    },

    typeChanged(typeId) {
        axios.all([
            axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/player/${this.input.player.id}/statistics/${typeId}`),
            axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/player/${this.input.player.id}/statistics/${typeId}/history/${this.state.limit}`)
        ]).then(axios.spread((statistics, history) => {
            this.state.statistics = statistics.data;
            this.setStateDirty('statistics');
            this.state.history = history.data;
            this.setStateDirty('history');

            if (this.state.statistics.hitrates) {
                var data = [];

                var chart = this.state.chart_hitrates;
                if (typeId == types.BERMUDA_TRIANGLE) {
                    var labels = [];
                    for (var i = 1; i <= 13; i++) {
                        data.push((this.state.statistics.hitrates[i] * 100).toFixed(2));
                        labels.push(types.TARGET_BERMUDA_TRIANGLE[i].label);
                    }
                    chart.data.labels = labels;
                    chart.data.datasets[0].data = data;
                } else {
                    for (var i = 0; i < 20; i++) {
                        data.push((this.state.statistics.hitrates[DARTBOARD[i]] * 100).toFixed(2));
                    }
                    chart.data.labels = DARTBOARD;
                    chart.data.datasets[0].data = data;
                    chart.data.datasets[1].data = [(this.state.statistics.hitrates[25] * 100).toFixed(2)]
                }
                chart.update();
            }
            this.state.type = typeId;
        })).catch(error => {
            console.log('Error when getting data for player ' + error);
        });
    }
};