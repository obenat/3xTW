function getStopFinderURL(location)
{
  return `https://efa.sta.bz.it/apb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=${location}`;
}

function getEFAStationURL(location, station)//EfaApi -> Buses from one station
{
  return `https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=${location}%20${location}%20${station}&mode=direct&outputFormat=json`;
}

function stopFinder(location)
{
  let locations = [];
  console.log(locations);
  if(location.stopFinder.points != null)
    location.stopFinder.points.forEach(x => locations.push(x.name));
  return locations;
}

async function getDataFromURL(url)//make request
{
  let result = await fetch(url);
  let answer = null;
  if(result.ok)
    answer = await result.json();
  return answer;
}

function convertLocation(location)
{
  let las = location.split(", ");//location and station
  if(las.length == 2)
    return las;

  return null;
}

async function enter(sourceValue, destinationValue)
{
  let test1 = stopFinder(getDataFromURL(await getStopFinderURL(sourceValue)));
  let test2 = stopFinder(getDataFromURL(await getStopFinderURL(destinationValue)));
  console.log(test1 + " " + test2);
  //sourceValue = convertLocation(sourceValue);
  //destinationValue = convertLocation(destinationValue);
/*
  if(sourceValue != null && destinationValue != null)
  {
    
  }
  else if(sourceValue != null || destinationValue != null)
  {
    getEFAStationURL(sourceValue)
    (sourceValue != null ? sourcevalue : destinationValue)
  }*/
}



















const WEATHER_API_KEY = "e5d1be98e9c5ef580a9e3ed6b627664b";
const delay = 5000;
let lastTime = Date.now();

//Get Data
//-----------------------------------------------------------------------------------------------------------------------------------------------------
function getBNURL(value = 1)//BuergernetzApi -> 1 = Valley, 3 = Mountain
{
  return `http://daten.buergernetz.bz.it/services/weather/station?categoryId=${value}&lang=de&format=json`;
}

function getOWURL(lat, lon)//OpenWeatherApi
{
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
}

function getEFAStationURL(location, station)//EfaApi -> Buses from one station
{
  return `https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=${location}%20${location}%20${station}&mode=direct&outputFormat=json`;
}

function getEFARouteURL(startLocation, startStation, endLocation, endStation)//EfaApi -> Route from station to other station
{
  return `https://efa.sta.bz.it/apb/XML_TRIP_REQUEST2?locationServerActive=1&stateless=%201&type_origin=any&name_origin=${startLocation},%20D${startStation}&type_destination=any&name_destination=${endLocation},%20${endStation}&itdTripDateTimeDepArr=dep&itdTime=0800&itdDate=20220209&calcNumberOfTrips=5&maxChanges=9&routeType=LEASTTIME&useProxFootSearch=1&coordOutputFormatTail=4&outputFormat=JSON&coordOutputFormat=WGS84[DD.DDDDD]`;
}

function getStopFinderURL(location)
{
  return `https://efa.sta.bz.it/apb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=${location}`;
}

