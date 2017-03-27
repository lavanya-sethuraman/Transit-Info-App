var origAddr =null;
var destAddr =null;
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37,lng: -95},
    zoom: 4
  });
  autocompleteLocations(map);
}

function autocompleteLocations(map){
  var orig = document.getElementById('origin');
  var dest = document.getElementById('destination');
  var autocompleteOrig = new google.maps.places.Autocomplete(orig);
  var autocompleteDest = new google.maps.places.Autocomplete(dest);
  autocompleteListener(autocompleteOrig,map,'SRC');
  autocompleteListener(autocompleteDest,map,'DEST');
}

function autocompleteListener(autocomplete,map,type){
  autocomplete.bindTo('bounds', map);
  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  autocomplete.addListener('place_changed', function() {
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
    map.setCenter(place.geometry.location);
    map.setZoom(10);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    if(type === 'SRC'){
      origAddr=place.place_id;
    } else{
      destAddr=place.place_id;
    }
    getTransitDetails(origAddr, destAddr);
  });
}


function getTransitDetails(origAddr, destAddr) {
  if(origAddr && destAddr)
  {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.90973623453719,lng: -102.48046875},
      zoom: 4
    });
    var request = {
      origin: {'placeId': origAddr},
      destination: {'placeId': destAddr},
      travelMode: 'TRANSIT',
      provideRouteAlternatives: true
    };
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsService.route(request,function(response, status){
      var routes = null;
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        routes = response.routes;
        getDetails(routes);
      }else {
        window.alert('Directions request failed due to ' + status);
      }
    });

  }
  else{
    return;
  }
}

function getDetails(routes) {
  var i=routes.length;
  routes.forEach(function(route) {
    var legs = route.legs;
    var optionHtml="";
    var stepsHtml="";
    legs.forEach(function(leg) {
      var steps = leg.steps;
      optionHtml='<div class="options"><p>Route Details : </p><ul><li> Leave At : ' + leg.departure_time.text + '</li>'+
      '<li> Reach At : ' + leg.arrival_time.text + '</li><li> Steps : ' + steps.length + '</li></ul>'+
      '<div class="steps hidden"><ol>';

      steps.forEach(function(step) {
        var transit = step.transit;
        var stepHtml='<li>Instructions : ' + step.instructions+
        '<ul><li>  Step Distance: ' + step.distance.text + '</li>' +
        '<li> Step Duration: ' + step.duration.text + '</li>';
        if (transit !== undefined) {
          stepHtml+='<li>Boarding Stop : ' + transit.departure_stop.name + '</li>'+
          '<li>Destination Stop : ' + step.transit.arrival_stop.name+ '</li>'+
          '<li>Boarding Time : '+ transit.departure_time.text + '</li>'+
          '<li>Reaching Time : ' + transit.arrival_time.text + '</li>'+
          '<li>Headsign : ' + transit.headsign + '</li>'+
          '<li>Line Name  : ' + transit.line.name + '& Agency : '+ transit.line.agencies.map(function(item) {
            return item.name;}) + '</li><li>Stop Number :'+ transit.num_stops + '</li>';
          }
          stepHtml+='</ul></li>';
          stepsHtml+=stepHtml;
        });
        stepsHtml+='</ol>';
        optionHtml+=stepsHtml;
      });
      optionHtml+='</div></div>';
      $('.js-directions-result').html(optionHtml);
    });
    optionListeners();
  }

  function optionListeners(){
    $('.options').click(function(event){
      event.stopPropagation();
      $(this).find('.steps').toggleClass('hidden');
    });
  }
