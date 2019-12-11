import axios from "axios";

let button = document.querySelector("#getDataBtn");
button.addEventListener("click", getData);

let startInput = document.querySelector("#start");
let endInput = document.querySelector("#end");
let baseUrl = "https://api.exchangeratesapi.io/history";

function getData() {
  console.log("get data...");
  console.log(startInput.value);
  console.log(endInput.value);
  axios
    .get(`${baseUrl}?start_at=${startInput.value}&end_at=${endInput.value}&symbols=USD,GBP,CHF`)
    .then(r => console.log(r.data));
}
