//  Data
table = [];
dataset = [];
mapMonthsData = [['Country', 'Cases']];
map2020Data = [['Country', 'Cases']];
map2021Data = [['Country', 'Cases']];
var json2020Data;
var json2021Data;
//  Keeping Track
pageTitle = "Tracking Covid-19 Cases";
var chartTitle;
var currentMonth;
var graphTitle = "New Cases of Covid-19 by Day in ";
mapMonths = false;
map2020 = true;
map2021 = false;
madeChoice = false;
choice = 'Ireland'
sliderMonth = document.getElementById('months').value;
var yearColor = ['#F3EAE5','#d65c15'];

barChart = new Chart();

function preload() {
  tableData = loadTable('/data/binned_covid_df.csv', 'csv', 'header');
  json2020Data = loadJSON('/data/2020.json')
  json2021Data = loadJSON('/data/2021.json')
}

function setup() {
  radioMonth = select("#monthsBox").elt;
  radio2020 = select("#yearZeroBox").elt;
  radio2021 = select("#yearOneBox").elt;

  if(mapMonths) radioMonth.checked = true;
  else if(map2020) radio2020.checked = true;
  else if(map2021) radio2021.checked = true;

  // CSV Table
  tableRows = tableData.getRows();
  rowCount = tableData.getRowCount();
  for (var t = 0; t < rowCount; t++) {
    table.push(tableRows[t].arr);
  }
  // Map Data
  mapMonthsData = findMonthlyCountryCases(table, sliderMonth);
  map2020Data = findYearlyCases(table, '2020');
  map2021Data = findYearlyCases(table, '2021');
}

//  Sorting Map Data
function findMonthlyCountryCases(table, month) {
  month_date = (typeof currentMonth === 'undefined') ? '2020-01' : currentMonth;
  countriesMonth = [['Country', 'Cases']];
  for (var row = 0; row < table.length; row++) {
    if (table[row][1] == month_date) {
      countriesMonth.push([table[row][2],int(table[row][4])]);
    }
  }
  return countriesMonth;
}

function findYearlyCases(table, year) {
  cases = [['Country', 'Cases']];
  var map = new Map();
  for (var row = 0; row < table.length; row++) {
    month_date = table[row][1]
    country = table[row][2]
    if (month_date.includes(year)) {
      if (map.has(country)) {
        map.set(country, map.get(country)+int(table[row][4]))
      } else {
        map.set(country, int(table[row][4]))
      }
    }
  }
  for (let [key, value] of map) {
    cases.push([key, value]);
  }
  return cases;
}

function draw() {
  background(255);

  if (!madeChoice) {
    document.getElementById('graph_title').style.visibility="hidden";
    document.getElementById('barChart').style.visibility="hidden";
  }
  else if (madeChoice) {
    document.getElementById('graph_title').style.visibility="visible";
    document.getElementById('barChart').style.visibility="visible";
  }

  if (!mapMonths) {
    document.getElementById('monthsSlider').style.visibility="hidden";
    document.getElementById('months').value = 1;
  } else if(mapMonths) {
    document.getElementById('monthsSlider').style.visibility="visible";
  }

  radioMonth.onchange = function() {
    if(radioMonth.checked) {
      radio2020.checked = false;
      radio2021.checked = false;
      mapMonths = true;
      map2020 = false;
      map2021 = false;
      currentMonth = '2020-1';
      document.getElementById('months').value = 1;
      drawMap();
      redrawGraphTwo(choice);
    }
  }

  radio2020.onchange = function() {
    if (radio2020.checked) {
      radioMonth.checked = false;
      radio2021.checked = false;
      mapMonths = false;
      map2020 = true;
      map2021 = false;
      drawMap();
      redrawGraphTwo(choice);
    }
  }

  radio2021.onchange = function() {
    if(radio2021.checked) {
      radioMonth.checked = false;
      radio2020.checked = false;
      mapMonths = false;
      map2020 = false;
      map2021 = true;
      drawMap();
      redrawGraphTwo(choice);
    }
  }
}

function redrawGraphTwo(country){
  barChart.destroy()
  graphTwo(country)
}

function graphTwo(country){
  dataset = graphTwoData(country)
  title_year = (map2020) ? '2020' : '2021';
  document.getElementById('graph_title').innerHTML = graphTitle + choice + ' in ' + title_year;
  var ctx = document.getElementById("barChart").getContext("2d");
  var data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: dataset
  };

  barChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      barValueSpacing: 20,
      plugins: {
        legend: {display: true},
      },
    }
  });
  barChart.legend.legendItems = getLegend()
}

