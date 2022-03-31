// code to shuffle array for mockup data

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

var xValues = ['A', 'B', 'C', 'D', 'E'];

var yValues = ['W', 'X', 'Y', 'Z'];

var zValues = [z0,z1,z2,z3,z4,z5,z6,z7,z8];

var colorscaleValue = [
  [0, 'rgba(39, 58, 245, 1)'],
  [1, 'rgba(245, 243, 39, 1)']
];

var data = [{
 // x: xValues,
  //y: yValues,
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