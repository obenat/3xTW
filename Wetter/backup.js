import fetch from 'node-fetch'

var dataset=""
var locationlist=[]

fetch('http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json')
  .then(response => response.json())
  .then(data => 
    dataset=data
    );

function searchLocation(){
  for(let i=0;i<dataset.rows.length-1;i++){
    locationlist.push(dataset.rows[i].name);
  }
  for(let i=0;i<locationlist.length;i++){
    console.log(locationlist[i])
  }
  console.log(dataset.rows.find(x=>x.name===document.getElementById("locationinput").value))
}

window.addEventListener("load", function(event) {
  console.log("Alle Ressourcen haben das Laden beendet!");
});



/*
<script>
    var x = document.getElementById("demo");
    
    function getLocation() {
        console.log("sdf")
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
      } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
      }
    }
    
    function showPosition(position) {
      x.innerHTML = "Latitude: " + position.coords.latitude + 
      "<br>Longitude: " + position.coords.longitude;
    }
    </script>
*/