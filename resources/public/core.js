var map;
var markers = {};

var currentLocation;
var zoomLevel = 10;
var defaultMapTypeId = google.maps.MapTypeId.ROADMAP;
var selectedDestination;
var directionsDisplay;
var noDestinations = true;

var directionsService = new google.maps.DirectionsService();

function setMap(center) {
    var Options = {
	zoom: zoomLevel,
	mapTypeId: defaultMapTypeId,
	center: center
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), Options);
    google.maps.event.addListener(map, 'click', function(event) {
	mapClicked(event.latLng);
    });
    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}

function mapClicked(LatLng) {
    // move center of map to clicked position and go to add-destination-popup
    map.panTo(LatLng)
    $.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false });
}

function addMarker(ID,Lat,Lng,toMap) {
    var marker = new google.maps.Marker({
  	               position: new google.maps.LatLng(Lat,Lng),
	               map: toMap
	               // draggable: true
                 });
    markers[ID]=marker;
    google.maps.event.addListener(marker, 'click', function() {
    	markerClicked(ID);
    })
}

function showMarker(ID) {
    markers[ID].setMap(map);
}

function clearMarker(ID) {
    markers[ID].setMap(null);
}

function deleteMarker(ID) {
    markers[ID].setMap(null);
    delete markers[ID];
}
				  
function markerClicked(ID) {
    $.getJSON( '/get-location:'+ID,function(destination) {
    	$("form[name='edit-destination-form'] input[name='id']").val(ID);
    	$("form[name='edit-destination-form'] input[name='Lat']").val(destination.fields.Lat);
    	$("form[name='edit-destination-form'] input[name='Lng']").val(destination.fields.Lng);
    	$("form[name='edit-destination-form'] input[name='Name']").val(destination.fields.Name);
    	// $('#delete-point-text').html(destination.fields.Name);
    	$.mobile.changePage($("#edit-destination-popup"), { transition: "pop", role: "dialog", reverse: false } );
    })
}

function initMarkers(toMap) {
    $.getJSON( '/locations',
               function(data) {
		   noDestinations = (data.length == 0 );
		   $.each(data, function(i, destination) {		
		       addMarker(destination.id,
		    		   	 destination.fields.Lat,
		    		   	 destination.fields.Lng,
		    		   	 toMap)
		       //showMarker(destination.destinationId)
		   })})
}

function setCurrentLocation (callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
    	    currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	    callback();
	}, function (error) {
	    currentLocation = new google.maps.LatLng(51.03,13.43);
    	    setMap(currentLocation);
    	    initMarkers(map);
    	    switch(error.code) 
    	    {
    	    case error.TIMEOUT:
    	     	alert ('Timeout');
    	     	break;
    	    case error.POSITION_UNAVAILABLE:
    	     	alert ('Position unavailable');
    	     	break;
    	    case error.PERMISSION_DENIED:
    	     	alert ('Permission denied');
    	     	break;
    	    case error.UNKNOWN_ERROR:
	 	alert ('Unknown error');
	 	break;
	    }})
    } else {
	alert('Geo-location not available');
    }
}

function initialize () {
    directionsDisplay = new google.maps.DirectionsRenderer();
    setCurrentLocation(function () {
	  setMap(currentLocation);
	  initMarkers(map);
      })
}

// function calcRoute() {
//     var start = document.getElementById("start").value;
//     var end = document.getElementById("end").value;
//     var request = {
// 	origin:start,
// 	destination:end,
// 	travelMode: google.maps.TravelMode.DRIVING
//     };
//     directionsService.route(request, function(response, status) {
// 	if (status == google.maps.DirectionsStatus.OK) {
// 	    directionsDisplay.setDirections(response);
// 	}
//     });
// }
