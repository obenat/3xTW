const WEATHER_API_KEY = "e5d1be98e9c5ef580a9e3ed6b627664b";

async function getDataFromURL(url)//make request
{
  let result = await fetch(url);
  let answer = null;
  if(result.ok)
    answer = await result.json();
  return answer;
}

function getOWURL(lat, lon)//OpenWeatherApi
{
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
}

function getStopFinderURL(location)
{
  return `https://efa.sta.bz.it/apb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=${location}`;
}

function locPos(name, station, temp, icon, windSpeed, pressure, deg)
{
    this.location = name;
    this.station = station;
    this.temperature = temp;
    this.iconCode = icon;
    this.windSpeed = windSpeed;
    this.pressure = pressure;
    this.windDegree = deg;
}

async function getWeatherData(coords)
{
    return await getDataFromURL(getOWURL(coords[0], coords[1]));
}

async function createLocPos(name, coords)
{
    let weatherData = await getDataFromURL(getOWURL(coords[0], coords[1]));
    let location = name.split(", ");
    return new locPos(location[0], location[1], (weatherData.main.temp - 273.15).toFixed(1), weatherData.weather[0].icon, (weatherData.wind.speed * 3.6).toFixed(1), weatherData.main.pressure, weatherData.wind.deg);
}

function utmToLatLng(input, zone = 32)
{
    easting = parseFloat(input[0]);
    northing = 5500000 - parseFloat(input[1]);

    a = 6378137;
    e = 0.081819191;
    e1sq = 0.006739497;
    k0 = 0.9996;

    arc = northing / k0;
    mu = arc / (a * (1 - Math.pow(e, 2) / 4.0 - 3 * Math.pow(e, 4) / 64.0 - 5 * Math.pow(e, 6) / 256.0));
    
    ei = (1 - Math.pow((1 - e * e), (1 / 2.0))) / (1 + Math.pow((1 - e * e), (1 / 2.0)));
    
    ca = 3 * ei / 2 - 27 * Math.pow(ei, 3) / 32.0;
    
    cb = 21 * Math.pow(ei, 2) / 16 - 55 * Math.pow(ei, 4) / 32;
    cc = 151 * Math.pow(ei, 3) / 96;
    cd = 1097 * Math.pow(ei, 4) / 512;
    phi1 = mu + ca * Math.sin(2 * mu) + cb * Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu);

    n0 = a / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (1 / 2.0));

    r0 = a * (1 - e * e) / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (3 / 2.0));
    fact1 = n0 * Math.tan(phi1) / r0;
    
    _a1 = 500000 - easting;
    dd0 = _a1 / (n0 * k0);
    fact2 = dd0 * dd0 / 2;
   
    t0 = Math.pow(Math.tan(phi1), 2);
    Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
    fact3 = (5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4) / 24;
    
    fact4 = (61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6) / 720;
    
    lof1 = _a1 / (n0 * k0);
    lof2 = (1 + 2 * t0 + Q0) * Math.pow(dd0, 3) / 6.0;
    lof3 = (5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 * Math.pow(t0, 2)) * Math.pow(dd0, 5) / 120;
    _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);

    _a3 = _a2 * 180 / Math.PI;

    latitude = 180 * (phi1 - fact1 * (fact2 + fact3 + fact4)) / Math.PI;

    longitude = ((zone > 0) && (6 * zone - 183.0) || 3.0) - _a3;

    return [latitude, longitude];
}

async function extractLocation(locations)
{
    locationsArray = [];
    if(locations.length)
        for(let count = 0; count < locations.length; count++)
            locationsArray.push(await createLocPos(locations[count].name, utmToLatLng(locations[count].ref.coords.split(","))));
          
    else
        locationsArray.push(await createLocPos(locations.name, utmToLatLng(locations.ref.coords.split(","))));

    return locationsArray;
}

async function getStationProposals(location, limit = 1)
{
    let locations = await getDataFromURL(getStopFinderURL(location));
    if(locations.stopFinder.points != null)
        return locations.stopFinder.points.length > 1 ? await extractLocation(locations.stopFinder.points.slice(0, limit)) : await extractLocation(locations.stopFinder.points.point);
    else
        return null;
}
//---------------------------------------------------------
function getEFAStationURL(location, station)//EfaApi -> Buses from one station
{
    return `https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=${location}%20${location}%20${station}&mode=direct&outputFormat=json`;
}

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
//------------------------------------------------------------------------
function getEFARouteURL(startLocation, startStation, endLocation, endStation)//EfaApi -> Route from station to other station
{
  return `https://efa.sta.bz.it/apb/XML_TRIP_REQUEST2?locationServerActive=1&stateless=%201&type_origin=any&name_origin=${startLocation},%20D${startStation}&type_destination=any&name_destination=${endLocation},%20${endStation}&itdTripDateTimeDepArr=dep&itdTime=0800&itdDate=20220209&calcNumberOfTrips=5&maxChanges=9&routeType=LEASTTIME&useProxFootSearch=1&coordOutputFormatTail=4&outputFormat=JSON&coordOutputFormat=WGS84[DD.DDDDD]`;
}

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
//--------------------------------------------------

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


async function enter(value1, value2)
{
    let output;

    if(value1 != null && value2 != null)
    {
        value1 = await getStationProposals(value1);
        value2 = await getStationProposals(value2);

        output = getTransportationRoute(await getDataFromURL(getEFARouteURL(value1[0].location, value1[0].station, value2[0].location, value2[0].station)));
    }
    else if(value1 != null)
    {
        output = getmotFromStation(await getDataFromURL(getEFAStationURL(value1[0].location, value1[0].station)));
    }
    //let test = await getStationProposals(value1);
    //console.log(test);
    /*test = ["Albeins (Brixen)", "Grundschule"];
    let test1 = getmotFromStation(await getDataFromURL(getEFAStationURL(test[0], test[1])));
    console.log(test1);*/
    //let test = await getDataFromURL(openWeatherTest("674866.05", "5178159.83"));
    
    //let test = utmToLatLng(1, 674866.05, 5178159.83);
    return output;
}

