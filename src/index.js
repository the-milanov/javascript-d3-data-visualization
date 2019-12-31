import axios from "axios";
import * as d3 from "d3";

let chart = document.querySelector("#chart");
let chartLinesGroup = document.querySelector("#chartLines");
let chartBaseGroup = document.querySelector("#chartBase");
let chartLabels = document.querySelectorAll("#chartLabels > *");

let startDateInput = document.querySelector("#start");
let endDateInput = document.querySelector("#end");

let actionButton = document.querySelector("#getDataBtn");
actionButton.addEventListener("click", getData);

let baseUrl = "https://api.exchangeratesapi.io/history";
let margin = 20;

function getData() {
  axios
    .get(
      `${baseUrl}?start_at=${startDateInput.value}&end_at=${endDateInput.value}&symbols=USD,GBP,CHF`
    )
    .then(r => drawChart(r.data.rates));
}
let sortedData;
function drawChart(data) {
  sortedData =  sortData(data);
  let startDate = Object.keys(sortedData)[0];
  let endDate = Object.keys(sortedData)[Object.keys(sortedData).length - 1];

  let currencyArray = [];
  Object.keys(sortedData).forEach(k => currencyArray.push(sortedData[k]));

  let min = currencyArray.reduce((min, curr) => {
    let currSmallest = Math.min(curr["USD"], curr["CHF"], curr["GBP"]);
    if (min < currSmallest) {
      return min;
    } else {
      return currSmallest;
    }
  }, Number.POSITIVE_INFINITY);

  let max = currencyArray.reduce((max, curr) => {
    let currLargest = Math.max(curr["USD"], curr["CHF"], curr["GBP"]);
    if (max > currLargest) {
      return max;
    } else {
      return currLargest;
    }
  }, Number.NEGATIVE_INFINITY);

  // Draw Chart Base
  let chartWidth = chart.clientWidth;
  let chartHeight = chart.clientHeight;

  drawChartBase(chartWidth, chartHeight, min, max);

  writeChartLabels(chartWidth, chartHeight, min, max, startDate, endDate);

  drawChartLines(sortedData, currencyArray, chartWidth, chartHeight, min, max);
}
function drawChartLines(
  sortedData,
  currencyArray,
  chartWidth,
  chartHeight,
  min,
  max
) {
  let usdPolyline = document.querySelector("#USD");
  let chfPolyline = document.querySelector("#CHF");
  let gbpPolyline = document.querySelector("#GBP");
  let margin = 20;
  usdPolyline.setAttribute("points", "");
  chfPolyline.setAttribute("points", "");
  gbpPolyline.setAttribute("points", "");
  for (const currencyIndex in currencyArray) {
    let x =
      margin +
      (currencyIndex / (currencyArray.length - 1)) * (chartWidth - 2 * margin);
    for (const key in currencyArray[currencyIndex]) {
      let y =
        chartHeight -
        margin -
        (chartHeight - margin * 2) *
          ((currencyArray[currencyIndex][key] - min) / (max - min));
      let lineElement = document.querySelector(`#${key}`);
      let lineValue = lineElement.getAttribute("points");
      lineElement.setAttribute("points", lineValue + " " + x + "," + y);
    }
  }

  document.querySelector("#hoverEvents").innerHTML = "";
  d3.select("#hoverEvents")
    .selectAll("rect")
    .data(Object.keys(sortedData))
    .enter()
    .append("rect")
    .attr("data-date", e => e)
    .attr("x", (e, i) => margin + (chartWidth - margin*2)/(currencyArray.length)*i)
    .attr("y", margin)
    .attr("width", (e, i) => chartWidth/currencyArray.length)
    .attr("height", chartHeight-margin*2)
    .attr("fill","transparent")
    .on("mouseover",updateLegend);
}

let legend = document.querySelector("#legend");
let eurValueBase = legend.children[0].innerHTML;
let usdValueBase = legend.children[1].innerHTML;
let chfValueBase = legend.children[2].innerHTML;
let gbpValueBase = legend.children[3].innerHTML;

function updateLegend(date, index){
  legend.children[0].innerHTML = `${eurValueBase} - ${date}` ;
  legend.children[1].innerHTML = `${usdValueBase} - ${sortedData[date]["USD"]}`;
  legend.children[2].innerHTML = `${chfValueBase} - ${sortedData[date]["CHF"]}`;
  legend.children[3].innerHTML = `${gbpValueBase} - ${sortedData[date]["GBP"]}`;
}
function drawChartBase(width, height, min, max) {
  let xAxis = createLine({
    x1: margin,
    y1: height - margin,
    x2: width - margin,
    y2: height - margin,
    stroke: "#222",
    "stroke-width": 2
  });
  let yAxis = createLine({
    x1: margin,
    y1: margin,
    x2: margin,
    y2: height - margin,
    stroke: "#222",
    "stroke-width": 2
  });
  let baseLines = [xAxis, yAxis];

  let xBorder = createLine({
    x1: margin,
    y1: margin,
    x2: width - margin,
    y2: margin,
    stroke: "#222",
    "stroke-width": 2,
    "stroke-dasharray": 5
  });
  let yBorder = createLine({
    x1: width - margin,
    y1: height - margin,
    x2: width - margin,
    y2: margin,
    stroke: "#222",
    "stroke-width": 2,
    "stroke-dasharray": 5
  });
  baseLines.push(xBorder, yBorder);

  for (let i = 1; i <= 3; i++) {
    // Inner dashed, vertical & horizontal lines
    baseLines.push(
      createLine({
        x1: margin,
        y1: margin + ((height - margin * 2) / 4) * i,
        x2: width - margin,
        y2: margin + ((height - margin * 2) / 4) * i,
        stroke: "#aaa",
        "stroke-width": 1.5,
        "stroke-dasharray": 5
      })
    );
    baseLines.push(
      createLine({
        x1: margin + ((width - margin * 2) / 4) * i,
        y1: margin,
        x2: margin + ((width - margin * 2) / 4) * i,
        y2: height - margin,
        stroke: "#aaa",
        "stroke-width": 1.5,
        "stroke-dasharray": 5
      })
    );
  }

  chartBaseGroup.innerHTML = "";
  for (const line of baseLines) {
    chartBaseGroup.appendChild(line);
  }
}

function createLine(lineData) {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  for (const key in lineData) {
    line.setAttribute(key, lineData[key]);
  }
  return line;
}
function sortData(data) {
  let sortedData = {};
  Object.keys(data)
    .sort()
    .forEach(key => (sortedData[key] = data[key]));
  return sortedData;
}
function writeChartLabels(width, height, min, max, start, end) {
  for (let i = 0; i < 5; i++) {
    chartLabels[i].textContent = (min + ((max - min) / 4) * i).toFixed(2);
    chartLabels[i].setAttribute("x", margin + 3);
    chartLabels[i].setAttribute(
      "y",
      height - margin - ((height - margin * 2) / 4) * i - 3
    );
  }
  chartLabels[5].textContent = start;
  chartLabels[5].setAttribute("x", margin);
  chartLabels[5].setAttribute("y", height - 5);

  chartLabels[6].textContent = end;
  chartLabels[6].setAttribute("x", -margin + width);
  chartLabels[6].setAttribute("y", height - 5);
}