function updateMonth(month) {
  getMonth(month)
  mapMonthsData = findMonthlyCountryCases(table, month);
}

window.onload = function() {
  drawMap();
}

var monthNum = document.querySelector('input[id="months"]');
monthNum.addEventListener('input', function () {
  updateMonth(int(monthNum.value));
  drawMap();
}, false);

function drawMap() {
  google.charts.load('current', {
    'packages':['geochart'],
    'mapsApiKey': 'AIzaSyCaetnUqnubu0FEMd43VsglhxtWocgtZNc'
  });
  google.charts.setOnLoadCallback(drawMapHelper);
}

function drawMapHelper() {
  var mapData = [];
  if(map2020) {
    mapData = map2020Data;
    chartTitle = 'Corona Virus Cases in 2020 by country';
  }
  else if (map2021) {
    mapData = map2021Data;
    chartTitle = 'Corona Virus Cases in 2021 by country';
  }
  else if(mapMonths) {
    mapData = mapMonthsData;
    chartTitle = 'Corona Virus Cases in 2020 by country in ' + currentMonth;
  }
  var data = google.visualization.arrayToDataTable(mapData);

  var options = {
      colors: yearColor,
      backgroundColor: '#5b86b0',
      legend: {
        position: 'bottom',
        alignment: 'center' ,
        orientation: 'vertical',
      }
  };

  document.getElementById('page_title').innerHTML = pageTitle;
  document.getElementById('map_title').innerHTML = chartTitle;
  var chart = new google.visualization.GeoChart(document.getElementById('world_map'));

  google.visualization.events.addListener(chart, 'select', function () {
    var selection = chart.getSelection()[0];
    choice = data.getValue(selection.row, 0);
    console.log(choice)
    madeChoice = true;
    redrawGraphTwo(choice)
  });

  chart.draw(data, options);
}

function getColourEncoding(bars){
  colours = []
  for(var i=0; i<bars.length; i++){
    if (bars[i] <= 5000) colours.push('#89a0c4');
    else if (bars[i] > 5000 && bars[i] <= 25000) colours.push('#2C599D');
    else if (bars[i] > 25000 && bars[i] <= 50000) colours.push('#194a94');
    else if (bars[i] > 50000 && bars[i] <= 100000) colours.push('#193A6F');
    else colours.push('#11224D');
  }
  return colours
}

function getMonth(month) {
  if (month === 1) currentMonth = '2020-01';
  else if (month === 2) currentMonth = '2020-02';
  else if (month === 3) currentMonth = '2020-03';
  else if (month === 4) currentMonth = '2020-04';
  else if (month === 5) currentMonth = '2020-05';
  else if (month === 6) currentMonth = '2020-06';
  else if (month === 7) currentMonth = '2020-07';
  else if (month === 8) currentMonth = '2020-08';
  else if (month === 9) currentMonth = '2020-09';
  else if (month === 10) currentMonth = '2020-10';
  else if (month === 11) currentMonth = '2020-11';
  else if (month === 12) currentMonth = '2020-12';
  else if (month === 13) currentMonth = '2021-01';
  else if (month === 14) currentMonth = '2021-02';
  else if (month === 15) currentMonth = '2021-03';
  else if (month === 16) currentMonth = '2021-04';
  else if (month === 17) currentMonth = '2021-05';
  else if (month === 18) currentMonth = '2021-06';
  else if (month === 19) currentMonth = '2021-07';
  else if (month === 20) currentMonth = '2021-08';
  else if (month === 21) currentMonth = '2021-09';
  else if (month === 22) currentMonth = '2021-10';
  else if (month === 23) currentMonth = '2021-11';
  else if (month === 24) currentMonth = '2021-12';
}

