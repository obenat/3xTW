var datasetBuerger = ""
var datasetWeatherApi = ""
function search()
{
    //console.log("test");
    //console.log(datasetBuerger.rows[0]);
    console.log(datasetWeatherApi);
}

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