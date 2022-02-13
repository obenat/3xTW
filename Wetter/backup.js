
function displayroute(data){

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
        arrow.className='arrow';
        currentDiv.getElementsByClassName("names")[0].appendChild(trans);
        if(j!=currentStation.length-1)
        currentDiv.getElementsByClassName("names")[0].appendChild(arrow);
        
      }

  }
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




