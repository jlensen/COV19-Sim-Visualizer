//const {Chart} = require('chart.js'); //already done in hmtl
var linedata = Array.from({length: 40}, () => Math.floor(Math.random() * 20)); //.sort();
var linedata2 = Array.from({length: 40}, () => Math.floor(Math.random() * 20));

var lineLabels = [];

for (var i = 0; i < linedata.length; i++) {
  lineLabels.push(i + 8);
}

const canvas = document.getElementById('vis2');
const ctx2 = canvas.getContext('2d');
const ctx = document.getElementById('vis').getContext('2d');
const lineChart1 = new Chart(ctx, {
    type: 'line',
    data: {
        labels: lineLabels,
        datasets: [{
            fill: true,
            label: 'Infections over time',
            data: linedata,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        onClick: (e) => {
          const canvasPosition = Chart.helpers.getRelativePosition(e, lineChart1);
          const dataX = lineChart1.scales.x.getValueForPixel(canvasPosition.x);
          //zoom both graphs
          zoomIn(lineChart1, dataX, dataX + 10);
          zoomIn(lineChart2, dataX, dataX + 10);
        },
        // interaction: {
        //     mode: 'nearest'
        // },
        scales: {

            y: {
                beginAtZero: true
            }
        }
    }
});

const lineChart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: lineLabels,
        datasets: [{
            fill: true,
            label: 'Infections over time',
            data: linedata2,
            backgroundColor: [
                'rgba(99, 255, 132, 0.2)',
            ],
            borderColor: [
                'rgba(99, 255, 132, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        onClick: (e) => {
          const canvasPosition = Chart.helpers.getRelativePosition(e, lineChart1);
          const dataX = lineChart1.scales.x.getValueForPixel(canvasPosition.x);
          //zoom both graphs
          zoomIn(lineChart1, dataX, dataX + 10);
          zoomIn(lineChart2, dataX, dataX + 10);
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function reset() {
      lineChart1.options.scales.x.min = 0;
      lineChart1.options.scales.x.max = 47;
      lineChart1.update();
      lineChart2.options.scales.x.min = 0;
      lineChart2.options.scales.x.max = 47;
      lineChart2.update();
}

// zooms the graph from point of clicking to 10 ticks further (x axis)
function zoomIn(chart, mousePos1, mousePos2)
 {

   chart.options.scales.x.min = mousePos1;
   chart.options.scales.x.max = mousePos2;
   chart.update();
 }

