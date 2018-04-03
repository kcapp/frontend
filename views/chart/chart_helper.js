function getColorForString(str) {
    var hash = md5(str);
    return "#" + hash.substring(hash.length - 6, hash.length);
}

function getChartConfig(title, type, xAxisLabel, yAxisLabel, lables, datasets) {
    var config = {
        type: type,
        data: {
            labels: lables,
            datasets: datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: xAxisLabel
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: yAxisLabel
                    }
                }]
            }
        }
    }
    return config;
}