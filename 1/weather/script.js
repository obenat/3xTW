const WEATHER_API_KEY = "e5d1be98e9c5ef580a9e3ed6b627664b";
var lastTime = 0;
var delay = 4000;
var input1 = document.getElementById("sName");
var input2 = document.getElementById("dName");

/**
 * In dieser funktion wird ein fetch mit einer url die Übergeben wird ausgeführt,
 * dabei bekommt man den response einer Api, dies wird dann zurückgegeben
 * @param {*} url, url der jeweiligen Api 
 * @returns gibt die erhaltenen Daten zurück
 */
async function getDataFromURL(url)//make request
{
  let result = await fetch(url);
  let answer = null;
  if(result.ok)
    answer = await result.json();
  return answer;
}

/**
 * @param {*} lat, breitengrad einer Koordinate
 * @param {*} lon, längengrad einer Koordinate
 * @returns gibt den Link mit den benötigten Parameter der OpenWeatherApi zurück
 */
function getOWURL(lat, lon)
{
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
}

/**
 * @param {*} location, ein Ort/teile davon(string)
 * @returns gibt den Link mit dem benötigten Paramter der StopFinderApi zurück
 */
function getStopFinderURL(location)
{
  return `https://efa.sta.bz.it/apb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=${location}`;
}

/**
 * Erstellt ein Objekt, eines Ortes, mit den benötigten Informationen 
 * @param {*} name, name des Ortes
 * @param {*} station, station die sich im Ort befindet
 * @param {*} temp, temperatur(°C) im Ort
 * @param {*} icon, icon für die Darstellung des Wetters im Ort
 * @param {*} windSpeed, Windgeschwindigkeit(km/h) im Ort
 * @param {*} pressure, Luftdurck(hPa) im Ort
 * @param {*} deg, Windgrad(°) um die Windrichtung zu bestimmen
 */
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

/**
 * Erstellt ein Objekt für einen Ort.
 * Es werden die benötigten Daten herausgesucht
 * @param {*} name, name des Ortes
 * @param {*} coords, Koordinaten des Ortes
 * @returns das erstellt Objekt wird zurückgegeben
 */
async function createLocPos(name, coords)
{
    let weatherData = await getDataFromURL(getOWURL(coords[0], coords[1]));
    let location = name.split(", ");
    return new locPos(location[0], location[1], (weatherData.main.temp - 273.15).toFixed(1) + "°C", weatherData.weather[0].icon, (weatherData.wind.speed * 3.6).toFixed(1) + "km/h", weatherData.main.pressure + "hPa", weatherData.wind.deg + "°");
}

/**
 * Mit Hilfe dieser Funktion werden UTM Koordinaten zu Längen- und Breitengrade umgewandelt
 * Diese Funktion wurde nicht von uns geschrieben, der Ersteller dieser Funktion ist @Staale
 * https://stackoverflow.com/questions/343865/how-to-convert-from-utm-to-latlng-in-python-or-javascript
 * @param {*} input, eingabe der Koordinaten, als array
 * @param {*} zone, zone in der sich unsere Umgebung befindet
 * @returns Längen- und Breitengrad der UTM Koordinaten in Form eines Arrays
 */
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

/**
 * Alle erstellten Orte werden in ein Array gegeben und zurückgegeben
 * @param {*} locations, alle gefundenen Haltestellen
 * @returns alle gefundenen Haltestellen mit den benötigten Informationen
 */
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

/**
 * @param {*} location, Ort der gefunden werden soll
 * @param {*} limit, wie viele Orte maximal zurückgegeben werden können
 * @returns alle gefundenen Orte
 */
async function getStationProposals(location, limit = 1)
{
    let locations = await getDataFromURL(getStopFinderURL(location));
    if(locations.stopFinder.points != null)
        return locations.stopFinder.points.length > 1 ? await extractLocation(locations.stopFinder.points.slice(0, limit)) : await extractLocation(locations.stopFinder.points.point);
    else
        return null;
}

/**
 * @param {*} location, Name des Ortes
 * @param {*} station, Name der Station
 * @returns zusammengebaute URL, um die Buse, die an einer bestimmten Station vorbeikommen, zu erhalten 
 */
function getEFAStationURL(location, station)//EfaApi -> Buses from one station
{
    return `https://efa.sta.bz.it/apb/XML_DM_REQUEST?&locationServerActive=1&stateless=1&type_dm=any&name_dm=${location}%20${location}%20${station}&mode=direct&outputFormat=json`;
}

/**
 * Erstellt ein Objekt für Transportationsmittel, mit den jeweiligen Information 
 * @param {*} transportationNumber, Nummer des Transportmittels
 * @param {*} transportationType, Art des Transportmittels
 * @param {*} endLocation, Zielort des Transportmittels
 * @param {*} startTime, Start an der jeweiligen Haltestelle, des Transportmittels
 */
function mot(transportationNumber, transportationType, endLocation, startTime) //modeOfTransportation object
{
    this.transportationNumber = transportationNumber;
    this.transportationType = transportationType;
    this.endLocation = endLocation;
    this.startTime = startTime;
}