function graphTwoData(country){
  jsonData = (map2020) ? json2020Data : json2021Data;
  return [{label: "1st",backgroundColor: getColourEncoding(jsonData[country][1]), data: jsonData[country][1]},
    {label: "2nd",backgroundColor: getColourEncoding(jsonData[country][2]), data: jsonData[country][2]},
    {label: "3rd",backgroundColor: getColourEncoding(jsonData[country][3]), data: jsonData[country][3]},
    {label: "4th",backgroundColor: getColourEncoding(jsonData[country][4]), data: jsonData[country][4]},
    {label: "5th",backgroundColor: getColourEncoding(jsonData[country][5]), data: jsonData[country][5]},
    {label: "6th",backgroundColor: getColourEncoding(jsonData[country][6]), data: jsonData[country][6]},
    {label: "7th",backgroundColor: getColourEncoding(jsonData[country][7]), data: jsonData[country][7]},
    {label: "8th",backgroundColor: getColourEncoding(jsonData[country][8]), data: jsonData[country][8]},
    {label: "9th",backgroundColor: getColourEncoding(jsonData[country][9]), data: jsonData[country][9]},
    {label: "10th",backgroundColor: getColourEncoding(jsonData[country][10]), data: jsonData[country][10]},
    {label: "11th",backgroundColor: getColourEncoding(jsonData[country][11]), data: jsonData[country][11]},
    {label: "12th",backgroundColor: getColourEncoding(jsonData[country][12]), data: jsonData[country][12]},
    {label: "13th",backgroundColor: getColourEncoding(jsonData[country][13]), data: jsonData[country][13]},
    {label: "14th",backgroundColor: getColourEncoding(jsonData[country][14]), data: jsonData[country][14]},
    {label: "15th",backgroundColor: getColourEncoding(jsonData[country][15]), data: jsonData[country][15]},
    {label: "16th",backgroundColor: getColourEncoding(jsonData[country][16]), data: jsonData[country][16]},
    {label: "17th",backgroundColor: getColourEncoding(jsonData[country][17]), data: jsonData[country][17]},
    {label: "18th",backgroundColor: getColourEncoding(jsonData[country][18]), data: jsonData[country][18]},
    {label: "19th",backgroundColor: getColourEncoding(jsonData[country][19]), data: jsonData[country][19]},
    {label: "20th",backgroundColor: getColourEncoding(jsonData[country][20]), data: jsonData[country][20]},
    {label: "21st",backgroundColor: getColourEncoding(jsonData[country][21]), data: jsonData[country][21]},
    {label: "22nd",backgroundColor: getColourEncoding(jsonData[country][22]), data: jsonData[country][22]},
    {label: "23rd",backgroundColor: getColourEncoding(jsonData[country][23]), data: jsonData[country][23]},
    {label: "24th",backgroundColor: getColourEncoding(jsonData[country][24]), data: jsonData[country][24]},
    {label: "25th",backgroundColor: getColourEncoding(jsonData[country][25]), data: jsonData[country][25]},
    {label: "26th",backgroundColor: getColourEncoding(jsonData[country][26]), data: jsonData[country][26]},
    {label: "27th",backgroundColor: getColourEncoding(jsonData[country][27]), data: jsonData[country][27]},
    {label: "28th",backgroundColor: getColourEncoding(jsonData[country][28]), data: jsonData[country][28]},
    {label: "29th",backgroundColor: getColourEncoding(jsonData[country][29]), data: jsonData[country][29]},
    {label: "30th",backgroundColor: getColourEncoding(jsonData[country][30]), data: jsonData[country][30]},
    {label: "31st",backgroundColor: getColourEncoding(jsonData[country][31]), data: jsonData[country][31]},
  ]
}

function getLegend() {
  return [{
    borderRadius: 0,
    datasetIndex: 0,
    fillStyle: "#89a0c4",
    fontColor: "#666",
    hidden: false,
    lineCap: undefined,
    lineDash: undefined,
    lineDashOffset: undefined,
    lineJoin: undefined,
    lineWidth: 0,
    pointStyle: undefined,
    rotation: undefined,
    strokeStyle: "rgba(0,0,0,0.1)",
    text: "<= 5000",
    textAlign: undefined,
  },
    {
      borderRadius: 0,
      datasetIndex: 0,
      fillStyle: "#2C599D",
      fontColor: "#666",
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      pointStyle: undefined,
      rotation: undefined,
      strokeStyle: "rgba(0,0,0,0.1)",
      text: "5,001 - 25,000",
      textAlign: undefined,
    },
    {
      borderRadius: 0,
      datasetIndex: 0,
      fillStyle: "#194a94",
      fontColor: "#666",
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      pointStyle: undefined,
      rotation: undefined,
      strokeStyle: "rgba(0,0,0,0.1)",
      text: "25,001 - 50,000",
      textAlign: undefined,
    },
    {
      borderRadius: 0,
      datasetIndex: 0,
      fillStyle: "#193A6F",
      fontColor: "#666",
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      pointStyle: undefined,
      rotation: undefined,
      strokeStyle: "rgba(0,0,0,0.1)",
      text: "50,001 - 100,000",
      textAlign: undefined,
    },
    {
      borderRadius: 0,
      datasetIndex: 0,
      fillStyle: "#11224D",
      fontColor: "#666",
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      pointStyle: undefined,
      rotation: undefined,
      strokeStyle: "rgba(0,0,0,0.1)",
      text: "> 100,000",
      textAlign: undefined,
    },]
}