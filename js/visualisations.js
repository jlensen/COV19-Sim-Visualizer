//const {Chart} = require('chart.js');
const ctx = document.getElementById('vis').getContext('2d');
console.log(ctx);
//ctx.fillRect(50, 50, 100, 100);
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
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
//myChart.resize(600, 600);
// const chartImg = await Canvas.loadImage(myChart.toBase64Image());
// ctx.drawImage(chartImg, 0, 0, canvas.width, canvas.height);  