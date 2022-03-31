class Visualisations {
    constructor(ctx, ctx2, sim) { //gets two canvas contexts and the simulation that is running

    
        this.linedata = [];//Array.from({length: 40}, () => Math.floor(Math.random() * 20)); //.sort();
        this.linedata2 = [];//Array.from({length: 40}, () => Math.floor(Math.random() * 20));
        this.lineLabels = [];
        // bad implementations
        for (var i = 0; i < this.linedata.length; i++) {
        this.lineLabels.push(i + 16/2);
        }
        // const ctx2 = document.getElementById('vis2').getContext('2d');
        // const ctx = document.getElementById('vis').getContext('2d');
        this.lineChart1 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.lineLabels,
                datasets: [{
                    fill: true,
                    label: 'Infections over time',
                    data: this.linedata,
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
                const canvasPosition = Chart.helpers.getRelativePosition(e, this.lineChart1);
                const dataX = this.lineChart1.scales.x.getValueForPixel(canvasPosition.x);
                //zoom both graphs
                zoomIn(this.lineChart1, dataX, dataX + 10);
                zoomIn(this.lineChart2, dataX, dataX + 10);
                },
                scales: {

                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.lineChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: this.lineLabels,
                datasets: [{
                    fill: true,
                    label: 'Infections over time',
                    data: this.linedata2,
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
                const canvasPosition = Chart.helpers.getRelativePosition(e, this.lineChart1);
                const dataX = this.lineChart1.scales.x.getValueForPixel(canvasPosition.x);
                //zoom both graphs
                zoomIn(this.lineChart1, dataX, dataX + 10);
                zoomIn(this.lineChart2, dataX, dataX + 10);
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

                // zooms the graph from point of clicking to 10 ticks further (x axis)
        function zoomIn(chart, mousePos1, mousePos2)
            {
    
            chart.options.scales.x.min = mousePos1;
            chart.options.scales.x.max = mousePos2;
            chart.update();
        }
    }
    
    resetZoom() {
        this.lineChart1.options.scales.x.min = 0;
        this.lineChart1.options.scales.x.max = this.lineChart1.data.labels.slice(-1);
        this.lineChart1.update();
        this.lineChart2.options.scales.x.min = 0;
        this.lineChart2.options.scales.x.max = this.lineChart2.data.labels.slice(-1);
        this.lineChart2.update();
        console.log(this.lineChart1.data.labels.slice(-1) + '  graph 2: '+this.lineChart2.data.labels.slice(-1));
    }

    frameUpdate(infCount, curStep) {
        this.lineChart1.data.datasets.forEach((dataset) => {
            dataset.data.push(infCount);
        });
        // this.lineChart2.data.datasets.forEach((dataset) => {
        //     dataset.data.push(infCount);
        // });

        this.lineChart1.data.labels.push(curStep);
        this.lineChart1.update();
        //this.lineChart2.update();
    }
    // transfer data from sim1 to visualisations in column2
    moveData() {
        this.linedata2 = this.lineChart1.data.datasets[0].data;
        this.lineLabels =  this.lineChart1.data.labels;
        this.lineChart2.data.datasets[0].data = this.linedata2;
        this.lineChart2.data.labels = this.lineLabels;
        this.lineChart2.update();

        this.lineLabels = []; //clear labels for next sim
        this.lineChart1.data.datasets[0].data = [];
        this.lineChart1.data.labels = [];
    }
}

export default Visualisations;
