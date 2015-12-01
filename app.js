/**************************
KNOWN BUGS:

Firefox doesn't display Average stats (temp / weather on top bar)
Firefox doesn't display on click dropdown from city headers in right bar.
**************************/


window.onload = function(){

  var mapPane = document.getElementById('mapPane'); //Main Map
  var mainSubBtn = document.getElementById('mainSubBtn'); //Main Submit Button
  var startZip = document.getElementById('startZip'); //Start Zip
  var endZip = document.getElementById('endZip'); //End Zip
  var optionsPane = document.getElementById('optionsPane'); //Citys Listing Right Bar
  var startCity = document.getElementById('startCity'); //Top Bar Start City
  var endCity = document.getElementById('endCity'); //Top Bar End City
  var avgWeather = document.getElementById('avgWeather'); //Average Weather Type
  var avgTemp = document.getElementById('avgTemp'); //Average Temp

  var last = false;
  var distance = 0;
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var city1 = {
    name:'',
    lat:0,
    lng:0,
    zip:'',
    temp:''
  };

  var city2 = {
    name:'',
    lat:0,
    lng:0,
    zip:'',
    temp:''
  };

  var cityArr = [];
  cityArr.push(city1, city2);

  var cityMid = {
    lat:[],
    lng:[]
  };
  var openArr = [];

  /**************************
  senInfo:

  Collects initial data on start / endpoints from Google API
  **************************/

  function setInfo(zip1, city)
  {
    //var api = "https://jsonp.afeld.me/?url=https%3A%2F%2Fwww.zipcodeapi.com%2Frest%2FLapKZOoH0rcwVyfgQqrp0qvSBrlBbueXFEHEt6mtxz0t8fJYFboGBTydlUPxp3u4%2Finfo.json%2F"+zip1+"%2Fdegrees";
    var api = "http://maps.googleapis.com/maps/api/geocode/json?address="+zip1+"&sensor=true";
    $.ajax({
        url: api
        })
        .done(function( data ) {
          city.name = data['results'][0]['address_components'][1]['long_name'];
          city.lat = parseFloat(data['results'][0]['geometry']['location']['lat']);
          city.lng = parseFloat(data['results'][0]['geometry']['location']['lng']);
          console.log(city.name);
          if(city == city2)
          {
            last = true;
          }
          if(last)
          {
            last = false;
            buildMidCities();
            for(var i = 0; i < cityArr.length; i++)
            {
              getWeather(cityArr[i]);
            }
          }
        });
  }

  /**************************
  buildMidCities:

  Calculates Lat/Long difference between endpoints for multipule points on a straight line.
  **************************/
  function buildMidCities ()
  {
    cityMid = {
      lat:[],
      lng:[]
    };
    var latDif = 0;
    var lngDif = 0;
    var east = false;

    lngDif = city1.lng - city2.lng;

    if(city1.lat > city2.lat)
    {
      latDif = Math.round(city1.lat - city2.lat);
      for(var i = 0; i < latDif; i++)
      {
        cityMid.lat.push(city1.lat - i);
        cityMid.lng.push(city1.lng - (lngDif/latDif)*(i));
      }
    }
    else
    {
      latDif = Math.round(city2.lat - city1.lat);
      for(var i = 0; i < latDif; i++)
      {
        cityMid.lat.push(city1.lat + i);
        cityMid.lng.push(city1.lng - (lngDif/latDif)*(i));
      }
    }

    cityArr = [];
    cityArr.push(city1);
    for(var i = 1; i < cityMid.lat.length; i++)
    {
      var cityObj = {
        lat:cityMid.lat[i],
        lng:cityMid.lng[i]
      };
      cityArr.push(cityObj);
    }
    cityArr.push(city2);
    for(var i = 0; i < cityArr.length; i++)
    {
      cityArr[i].idx = i;
    }
    console.log(cityArr);
  }

  /**************************
  buildCities:

  Builds the cityHeader list on the right bar.
  **************************/
  function buildCities()
  {
    var htmlStr = '';
    for(var i = 0; i < cityArr.length; i++)
    {
      var lbl = labels[i % labels.length];
      htmlStr += '<div class = "row cityCollector">' +
        //'<div class="col-md-1 cityHeader">'+ lbl + '</div>' +
        '<div class="col-md-12 cityHeader">'+ cityArr[i].name + '</div>' +
        '</div>' +
        '<div class = "row"'+
          '<div class="col-md-1"'+'</div>'+
          '<div class="col-md-10"id="'+cityArr[i].idx+'_pop">'+'</div>' +
          '<div class="col-md-1"'+'</div>'+
        '</div>'+
        '</div>' +
        '</div>'
      ;
    }
      htmlStr = htmlStr + '<div class = "row optionsBlur"'+ '</div>';
      optionsPane.innerHTML = htmlStr;
      optionsPane.style.display = 'block';

    return htmlStr;
  }

  /**************************
  click Listener:

  Waits for the submit button to be clicked to start API calls based on input Zipcodes.
  **************************/
  mainSubBtn.addEventListener('click', function(event){
  var tar = event.target;
  var start = startZip.value;
  var end = endZip.value;
    if (start != '' && end != ''){
      city1.zip = start;
      city2.zip = end;
      console.log("Zips:" + start + " " + end);
      last = false;
      setInfo(start, city1);
      setInfo(end, city2);
    }
  });
  /**************************
  click Listener:

  Waits for someone to click on a cityHeader to display more info.
  **************************/
  optionsPane.addEventListener('click', function(event){
  var tar = event.target;
  var city = '';
  console.log(tar.innerText);
  for(var item in cityArr)
  {
    if (cityArr[item].name == tar.innerText)
    {
      city = cityArr[item];
    }
  }
  var child = document.getElementById(city.idx+'_pop');
  if(city !== '' && openArr.indexOf(city) == -1)
  {
    child.innerHTML =
    '<div class = "row">'+
    '<div class="col-md-3 listItem">Lat:</div>'+'<div class="col-md-5 listValue">'+city.lat.toFixed(3)+'</div>'+
    '</div>'+
    '<div class = "row">' +
    '<div class="col-md-3 listItem">Long:</div>'+'<div class="col-md-5 listValue">'+city.lng.toFixed(3)+'</div>'+
    '</div>'+
    '<div class = "row">' +
    '</div>' +
    '<div class = "row listItemW listItemWT">' +
      '<div class="col-md-12 listValue">'+city.weatherDes+'</div>'+
    '</div>' +
    '<div class = "row listItemW">' +
      '<div class="col-md-4 listValue"><img src="http://openweathermap.org/img/w/'+city.weatherIco+'.png" alt="" /></div>'+
      //'<div class="col-md-3 listItem">Temp:</div>'+
      '<div class="col-md-8 listValue">'+city.temp+' F</div>'+
    '</div>'
    ;
    openArr.push(city);
  }
  else if(city !== '') {
    child.innerHTML = '';
    var idx = openArr.indexOf(city);
    openArr.splice(idx,1);
  }
  console.log(tar);
  console.log(city);

});

/**************************
getWeather(city):

Queries the openweathermap API for weather, and city names on midpoint cities/locations.
**************************/
  function getWeather(city)
  {
    var lat = city.lat.toFixed(3);
    var lng = city.lng.toFixed(3);
    var api = 'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid=2de143494c0b295cca9337e1e96b00e0';

    $.ajax({
        url: api
        })
        .done(function( data ) {

          city.temp = ((data['main']['temp'] - 273.15)* 1.8000 + 32.00).toFixed(1);
          city.pressure = data['main']['pressure'];
          city.humidity = data['main']['humidity'];
          city.weatherDes = data['weather'][0]['description'];
          city.weatherIco = data['weather'][0]['icon'];
          if(city.name == '' || city.name === undefined)
          {
            city.name = data['name'];
          }
          if(city == city2)
          {
            last = true;
          }
          if(last === true)
          {
            buildCities();
            buildAverage();
            startCity.innerText = "Start: " + city1.name;
            endCity.innerText = "End: " +city2.name;
            initMap();
            mapPane.style.display = 'block';
          }
        });
  }

  /**************************
  buildAverage():

  Finds the average weather and temp data and displays it.
  **************************/
  function buildAverage(){
    var hold = {};
    var tempTotal = 0;


    for (var i = 0; i < cityArr.length; i++)
    {
      if (hold[String(cityArr[i].weatherDes)] === undefined)
      {
        console.log("adding" + String(cityArr[i].weatherDes));
        hold[String(cityArr[i].weatherDes)] = parseFloat(1);
      }
      else
      {
        console.log("Found Another: "+ String(cityArr[i].weatherDes));
        hold[String(cityArr[i].weatherDes)] = parseFloat(hold[String(cityArr[i].weatherDes)]) + 1;
      }
      tempTotal = tempTotal + parseFloat(cityArr[i].temp);
    }
    var max = 0;
    var maxIdx = '';
    var total = 0;
    for(var item in hold)
    {
      if(hold[item] > max)
      {
        max = hold[item];
        maxIdx = item;
      }
      total = total + hold[item];
    }
    var str = "Currently over " + ((max/total)*100).toFixed(3) + "% of your trip, you can expect: " + maxIdx;
    console.log(hold);
    console.log("Max: " + maxIdx + " :: " + max + " AVG: " + (max/total)*100 + "%");
    avgWeather.innerText = str;
    console.log(tempTotal);
    avgTemp.innerText = "Average Temp: " + (parseFloat(tempTotal) / cityArr.length).toFixed(1);
  }

  /**************************
  initMap():

  Creates and builds the google map display.
  **************************/
  function initMap() {

    // Specify features and elements to define styles.
    var styleArray = [
      {
        featureType: "all",
        stylers: [
         { saturation: -10 }
        ]
      },{
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          { hue: "#00ffee" },
          { saturation: 50 }
        ]
      },{
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ];

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(mapPane, {
      center: {lat: city1.lat, lng: city1.lng},
      scrollwheel: true,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      // Apply the map style array to the map.
      styles: styleArray,
      zoom: 5
    });

    var directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });

  // Set destination, origin and travel mode.
  var request = {
    destination: {lat: city2.lat, lng: city2.lng},
    origin: {lat: city1.lat, lng: city1.lng},
    travelMode: google.maps.TravelMode.DRIVING
  };

  // Pass the directions request to the directions service.
  var directionsService = new google.maps.DirectionsService();
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      // Display the route on the map.
      directionsDisplay.setDirections(response);
    }
  });

  //var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var labelIndex = 0;
  var flightPlanCoordinates = [];

  for(var i = 0; i < cityArr.length; i++)
  {
    var myLatLng = {lat:cityArr[i].lat, lng:cityArr[i].lng};
    flightPlanCoordinates.push(myLatLng);
    cityArr[i].marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    label: labels[labelIndex++ % labels.length],
    title: cityArr[i].name,
    animation: google.maps.Animation.DROP
  });
  }

  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#8700ff',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  flightPath.setMap(map);
  }

};
