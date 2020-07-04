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

        var progression = this.input.progression;
        var labels = [];
        var valuesMap = {
            three_dart_avg: [], first_9_three_dart: [],
            checkout_percentage: [],
            scores60s: [], scores100s: [], scores140s: [], scores180s: [] };
        for (var date in progression) {
            if (progression.hasOwnProperty(date)) {
                var p = progression[date];
                labels.push(date);
                valuesMap.three_dart_avg.push(p.three_dart_avg.toFixed(2));
                valuesMap.checkout_percentage.push(p.checkout_percentage == null ? 0 : p.checkout_percentage.toFixed(2));
                valuesMap.first_9_three_dart.push(p.first_nine_three_dart_avg.toFixed(2));
                valuesMap.scores60s.push(p.scores_60s_plus);
                valuesMap.scores100s.push(p.scores_100s_plus);
                valuesMap.scores140s.push(p.scores_140s_plus);
                valuesMap.scores180s.push(p.scores_180s);
            }
        }

        var datasetsAvg = [{
            label: "First 9",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: valuesMap.first_9_three_dart,
            fill: false
        },
        {
            label: "Three Dart Avg.",
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            data: valuesMap.three_dart_avg,
            fill: false
        }]
        var avgChart = new Chart("canvas-three-dart-avg", this.getChartConfig('Three Dart Avg. Per Week', 'line', 'Date', 'Three Dart Avg.', labels, datasetsAvg));

        var stats = this.input.statistics.x01;
        var percentage = parseFloat(Math.round(stats.accuracy_overall * 100) / 100).toFixed(2);
        var matchesChart = new Chart('canvas-accuracy-overall', this.getPercentageChartConfig(percentage, 'Overall accuracy', 'doughnut', '', false));
        $('#canvas-accuracy-overall-percentage').text(percentage + '%');

        var percentage20 = parseFloat(Math.round(stats.accuracy_20 * 100) / 100).toFixed(2);
        var matchesChart = new Chart('canvas-accuracy-20', this.getPercentageChartConfig(percentage20, 'Accuracy 20s', 'doughnut', '', false));
        $('#canvas-accuracy-20-percentage').text(percentage20 + '%');

        var percentage19 = parseFloat(Math.round(stats.accuracy_19 * 100) / 100).toFixed(2);
        var matchesChart = new Chart('canvas-accuracy-19', this.getPercentageChartConfig(percentage19, 'Accuracy 19s', 'doughnut', '', false));
        $('#canvas-accuracy-19-percentage').text(percentage19 + '%');

        var player = this.input.player;
        var percentageMatches = player.matches_played == 0 ? '0.00' : (player.matches_won * 100 / player.matches_played).toFixed(2);
        var percentageLegs = player.legs_played == 0 ? '0.00' : (player.legs_won * 100 / player.legs_played).toFixed(2);

        var matchesChart = new Chart(
            'canvas-win-percentage-matches',
            this.getPolarChartConfig(
                percentageMatches,
                percentageLegs,
                percentageMatches + '% matches',
                percentageLegs + '% legs',
                'Winning Percentage'
            )
        );

        var datasetCheckout = [{
            label: "%",
            backgroundColor: 'rgb(18, 153, 43)',
            borderColor: 'rgb(18, 153, 43)',
            data: valuesMap.checkout_percentage,
            fill: false
        }]
        var checkoutPercentageChart = new Chart("canvas-checkout", this.getChartConfig('Checkout % Per Week', 'line', 'Date', 'Percentage', labels, datasetCheckout));

        var datasetsScores = [{
            label: "60+",
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            data: valuesMap.scores60s,
            fill: false
        },
        {
            label: "100+",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: valuesMap.scores100s,
            fill: false
        },
        {
            label: "140+",
            backgroundColor: 'rgb(255, 159, 64)',
            borderColor: 'rgb(255, 159, 64)',
            data: valuesMap.scores140s,
            fill: false
        },
        {
            label: "180",
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: 'rgb(153, 102, 255)',
            data: valuesMap.scores180s,
            fill: false
        }]
        var scoresChart = new Chart("canvas-scores", this.getChartConfig('Scores Per Week|', 'line', 'Date', 'Count', labels, datasetsScores));

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
                    text: 'Hit Rate Per Number'
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

    getChartConfig(title, type, xAxisLabel, yAxisLabel, lables, datasets) {
        var config = {
            type: type,
            data: {
                labels: lables,
                datasets: datasets
            },
            options: {
                responsive: true,
                title: { display: true, text: title },
                tooltips: { mode: 'index', intersect: false, },
                hover: { mode: 'nearest', intersect: true },
                scales: {
                    xAxes: [{ display: true, scaleLabel: { display: true, labelString: xAxisLabel } }],
                    yAxes: [{ display: true, scaleLabel: { display: true, labelString: yAxisLabel } }]
                },
                elements: { line: { tension: 0 } }
            }
        }
        return config;
    },

    getPercentageChartConfig(value, chartTitle, type, label, displayLegend) {
        var fillValue = (100 - value).toFixed(2);
        var config = {
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
                legend: {
                    position: 'top',
                    display: displayLegend
                },
                title: {
                    display: true,
                    text: chartTitle
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        return config;
    },

    getPolarChartConfig(value1, value2, chartTitle1, chartTitle2, canvasTitle) {
        var fillValue1 = 100 - value1;
        var fillValue2 = 100 - value2;
        var lowerMargin = Math.min(value1, value2) * 0.8;
        var higherMargin = Math.ceil(Math.max(value1, value2) / 10) * 10;
        var config = {
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
                responsive: true,
                legend: {
                    position: 'left'
                },
                title: {
                    display: true,
                    text: canvasTitle
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                tooltips: {
                    callbacks: {
                        label: function (item, data) {
                            return data.labels[item.index];
                        }
                    }
                }
            }
        };

        return config;
    },

    typeChanged(typeId) {
        axios.all([
            axios.get(this.input.locals.kcapp.api_external + '/player/' + this.input.player.id + '/statistics/' + typeId),
            axios.get(this.input.locals.kcapp.api_external + '/player/' + this.input.player.id + '/statistics/' + typeId + '/history/' + this.state.limit)
        ]).then(axios.spread((statistics, history) => {
            this.state.statistics = statistics.data;
            this.setStateDirty('statistics');
            this.state.history = history.data;
            this.setStateDirty('history');

            if (this.state.statistics.hitrates) {
                var data = [];
                for (var i = 0; i < 20; i++) {
                    data.push((this.state.statistics.hitrates[DARTBOARD[i]] * 100).toFixed(2));
                }

                var chart = this.state.chart_hitrates;
                chart.data.datasets[0].data = data;
                chart.data.datasets[1].data = [(this.state.statistics.hitrates[25] * 100).toFixed(2)]
                chart.update();
            }
            this.state.type = typeId;
        })).catch(error => {
            console.log('Error when getting data for player ' + error);
        });
    }
};