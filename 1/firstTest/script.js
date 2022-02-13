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
  console.log(location1 + " " + location2);

  let testlocation = "Brixen Bahnhof";
  let testlocation1 = "Brixen";
  let teststation1 = "Dantestraße";
  let testlocation2 = "Klausen";
  let teststation2 = "Bahnhof";
  /*let testlocation = "asdf";
  let testlocation1 = "ddddddddd";
  let teststation1 = "ffffffff";
  let testlocation2 = "Boazen";
  let teststation2 = "Ortler";*/

  //let testData1 = getTransportationRoute(await getDataFromURL(getEFARouteURL(testlocation1, teststation1, testlocation2, teststation2)));
  //let testData2 = getmotFromStation(await getDataFromURL(getEFAStationURL(testlocation1, teststation1)));
  let testData3 = await getWeather(testlocation);
  /*console.log(testData1);
  console.log(testData2);
  console.log(testData3);*/
  //let asdf = stopFinder(await getDataFromURL(getStopFinderURL("Bx")));
  //console.log(testData1);
  //console.log(testData3.iconCode);
  console.log(testData3);

  /*let BNData = getLocation(await getDataFromURL(getBNURL()), location.toLowerCase());
  let data = getWeatherData(BNData, await getDataFromURL(getOpenWeatherURL(BNData.latitude, BNData.longitude)));
  console.log(data);
  console.log(await getDataFromURL(getEFAStationURL(location1, station1)));
  console.log(await getDataFromURL(getEfaRouteURL(location1, station1, location2, station2)));*/
}

/*var timer;
function chk_me(){
   clearTimeout(timer);
   timer=setTimeout(function validate(){...},1000);
}*/