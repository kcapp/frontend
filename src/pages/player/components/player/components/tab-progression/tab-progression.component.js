const axios = require('axios');
const Chart = require("chart.js");

module.exports = {
    onCreate(input) {
        this.state = {
            progression: input.progression,

            bucketSize: 50,
            startingScore: undefined,
            officialOnly: false,
            oneVsOne: false,

            labels: [],
            valuesMap: {
                three_dart_avg: [],
                first_9_three_dart: [],
                checkout_percentage: [],
                scores60s: [],
                scores100s: [],
                scores140s: [],
                scores180s: []
            },
            // Charts
            avgChart: null,
            checkoutPercentageChart: null,
            scoresChart: null
        }
    },
    onMount() {
        const progression = this.state.progression;
        this.updateData(progression);

        const trendlineData = this.getLinearTrendline(this.state.labels, this.state.valuesMap.three_dart_avg);
        const datasetsAvg = [{
            label: "First 9",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: this.state.valuesMap.first_9_three_dart,
            fill: false
        },
        {
            label: "Three Dart Avg.",
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            data: this.state.valuesMap.three_dart_avg,
            fill: false
        },
        {
            label: "Trendline",
            data: trendlineData,
            borderColor: 'rgba(0,0,0,0.5)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
        }];
        this.state.avgChart = new Chart("canvas-three-dart-avg", this.getChartConfig('Three Dart Avg.', 'line', 'Date', 'Three Dart Avg.', this.state.labels, datasetsAvg));

        const datasetCheckout = [{
            label: "%",
            backgroundColor: 'rgb(18, 153, 43)',
            borderColor: 'rgb(18, 153, 43)',
            data: this.state.valuesMap.checkout_percentage,
            fill: false
        }]
        this.state.checkoutPercentageChart = new Chart("canvas-checkout", this.getChartConfig('Checkout %', 'line', 'Date', 'Percentage', this.state.labels, datasetCheckout));

        const datasetsScores = [{
            label: "60+",
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            data: this.state.valuesMap.scores60s,
            fill: false
        },
        {
            label: "100+",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: this.state.valuesMap.scores100s,
            fill: false
        },
        {
            label: "140+",
            backgroundColor: 'rgb(255, 159, 64)',
            borderColor: 'rgb(255, 159, 64)',
            data: this.state.valuesMap.scores140s,
            fill: false
        },
        {
            label: "180",
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: 'rgb(153, 102, 255)',
            data: this.state.valuesMap.scores180s,
            fill: false
        }]
        this.state.scoresChart = new Chart("canvas-scores", this.getChartConfig('Scores Per', 'line', 'Date', 'Count', this.state.labels, datasetsScores));
    },

    onBucketSizeChange(event) {
        this.state.bucketSize = parseInt(event.target.value);
        this.updateProgression(this.state.bucketSize, this.state.startingScore, this.state.officialOnly, this.state.oneVsOne);
    },

    onStartingScoreChange(event) {
        if (event.target.value === '') {
            this.state.startingScore = undefined;
        } else {
            this.state.startingScore = parseInt(event.target.value);
        }        
        this.updateProgression(this.state.bucketSize, this.state.startingScore, this.state.officialOnly, this.state.oneVsOne);
    },

    onOfficialOnlyChange(event) {
        this.state.officialOnly = event.target.checked;
        this.updateProgression(this.state.bucketSize, this.state.startingScore, this.state.officialOnly, this.state.oneVsOne);
    },
    on1v1OnlyChange(event) {
        this.state.oneVsOne = event.target.checked;
        this.updateProgression(this.state.bucketSize, this.state.startingScore, this.state.officialOnly, this.state.oneVsOne);
    },

    updateData(progression) {
        this.state.labels = [];
        this.state.valuesMap = {
            three_dart_avg: [],
            checkout_percentage: [],
            first_9_three_dart: [],
            scores60s: [],
            scores100s: [],
            scores140s: [],
            scores180s: [],
        };
                
        for (let i = 0; i < progression.length; i++) {
            const p = progression[i];
            this.state.labels.push(p.start_date.split('T')[0]);
            this.state.valuesMap.three_dart_avg.push(p.statistics.three_dart_avg.toFixed(2));
            this.state.valuesMap.checkout_percentage.push(p.statistics.checkout_percentage == null ? 0 : p.statistics.checkout_percentage.toFixed(2));
            this.state.valuesMap.first_9_three_dart.push(p.statistics.first_nine_three_dart_avg.toFixed(2));
            this.state.valuesMap.scores60s.push(p.statistics.scores_60s_plus);
            this.state.valuesMap.scores100s.push(p.statistics.scores_100s_plus);
            this.state.valuesMap.scores140s.push(p.statistics.scores_140s_plus);
            this.state.valuesMap.scores180s.push(p.statistics.scores_180s);
        }

        if (this.state.avgChart) {
            this.state.avgChart.data.labels = this.state.labels;
            this.state.avgChart.data.datasets[0].data = this.state.valuesMap.first_9_three_dart;
            this.state.avgChart.data.datasets[1].data = this.state.valuesMap.three_dart_avg;
            this.state.avgChart.data.datasets[2].data = this.getLinearTrendline(this.state.labels, this.state.valuesMap.three_dart_avg);
            this.state.avgChart.update();
        }
        if (this.state.checkoutPercentageChart) {
            this.state.checkoutPercentageChart.data.labels = this.state.labels;
            this.state.checkoutPercentageChart.data.datasets[0].data = this.state.valuesMap.checkout_percentage;
            this.state.checkoutPercentageChart.update();
        }
        if (this.state.scoresChart) {
            this.state.scoresChart.data.labels = this.state.labels;
            this.state.scoresChart.data.datasets[0].data = this.state.valuesMap.scores60s;
            this.state.scoresChart.data.datasets[1].data = this.state.valuesMap.scores100s;
            this.state.scoresChart.data.datasets[2].data = this.state.valuesMap.scores140s;
            this.state.scoresChart.data.datasets[3].data = this.state.valuesMap.scores180;
            this.state.scoresChart.update();
            this.state.scoresChart.update();
        }
    },
    
    getChartConfig(title, type, xAxisLabel, yAxisLabel, lables, datasets) {
        return {
            type: type,
            data: {
                labels: lables,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: title },
                    tooltips: { mode: 'index', intersect: false, }
                },
                hover: { mode: 'nearest', intersect: true },
                scale: {

                },
                scales: {
                    x: { display: true, scaleLabel: { display: true, labelString: xAxisLabel } },
                    y: { display: true, scaleLabel: { display: true, labelString: yAxisLabel } }
                },
                elements: { line: { tension: 0 } }
            }
        }
    },

    getLinearTrendline(xLabels, yData) {
        const n = yData.length;
        const x = [...Array(n).keys()];
        const y = yData.map(Number);
    
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
    
        return x.map(xi => (slope * xi + intercept).toFixed(2));
    },

    updateProgression(bucketSize, startingScore, officialOnly, oneVsOne) {
        const base = `${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}`;
        axios.get(`${base}/player/${this.input.player.id}/progression?bucket_size=${bucketSize}${startingScore ? ("&starting_score="+startingScore) : ""}&official_only=${officialOnly}&1v1_only=${oneVsOne}`)
            .then((response) => {
                const progression = response.data;
                this.updateData(progression);
                this.state.progression = progression;
                this.setStateDirty('progression');
            }).catch(error => {
                console.log('Error when getting player progression ' + error);
            });
    }
};