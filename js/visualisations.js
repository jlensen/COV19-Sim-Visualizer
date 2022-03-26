//const {Chart} = require('chart.js'); //already done in hmtl
const canvas = document.getElementById('vis2');
const ctx2 = canvas.getContext('2d');
const ctx = document.getElementById('vis').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['8:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        datasets: [{
            fill: true,
            label: 'Infections over time',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        events: ['click'],
        interaction: {
            mode: 'nearest'
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const chart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: ['8:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        datasets: [{
            fill: true,
            label: 'Infections over time',
            data: [11, 20, 7, 5, 5, 2],
            backgroundColor: [
                'rgba(99, 255, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(99, 255, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        //events: ['click'],
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


//var chart = new Chart(ctxOverlay, options);
var overlay = document.getElementById('overlay');
var startIndex = 0;
overlay.width = canvas.width;
overlay.height = canvas.height;
var selectionContext = overlay.getContext('2d');
var selectionRect = {
  w: 0,
  startX: 0,
  startY: 0
};
var drag = false;
canvas.addEventListener('pointerdown', evt => {
  const points = chart.getElementsAtEventForMode(evt, 'index', {
    intersect: false
  });
  startIndex = points[0]._index;
  const rect = canvas.getBoundingClientRect();
  selectionRect.startX = evt.clientX - rect.left;
  selectionRect.startY = chart.chartArea.top;
  drag = true;
  // save points[0]._index for filtering
});
canvas.addEventListener('pointermove', evt => {

  const rect = canvas.getBoundingClientRect();
  if (drag) {
    const rect = canvas.getBoundingClientRect();
    selectionRect.w = (evt.clientX - rect.left) - selectionRect.startX;
    selectionContext.globalAlpha = 0.5;
    selectionContext.clearRect(0, 0, canvas.width, canvas.height);
    selectionContext.fillRect(selectionRect.startX,
      selectionRect.startY,
      selectionRect.w,
      chart.chartArea.bottom - chart.chartArea.top);
  } else {
    selectionContext.clearRect(0, 0, canvas.width, canvas.height);
    var x = evt.clientX - rect.left;
    if (x > chart.chartArea.left) {
      selectionContext.fillRect(x,
        chart.chartArea.top,
        1,
        chart.chartArea.bottom - chart.chartArea.top);
    }
  }
});
canvas.addEventListener('pointerup', evt => {

  const points = chart.getElementsAtEventForMode(evt, 'index', {
    intersect: false
  });
  drag = false;
  console.log('implement filter between ' + options.data.labels[startIndex] + ' and ' + options.data.labels[points[0]._index]);  
});
