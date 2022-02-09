var dataset=""
var locationlist=[]

window.addEventListener("load", function(event) {
  
});

function seeLocationWeather(){
  let myloc=document.getElementById("locationinput").value
  
  fetch('http://api.openweathermap.org/data/2.5/forecast?q='+myloc+'&id=524901&appid=c9b8a60fdf84c3826cd6635b6126f89c')
    .then(response => response.json())
    .then(data => 
      displaylocation(data)
      );
}

function displaylocation(data){
  
  var table = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoA").appendChild(table);
  insertCells(table, data);
}

function insertCells(table, data){
  row = table.insertRow();
  console.log(data)
  var iconcode = data.list[0].weather[0].icon;
  var iconurl =  'http://openweathermap.org/img/wn/'+iconcode+'.png';
  var img = document.createElement('img');
  img.src = iconurl;
  
  row.insertCell().appendChild(img);
  row.insertCell().innerHTML=data.list[0].weather[0].description;
  row.insertCell().innerHTML=data.list[0].main.temp;
  row.insertCell().innerHTML=data.list[0].main.temp_min;
  row.insertCell().innerHTML=data.list[0].main.temp_max;
  row.insertCell().innerHTML=data.list[0].main.humidity;
  row.insertCell().innerHTML=data.list[0].wind.speed;
  
}