async function getDataFromURL(url)//make request
{
  let result = await fetch(url);
  let answer = null;
  if(result.ok)
    answer = await result.json();
  return answer;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------
//Get Weather
//-----------------------------------------------------------------------------------------------------------------------------------------------------
function weatherLocation(location, temperature, windDirection, windSpeed, windSpeed, humidity, iconCode)//create location object
{
  this.location = location;
  this.temperature = temperature;
  this.windDirection = windDirection;
  this.windSpeed = windSpeed;
  this.humidity = humidity;
  this.iconCode = iconCode;
}

function getWeatherData(BNData, OWData)//get data for location object
{
  return new weatherLocation(BNData.name, 
                             BNData.t + "°C", 
                             BNData.dd, 
                             BNData.ff + "km/h",
                             BNData.rh + "%",
                             OWData.weather[0].description,
                             OWData.weather[0].icon);
}

function getLocation(data, location)//search location in data
{
  return data.rows.find(x => {return x.name.toLowerCase() === location});
}

async function getWeather(location)//concat data from OWApi and BNApi
{
  let BNData = getLocation(await getDataFromURL(getBNURL()), location.toLowerCase());
  return BNData!=null?getWeatherData(BNData, await getDataFromURL(getOWURL(BNData.latitude, BNData.longitude))):BNData;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------
//Get buses from one station
//-----------------------------------------------------------------------------------------------------------------------------------------------------
function mot(transportationNumber, transportationType, endLocation, startTime) //modeOfTransportation object
{
  this.transportationNumber = transportationNumber;
  this.transportationType = transportationType;
  this.endLocation = endLocation;
  this.startTime = startTime;
}

function getmotFromStation(data)//make object for each mot
{
  let modeOfTransport = [];
  console.log(data);
  if(data.servingLine != null)
    data.departureList.slice(0, 10).forEach(x => 
    {
      modeOfTransport.push(new mot(x.servingLine.number, 
                                  x.servingLine.name, 
                                  x.servingLine.direction, 
                                  `${x.dateTime.hour}:${x.dateTime.minute}`));
    });

  return modeOfTransport;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------
//Get Route from station to other station
//-----------------------------------------------------------------------------------------------------------------------------------------------------
function station(transportationNumber, transportationType, startLocation, startTime, endLocation, endTime, duration)//create a station object
{
  this.transportationNumber = transportationNumber;
  this.transportationType = transportationType;
  this.startLocation = startLocation;
  this.startTime = startTime;
  this.endLocation = endLocation;
  this.endTime = endTime;
  this.duration = duration;
}

function getStations(data)//fill and put all station objects into array
{
  let stations = [];

  data.legs.forEach(x =>
  {
    stations.push(new station(x.mode.number, 
                              x.mode.product, 
                              x.points[0].name, 
                              x.points[0].dateTime.time, 
                              x.points[1].name, 
                              x.points[1].dateTime.time, 
                              x.timeMinute));
  });

  return stations;
}

function getTransportationRoute(data)//make object for every single route
{
  let routes = [];
<<<<<<< HEAD
=======

>>>>>>> 80a6dcb3baad4e4b09a488fff981b9d39f8fa41e
  if(data.trips != null)
    data.trips.forEach(x => 
    {
      routes.push({totalDuration: x.duration, stations: getStations(x)});
    });

  return routes;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------
//Get Stations from locations
//-----------------------------------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------------------------------------


async function getProposals(input)
{
  let currentTime = Date.now();
  let proposals = null;
  if(input.length > 3 && currentTime > lastTime + delay)
  {
    lastTime = currentTime;
    proposals = stopFinder(await getDataFromURL(getStopFinderURL(input))).slice(0, 5);
  }

  return proposals;
}

async function searchRoute(location1, location2)
{
<<<<<<< HEAD
  let testlocation = "Brixen - Vahrn";
  let testlocation1 = "Brixen";
  let teststation1 = "Dantestraße";
  let testlocation2 = "Klausen";
  let teststation2 = "Bahnhof";/*
  let testlocation = "asdf";
=======
  console.log(location1 + " " + location2);

  let testlocation = "Brixen Bahnhof";
  let testlocation1 = "Brixen";
  let teststation1 = "Dantestraße";
  let testlocation2 = "Klausen";
  let teststation2 = "Bahnhof";
  /*let testlocation = "asdf";
>>>>>>> 80a6dcb3baad4e4b09a488fff981b9d39f8fa41e
  let testlocation1 = "ddddddddd";
  let teststation1 = "ffffffff";
  let testlocation2 = "Boazen";
  let teststation2 = "Ortler";*/
<<<<<<< HEAD
  //var clone=document.getElementById("routeDiv").cloneNode();
  let testData1 = getTransportationRoute(await getDataFromURL(getEFARouteURL(testlocation1, teststation1, testlocation2, teststation2)));
  let testData2 = getmotFromStation(await getDataFromURL(getEFAStationURL(testlocation1, teststation1)));
=======

  //let testData1 = getTransportationRoute(await getDataFromURL(getEFARouteURL(testlocation1, teststation1, testlocation2, teststation2)));
  //let testData2 = getmotFromStation(await getDataFromURL(getEFAStationURL(testlocation1, teststation1)));
>>>>>>> 80a6dcb3baad4e4b09a488fff981b9d39f8fa41e
  let testData3 = await getWeather(testlocation);
  /*console.log(testData1);
  console.log(testData2);
  console.log(testData3);*/
  //let asdf = stopFinder(await getDataFromURL(getStopFinderURL("Bx")));
<<<<<<< HEAD
  console.log(testData1);
  displayroute(testData1);
  displayweather(testData3);
=======
  //console.log(testData1);
>>>>>>> 80a6dcb3baad4e4b09a488fff981b9d39f8fa41e
  //console.log(testData3.iconCode);
  console.log(testData3);

  /*let BNData = getLocation(await getDataFromURL(getBNURL()), location.toLowerCase());
  let data = getWeatherData(BNData, await getDataFromURL(getOpenWeatherURL(BNData.latitude, BNData.longitude)));
  console.log(data);
  console.log(await getDataFromURL(getEFAStationURL(location1, station1)));
  console.log(await getDataFromURL(getEfaRouteURL(location1, station1, location2, station2)));*/
}

<<<<<<< HEAD

function displayroute(data){

  for(let i=0;i<data.length;i++){
    document.getElementsByClassName("names")[i].innerHTML='';
    document.getElementsByClassName("sep")[i].innerHTML=''
    document.getElementsByClassName("totp")[i].innerHTML=''
    document.getElementsByClassName("transport")[i].innerHTML=''
    document.getElementsByClassName("sloc")[i].innerHTML=''
    document.getElementsByClassName("middle")[i].innerHTML=''
    document.getElementsByClassName("destloc")[i].innerHTML=''
    document.getElementsByClassName("desttime")[i].innerHTML=''
    document.getElementsByClassName("stime")[i].innerHTML=''

  }
  document.getElementById("routeDiv").style.display="block";
  console.log(data[0].stations);
  for(let i=0;i<data.length;i++){
    
      currentDiv=document.getElementById("route"+i);
      currentStation=data[i].stations;
      currentDiv.getElementsByClassName("sep")[0].textContent=data[i].totalDuration+"h";
      currentDiv.getElementsByClassName("totp")[0].textContent=currentStation[0].startTime+" - "+currentStation[currentStation.length-1].endTime;
      for(let j=0;j<currentStation.length;j++){

        var trans=document.createElement('div');
        var trsnumb=document.createElement('div');
        var icon=document.createElement('div');
        var arrow=document.createElement('div');

        var stloc=document.createElement('div');
        var destloc=document.createElement('div');
        var marrow=document.createElement('div');
        var desttime=document.createElement('div');
        var stime=document.createElement('div');

        stloc.className="stloc";
        destloc.className="destloc";
        marrow.className="marrow";

        icon.innerHTML='<i class="fa-solid fa-train" aria-hidden="true"></i>';
      
        if(currentStation[j].transportationType=='Citybus'){
          icon.innerHTML='<i class="fa-solid fa-bus" aria-hidden="true"></i>';
        }
        else if(currentStation[j].transportationType=='Regionalzug'){
          icon.innerHTML='<i class="fa-solid fa-train" aria-hidden="true"></i>';
        }
        else if(currentStation[j].transportationType=='Bus'){
          icon.innerHTML='<i class="fa-solid fa-bus-simple" aria-hidden="true"></i>';
        }
        trsnumb.className="trsnumb1";
        icon.className="trsnumb2";
        trans.className="trsnumb";
        trsnumb.textContent=currentStation[j].transportationNumber;
        trans.appendChild(trsnumb);
        trans.appendChild(icon);
        
        arrow.innerHTML='<i class="fa-solid fa-angle-right"></i>';
        arrow.style.color='#a1303f';
        arrow.className='arrow';
        currentDiv.getElementsByClassName("names")[0].appendChild(trans);
        if(j!=currentStation.length-1)
        currentDiv.getElementsByClassName("names")[0].appendChild(arrow);

        stloc.textContent=currentStation[j].startLocation;
        destloc.textContent=currentStation[j].endLocation;
        marrow.textContent=currentStation[j].transportationNumber;
        desttime.textContent=currentStation[j].endTime;
        stime.textContent=currentStation[j].startTime;
        console.log(i)

        currentDiv.getElementsByClassName("sec1")[0].getElementsByClassName("sloc")[0].appendChild(stloc);
        currentDiv.getElementsByClassName("sec3")[0].getElementsByClassName("destloc")[0].appendChild(destloc);
        currentDiv.getElementsByClassName("sec2")[0].getElementsByClassName("middle")[0].appendChild(marrow);
        currentDiv.getElementsByClassName("sec4")[0].getElementsByClassName("desttime")[0].appendChild(desttime);
        currentDiv.getElementsByClassName("sec5")[0].getElementsByClassName("stime")[0].appendChild(stime);

      }

  }
  addListeners(data.length);
}

function addListeners(length){
  for(let i=0;i<length;i++){
    const targetDiv = document.getElementsByClassName("sminfo")[i];
    btn=document.getElementsByClassName("smbtn")[i];
    btn.onclick=function(){
      if (targetDiv.style.display !== "none") {
        targetDiv.style.display = "none";
        document.getElementsByClassName("sm")[i].className='fa-solid fa-angle-down sm';
      } else {
        targetDiv.style.display = "flex";
        document.getElementsByClassName("sm")[i].className='fa-solid fa-angle-up sm';
      }
    };
  }
}
function resetDiv(){

  

}

function displayweather(data){
  document.getElementById("demoA").textContent='';
  document.getElementById("demoB").textContent='';
  document.getElementById("demoA").style.display="hidden";
  var table = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoA").appendChild(table);
  var table2 = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoB").appendChild(table2);
  insertCells(table, data);
  insertCells(table2, data);
}

function insertCells(table, data){
  rowheader=table.insertRow();
  row = table.insertRow();
  row2 = table.insertRow();
  row3 = table.insertRow();
  row4 = table.insertRow();
  var iconurl =  'http://openweathermap.org/img/wn/'+data.iconCode+'.png';
  var img = document.createElement('img');
  img.src = iconurl;
  rowheader.insertCell().innerHTML=data.location;
  rowheader.insertCell().appendChild(img);
  row.insertCell().innerHTML='Temperatur';
  row3.insertCell().innerHTML='Windrichtung';
  row4.insertCell().innerHTML='Windgeschwindigkeit';
  row.insertCell().innerHTML=data.temperature;
  row3.insertCell().innerHTML=data.windDirection;
  row4.insertCell().innerHTML=data.windSpeed;
}




























/*async function getWeatherFromBN(url)
{
  return fetch(url)
    .then((response) => response.json())
    .then((responseJSON) => {return responseJSON});
}

//OpenWeather API
async function getWeatherFromOpenWeather(lat, lon)
{
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`)
          .then((response) => response.json())
          .then((responseJSON) => {return responseJSON});
}

//Buergernetz Valley
async function getweatherFromBuergernetzValley()
{
  return fetch(`http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json`)
    .then((response) => response.json())
    .then((responseJSON) => {return responseJSON});
}

//async function get
/*async caller() {
    const json = await this.getJSON();  // command waits until completion
    console.log(json.hello);            // hello is now available
}

/*function searchLocation(input, location)
{
    console.log(input[0]);
  //let matches  = input.filter(rows => rows['name'] === location);
  //const matches = data.filter(item => item['Last Name'] === "Smith" && item.Age === "36")
    //console.log(matches);
    /*let test = input.rows;
    console.log(test.length);
    //console.log(Object.keys(input.rows)).length
    //console.log(input.rows.length);
  //Object.keys(data.shareInfo[i]).length
    /*for(let count = 0; count < Object.keys(input.rows[count]).length; count++)
        if(input.rows[count].name.toLowerCase() == location.toLowerCase())
          return input.rows[count];
    return "test";
}

async function getWeather(location)
{
    //let bnv = [];
    let bnv = getWeatherFromBN(BNV_URL);
    /*console.log(typeof(bnv));
    console.log(bnv);
    console.log(bnv.PromiseResult[0]);
    //console.log(Object.keys(bnv.rows).length);
    //console.log(JSON.parse(bnv));
    /*console.log(searchLocation(bnv, location))
    console.log(JSON.stringify(bnv, null, 2));
    /*let opa = getWeatherFromOpenWeather(bnv.latitu)
    console.log(bnv);*/
    /*let test = await this.getWeather("46.8850", "11.4386");
    console.log(test);
}

var datasetBuerger = ""
var datasetWeatherApi = ""

/*function search()
{
    console.log("test");
    console.log(getWeatherFromBN(BNV_URL, "Langtaufers Grub"));
    //getWeather("Langtaufers Grub");
    //console.log("test");
    //console.log(datasetBuerger.rows[0]);
    //console.log("test");
    //console.log(await getWeather("46.8850", "11.4386"));
}
/*
fetch('http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json')
  .then(response => response.json())
  .then(data => 
    datasetBuerger = data
    );

fetch('https://api.openweathermap.org/data/2.5/weather?lat=46,8850&lon=11,4386&appid=e5d1be98e9c5ef580a9e3ed6b627664b')
    .then(response => response.json())
    .then(data => datasetWeatherApi = data);


//Weather Api
//Api Key = e5d1be98e9c5ef580a9e3ed6b627664b
//api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
//api.openweathermap.org/data/2.5/weather?lat=46.8850&lon=11.4386&appid=e5d1be98e9c5ef580a9e3ed6b627664b
//https://api.openweathermap.org/data/2.5/weather?lat=46,8850&lon=11,4386&appid=e5d1be98e9c5ef580a9e3ed6b627664b
/*Get example:
coord": {
    "lon": 11.4386,
    "lat": 46.885
  },
  "weather": [
    {
      "id": 803,
      "main": "Clouds",
      "description": "broken clouds",
      "icon": "04d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 276.89,
    "feels_like": 276.89,
    "temp_min": 273.1,
    "temp_max": 278.93,
    "pressure": 1022,
    "humidity": 87,
    "sea_level": 1022,
    "grnd_level": 912
  },
  "visibility": 10000,
  "wind": {
    "speed": 0.12,
    "deg": 46,
    "gust": 0.76
  },
  "clouds": {
    "all": 54
  },
  "dt": 1643881700,
  "sys": {
    "type": 2,
    "id": 2005542,
    "country": "IT",
    "sunrise": 1643870201,
    "sunset": 1643905162
  },
  "timezone": 3600,
  "id": 3164065,
  "name": "Sterzing",
  "cod": 200,
  */

  //Api mit parameter(wetter)



//Fahrplan Api https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=Brixen%20Brixen%20Dantestra%C3%9Fe&mode=direct&outputFormat=json
//10.10.30.15*/
=======
/*var timer;
function chk_me(){
   clearTimeout(timer);
   timer=setTimeout(function validate(){...},1000);
}*/
>>>>>>> 80a6dcb3baad4e4b09a488fff981b9d39f8fa41e
