const WEATHER_API_KEY = "e5d1be98e9c5ef580a9e3ed6b627664b";

function getOWURL(lat, lon)
{
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
}

function getBNURL(value = 1)
{
  return `http://daten.buergernetz.bz.it/services/weather/station?categoryId=${value}&lang=de&format=json`;
}

function getBusTrafficFromStationURL(location, station)
{
  return `https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=${location}%20${location}%20${station}&mode=direct&outputFormat=json`;
}

function getTransportationRouteURL(startLocation, startStation, endLocation, endStation)
{
  return `https://efa.sta.bz.it/apb/XML_TRIP_REQUEST2?locationServerActive=1&stateless=%201&type_origin=any&name_origin=${startLocation},%20D${startStation}&type_destination=any&name_destination=${endLocation},%20${endStation}&itdTripDateTimeDepArr=dep&itdTime=0800&itdDate=20220209&calcNumberOfTrips=5&maxChanges=9&routeType=LEASTTIME&useProxFootSearch=1&coordOutputFormatTail=4&outputFormat=JSON&coordOutputFormat=WGS84[DD.DDDDD]`;
}

async function getDataFromURL(url)
{
  const result = await fetch(url);
  if(!result.ok)
    console.log("serverDown");
  else
    const answer = await result.json();
  return (answer == null?"": answer);
}

function getLocation(data, location)
{
  return data.rows.find(x => {return x.name.toLowerCase() === location});
}

function weatherLocation(location, temperature, windDirection, windSpeed, windSpeed, humidity)
{
  this.location = location;
  this.temperature = temperature;
  this.windDirection = windDirection;
  this.windSpeed = windSpeed;
  this.humidity = humidity;
}

function getWeatherData(BNData, OWData)
{
  return new weatherLocation(BNData.name, 
                             BNData.t + "°C", 
                             BNData.dd, 
                             BNData.ff + "km/h",
                             BNData.rh + "%",
                             OWData.weather[0].description);
}

function mot(transportationNumber, transportationType, endLocation, startTime) //modeOfTransportation
{
  this.transportationNumber = transportationNumber;
  this.transportationType = transportationType;
  this.endLocation = endLocation;
  this.startTime = startTime;
}

function getmotFromStation(data)
{
  let modeOfTransport = [];

  data.departureList.slice(0, 10).forEach(x => 
  {
    modeOfTransport.push(new mot(x.servingLine.number, 
                                 x.servingLine.name, 
                                 x.servingLine.direction, 
                                 `${x.dateTime.hour}:${x.dateTime.minute}`));
  });

  return modeOfTransport;
}

function station(transportationNumber, transportationType, startLocation, startTime, endLocation, endTime, duration)
{
  this.transportationNumber = transportationNumber;
  this.transportationType = transportationType;
  this.startLocation = startLocation;
  this.startTime = startTime;
  this.endLocation = endLocation;
  this.endTime = endTime;
  this.duration = duration;
}

function getStations(data)
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

function getTransportationRoute(data)
{
  let routes = [];

  data.trips.forEach(x => 
  {
    routes.push({totalDuration: x.duration, stations: getStations(x)});
  });

  return routes;
}

async function searchRoute(location1, location2)
{
  /*let testlocation = "Brixen - Vahrn";
  let testlocation1 = "Brixen";
  let teststation1 = "Dantestraße";
  let testlocation2 = "Klausen";
  let teststation2 = "Bahnhof";*/
  let testlocation = "asdf";
  let testlocation1 = "Klusen";
  let teststation1 = "BUhnhaof";
  let testlocation2 = "Boazen";
  let teststation2 = "Ortler";

  console.log("test");
  
  let testData1 = getTransportationRoute(await getDataFromURL(getTransportationRouteURL(testlocation1, teststation1, testlocation2, teststation2)));
  let testData2 = getmotFromStation(await getDataFromURL(getBusTrafficFromStationURL(testlocation1, teststation1)));
  let BNData = getLocation(await getDataFromURL(getBNURL()), testlocation.toLowerCase());
  let testData3 = getWeatherData(BNData, await getDataFromURL(getOWURL(BNData.latitude, BNData.longitude)));
  console.log(testData1);
  console.log(testData2);
  console.log(testData3);

  /*let BNData = getLocation(await getDataFromURL(getBNURL()), location.toLowerCase());
  let data = getWeatherData(BNData, await getDataFromURL(getOpenWeatherURL(BNData.latitude, BNData.longitude)));
  console.log(data);
  console.log(await getDataFromURL(getBusTrafficFromStationURL(location1, station1)));
  console.log(await getDataFromURL(getTransportationRouteURL(location1, station1, location2, station2)));*/
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