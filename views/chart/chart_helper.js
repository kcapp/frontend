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

function getPercentageChartConfig(value, chartTitle, type) {
    var fillValue = 100 - value;
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

function getPolarChartConfig(value1, value2, chartTitle1, chartTitle2, canvasTitle) {
    var fillValue1 = 100 - value1;
    var fillValue2 = 100 - value2;
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
                    '#4daea8',
                    '#bbc3d4',
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
                    stepSize: 10,
                    max: 70
                }
            },
            responsive: true,
            legend: {
                position: 'left',
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
                label: function(item, data) {
                console.log(data.labels, item);
                    return data.datasets[item.datasetIndex].label+ ": "+ data.labels[item.index]+ ": "+ data.datasets[item.datasetIndex].data[item.index];
                }
            }
        }
    }
  };

  return config;
}