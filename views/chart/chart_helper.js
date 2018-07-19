function getChartConfig(title, type, xAxisLabel, yAxisLabel, lables, datasets) {
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
}

function getDoughnutPercentageChartConfig(value, chartTitle) {
    var fillValue = 100 - value;
    var config = {
        type: 'doughnut',
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
            labels: []
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
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
}