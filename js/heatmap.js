// code to shuffle array for mockup data
class Heatmaps {
  constructor(Lx, Ly) {

    this.Lx = Lx;
    this.Ly = Ly;
    // this.initMatrix = sim.store.plumes;
    var z0 = new Array(9).fill().map(() => Math.random());
var z1 = new Array(9).fill().map(() => Math.random());
var z2 = new Array(9).fill().map(() => Math.random());
var z3 = new Array(9).fill().map(() => Math.random());
var z4 = new Array(9).fill().map(() => Math.random());
var z5 = new Array(9).fill().map(() => Math.random());
var z6 = new Array(9).fill().map(() => Math.random());
var z7 = new Array(9).fill().map(() => Math.random());
var z8 = new Array(9).fill().map(() => Math.random());
    //console.log(z0);

    this.totPlumes = new Array(this.Lx);
    for (let i = 0; i < this.totPlumes.length; i++) {
        this.totPlumes[i] = new Array(this.Ly).fill(0);
    }
    console.log(this.totPlumes);

    var xValues = ['A', 'B', 'C', 'D', 'E'];
    var yValues = ['W', 'X', 'Y', 'Z'];
    var zValues = this.totPlumes;

    var colorscaleValue = [
      [0, 'rgba(39, 58, 245, 1)'],
      [1, 'rgba(245, 243, 39, 1)']
    ];

    var data = [{
      // x: xValues,
      // y: yValues,
      z: zValues,
      type: 'heatmap',
      colorscale: colorscaleValue,
      showscale: false
    }];

    var layout = {
      title: 'Cumulative Heatmap',
      annotations: [],
      xaxis: {
        ticks: '',
        side: 'top'
      },
      yaxis: {
        ticks: '',
        ticksuffix: ' ',
        width: 700,
        height: 700,
        autosize: false
      }
    };

    for ( var i = 0; i < yValues.length; i++ ) {
      for ( var j = 0; j < xValues.length; j++ ) {
        var currentValue = zValues[i][j];
        if (currentValue != 0.0) {
          var textColor = 'white';
        }else{
          var textColor = 'black';
        }
        var result = {
          xref: 'x1',
          yref: 'y1',
          x: xValues[j],
          y: yValues[i],
          text: zValues[i][j],
          font: {
            family: 'Arial',
            size: 12,
            color: 'rgb(50, 171, 96)'
          },
          showarrow: false,
          font: {
            color: textColor
          }
        };
        layout.annotations.push(result);
      }
    }

    Plotly.newPlot('heatmapDiv', data, layout);
    Plotly.newPlot('heatmapDiv2', data, layout);
  }
  frameUpdate(plumes, scale, curStep) {
    for (let i = 1; i < plumes.length; i++) {
      for (let j = 0; j < plumes[i].length; j++) {
        this.totPlumes[i][j] += plumes[i][j];
      }
    }
    var update = {z: this.totPlumes}
    Plotly.restyle('heatmapDiv', update);
    //console.log(this.totPlumes);
  }
}

export default Heatmaps;