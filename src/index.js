import axios from "axios";

let button = document.querySelector("#getDataBtn");
button.addEventListener("click", getData);
let chart = document.querySelector("#chart");

let startInput = document.querySelector("#start");
let endInput = document.querySelector("#end");
let baseUrl = "https://api.exchangeratesapi.io/history";

function getData() {
  axios
    .get(
      `${baseUrl}?start_at=${startInput.value}&end_at=${endInput.value}&symbols=USD,GBP,CHF`
    )
    .then(r => drawChart(r.data.rates));
}
function drawChart(data) {
  // Sort API data
  let sortedData = {};
  Object.keys(data)
    .sort()
    .forEach(key => (sortedData[key] = data[key]));
  // Draw Chart
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
  // Draw Currency Lines
  let chartLines = document.querySelector("#chartLines");
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
      let y =( chartHeight - margin) - (chartHeight - margin * 2) * ((currencyArray[currencyIndex][key]-min)/(max-min));
      let lineElement = document.querySelector(`#${key}`);
      let lineValue = lineElement.getAttribute("points");
      lineElement.setAttribute("points", lineValue + " " + x + "," + y);
    }
  }
}
function drawChartBase(width, height, min, max) {
  let chartBase = document.querySelector("#chartBase");
  let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let margin = 20;
  line1.setAttribute("x1", margin);
  line1.setAttribute("y1", margin);
  line1.setAttribute("x2", margin);
  line1.setAttribute("y2", height - margin);
  line1.setAttribute("stroke", "#333");
  line1.setAttribute("stroke-width", 2);

  let line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line2.setAttribute("x1", margin);
  line2.setAttribute("y1", height - margin);
  line2.setAttribute("x2", width - margin);
  line2.setAttribute("y2", height - margin);
  line2.setAttribute("stroke", "#333");
  line2.setAttribute("stroke-width", 2);

  let textMax = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textMax.setAttribute("x", margin);
  textMax.setAttribute("y", margin * 0.75);
  textMax.setAttribute("style", "font-size: 10px;");
  textMax.textContent = max;

  let textMin = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textMin.setAttribute("x", margin);
  textMin.setAttribute("y", height - margin * 0.25);
  textMin.setAttribute("style", "font-size: 10px;");
  textMin.textContent = min;

  chartBase.innerHTML = "";
  chartBase.appendChild(line1);
  chartBase.appendChild(line2);
  chartBase.appendChild(textMax);
  chartBase.appendChild(textMin);
}