/**
 * Erstellt ein Objekt für jedes Transportmittel, dazu werden die benötigten Information herausgesucht
 * @param {*} data, Daten der Transportmittel
 * @returns Array, bestehent aus den Transportmitteln
 */
function getmotFromStation(data)//make object for each mot
{
    let modeOfTransport = [];
    if(data.departureList != null)
    data.departureList.slice(0, 10).forEach(x => 
    {
      modeOfTransport.push(new mot(x.servingLine.number, 
                                  x.servingLine.name, 
                                  x.servingLine.direction, 
                                  `${x.dateTime.hour}:${(x.dateTime.minute.length==1? "0" + x.dateTime.minute: x.dateTime.minute)}`));
    });

    return modeOfTransport;
}

/**
 * @param {*} startLocation, Ausgangsort
 * @param {*} startStation, Station im Ausgangsort
 * @param {*} endLocation, Zielort
 * @param {*} endStation, Station im Zielort
 * @returns die zusammengebaute URL um die Route zwischen zwei Orten zu erhalten
 */
function getEFARouteURL(startLocation, startStation, endLocation, endStation)//EfaApi
{
  return `https://efa.sta.bz.it/apb/XML_TRIP_REQUEST2?locationServerActive=1&stateless=%201&type_origin=any&name_origin=${startLocation},%20D${startStation}&type_destination=any&name_destination=${endLocation},%20${endStation}&itdTripDateTimeDepArr=dep&itdTime=0800&itdDate=20220209&calcNumberOfTrips=5&maxChanges=9&routeType=LEASTTIME&useProxFootSearch=1&coordOutputFormatTail=4&outputFormat=JSON&coordOutputFormat=WGS84[DD.DDDDD]`;
}

/**
 * Erstellt ein Objekt, um eine Etappe der Route zu Symbolisieren
 * @param {*} transportationNumber, Nummer des Transportmittels
 * @param {*} transportationType, Art des Transportmittels
 * @param {*} startLocation, Startpunkt des Transportmittels
 * @param {*} startTime, Startzeit des Transportmittels
 * @param {*} endLocation, Endpunkt des Transportmittels
 * @param {*} endTime, Endzeit, bis zur benötigten Haltestelle, des Transportmittels
 * @param {*} duration, Dauer der Fahrt des Transportmittels
 */
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

/**
 * Alle Stationen Objekte werden in ein Array gepackt und zurückgegeben
 * @param {*} data, Daten für die Objekte
 * @returns Array bestehent aus Station Objekten
 */
function getStations(data)
{
  let stations = [];

  data.legs.forEach(x =>
  {
    stations.push(new station((x.mode.number == '' ? "Zu Fuss" : x.mode.number), 
                              x.mode.product, 
                              x.points[0].name, 
                              x.points[0].dateTime.time, 
                              x.points[1].name, 
                              x.points[1].dateTime.time, 
                              x.timeMinute));
  });

  return stations;
}

/**
 * Für jede Route wird ein Objekt erstellt, indem die Dauer und ein Station Objekt enthalten ist
 * @param {*} data, Daten für die Objekte 
 * @returns Array, mit den erstellten Objekten
 */
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

/**
 * Alle gefundenen Daten werden in eine Array verpackt und zurückgegeben.
 * Nur der Name wird herausgeholt
 * @param {*} data, Gefundene Daten
 * @returns Array mit den Daten
 */
function getSuggestName(data)
{
  let output = [];
  if(data.stopFinder.points.length)
    data.stopFinder.points.forEach(x => output.push(x.name));
  
  return output;
}

/**
 * Vorschläge für eine Eingabe werden gesucht
 * Dabei muss die Eingabe min. 3 Character lang sein
 * @param {*} input, Eingabe für die, die Vorschläge gefunden werden sollen
 * @returns Die gefundenen Vorschläge sollen zurückgegeben werden
 */
async function getSuggestions(input)
{
  let suggestions = null;
  if(input.length > 3)
    suggestions = getSuggestName(await getDataFromURL(getStopFinderURL(input))).slice(0, 5);

  return suggestions;
}

/**
 * Diese Funktion ist mit dem Button verbunden. Sie ist sozusagen die Schnittstehle zwischen Logik und Grafik.
 * Hierbei wird unterschieden zwischen einfacher Eingabe und doppelter Eingabe. Bei der einfachen Eingabe wird nur ein Wert übergeben.
 * Zurück bekommt man die Busse die an der Angegebenen Station halten werden.
 * Bei der doppelten Eingabe bekommmt man die Route zwischen zwei Stationen.
 * @param {*} value1, Eingabe des ersten Feldes
 * @param {*} value2, Eingabe des zweiten Felds
 */
