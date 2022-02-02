var dataset=""
var locationlist=[]

window.addEventListener("load", function(event) {
  
});

fetch('http://daten.buergernetz.bz.it/services/weather/station?categoryId=1&lang=de&format=json')
  .then(response => response.json())
  .then(data => 
    dataset=data
    );

function searchLocation(){
  for(let i=0;i<dataset.rows.length-1;i++){
    locationlist.push(dataset.rows[i].name);
    console.log(dataset.rows[i].name);
  }

  displaylocation(dataset.rows.find(x=>x.name===document.getElementById("locationinput").value))
}

function displaylocation(data){
  
  var table = document.createElement("table"), row, cellA, cellB;
  document.getElementById("demoA").appendChild(table);
  

  insertCells(table, data);

}

function insertCells(table, data){
  row = table.insertRow();
  row.insertCell().innerHTML=data.t;
  row.insertCell().innerHTML=data.N;
  row.insertCell().innerHTML=data.ff;
  row.insertCell().innerHTML=data.dd;
}

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