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