async function enter(value1, value2)
{
    let output;

    if(value1 != "" && value2 != "")
    {
        document.getElementById("oneloc").style.display='none';
        value1 = await getStationProposals(value1);
        value2 = await getStationProposals(value2);
        console.log(value1);
        console.log(value2);
        displayweather(value1, value2);
        document.getElementById("demoB").style.display='flex';
        document.getElementById("demoA").style.display='flex';
        displayroute(getTransportationRoute(await getDataFromURL(getEFARouteURL(value1[0].location, value1[0].station, value2[0].location, value2[0].station))).slice(0,6));
    }
    else if(value1 != "")
    {
        document.getElementById("routeDiv").style.display='none';
        document.getElementById("oneloc").style.display='block';
        document.getElementById("weatherloc").style.display='none';
        value1 = await getStationProposals(value1);
        output = getmotFromStation(await getDataFromURL(getEFAStationURL(value1[0].location, value1[0].station)));
        displaysingle(output);
    }
    /*else
      let test = getSuggestions(value2);*/

}
/**
 * Stellt die Busse, die an der ausgewähtlen Station vorbeifahren, Grafisch dar 
 * @param {*} data Array mit den Bussen
 */
function displaysingle(data){
   for(let i=0; i<data.length;i++){
     var newdiv=document.createElement("div");
     newdiv.className='sminfo upperu';
     newdiv.style.display='flex';
     var u1=document.createElement("div");
     var u2=document.createElement("div");
     var u3=document.createElement("div");
     var u4=document.createElement("div");
     u1.className="udivs";
     u2.className="udivs";
     u3.className="udivs";
     u4.className="udivs";
     u1.textContent=data[i].startTime;
     u2.textContent=data[i].transportationNumber;
     u3.textContent=data[i].endLocation;
     u4.textContent=data[i].transportationType;
     newdiv.appendChild(u1);
     newdiv.appendChild(u2);
     newdiv.appendChild(u3);
     newdiv.appendChild(u4);
     document.getElementById("oneloc").appendChild(newdiv);
   }
 }

/**
 * Zeigt die gesammten Divs der Routen an
 * @param {*} data, Array von den Routen
 */
function displayroute(data){
  document.getElementById("weatherloc").style.display='flex';
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
      currentDiv.style.display="block";
      document.getElementsByClassName("seemore")[i].style.display="block";
      document.getElementsByClassName("smbtn")[i].style.display="block";
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
        else if(currentStation[j].transportationType=='Fussweg'){
          icon.innerHTML='<i class="fa-solid fa-person-walking" aria-hidden="true"></i>';
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

/**
 * Zu den Buttens der Divs wird ein EventListener hinzugefügt, damit diese auch betätigt werden können
 * @param {*} length, Anzahl der Buttons
 */
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

/**
 * Stellt das Wetter in einem order beiden Orten dar
 * @param {*} value1, Ort1, mit den jeweiligen Informationen für das Wetter
 * @param {*} value2, Ort2, mit den jeweiligen Informationen für das Wetter
 */
function displayweather(value1, value2 = null){
  document.getElementById("demoA").textContent='';
  document.getElementById("demoB").textContent='';
  document.getElementById("demoA").style.display="hidden";
  var table = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoA").appendChild(table);
  var table2 = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoB").appendChild(table2);
  insertCells(table, value1[0]);
  if(value2 != null)
    insertCells(table2, value2[0]);
}

/**
 * Stellt die Informationen der Orte mit den jeweiligen Bildern dar
 * @param {*} table, Tabelle für den Ort
 * @param {*} data, Daten, des Ortes und dem Wetter
 */
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
  row3.insertCell().innerHTML='Windgrad';
  row4.insertCell().innerHTML='Windgeschwindigkeit';
  row.insertCell().innerHTML=data.temperature;
  row3.insertCell().innerHTML=data.windDegree;
  row4.insertCell().innerHTML=data.windSpeed;
}

/**
 * Erstellt einen EventListener für das obere Eingabefeld
 *//*
input1.addEventListener("keyup", async (e) => 
{
  setSuggestions(input1);
});*/

/**
 * Erstellt einen EventListener für das untere Eingabefeld
 *//*
input2.addEventListener("keyup", async (e) => 
{
  setSuggestions(input2);
});*/

/**
 * Erstellt eine Liste mit den gefundenen Vorschlägen, die der Benutzer auwählen kann
 * @param {*} input, Feld in der die Eingabe erfolgt
 *//*
async function setSuggestions(input)
{
  //let currentTime = Date.now();
  //if(currentTime > lastTime + delay)
    //lastTime = currentTime;
    removeElements();
    let suggestions = await getSuggestions(input.value)
    for(let count = 0; count < suggestions.length; count++)
    {
      let listItem = document.createElement("li");
      listItem.classList.add("list-items");
      listItem.style.cursor = "pointer";
      listItem.setAttribute("onclick", "displayNames('" + input + ", " + suggestions[count] + "')");
      listItem.innerHTML = "<b>" + suggestions[count] + "</b>";
      document.querySelector(".list").appendChild(listItem);
    }
};*/

/**
 * Ausgewählte Daten werden in das Inputfeld geschrieben
 * @param {*} input, Feld in der die Eingabe erfolgt
 * @param {*} suggestion, Vorschlag der vom Benutzer ausgewählt wurde
 *//*
function displayNames(input, suggestion)
{
  input.value = suggestion;
  removeElements();
}*/

/**
 * Entfernt die Elemente der Liste
 *//*
function removeElements()
{
  let items = document.querySelectorAll(".list-items");
  items.forEach((item) => {
    item.remove();
  });
}*/