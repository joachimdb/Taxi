var map;
var markers = {};

var currentLocation;
var zoomLevel = 10;
var defaultMapTypeId = google.maps.MapTypeId.ROADMAP;
var selectedLocation;
var directionsDisplay;
var noLocations = true;

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
    // move center of map to clicked position and go to add-location-page
    map.panTo(LatLng)
    $.mobile.changePage($("#add-location-page"), { transition: "pop", role: "dialog", reverse: false });
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
    $.getJSON( '/location:'+ID,function(location) {
 	$("form[name='location-edit-form'] input[name='locationId']").val(ID);
 	$("form[name='location-edit-form'] input[name='locationLat']").val(location.locationLat);
 	$("form[name='location-edit-form'] input[name='locationLng']").val(location.locationLng);
 	$("form[name='location-edit-form'] input[name='locationName']").val(location.locationName);
 	$('#delete-point-text').html(location.locationName);
 	$.mobile.changePage($("#edit-location-page"), { transition: "pop", role: "dialog", reverse: false } );
    })
}

function initMarkers(toMap) {
    $.getJSON( '/locations',
               function(data) {
		   noLocations = (data.locations.length == 0 );
		   $.each(data.locations, function(i, location) {		
		       addMarker(location.locationId,location.locationLat,location.locationLng,toMap)
		       //showMarker(location.locationId)
		   })})
}

function initialize () {
    directionsDisplay = new google.maps.DirectionsRenderer();
    if (navigator.geolocation) {
	
        navigator.geolocation.getCurrentPosition(function(position) {
	    
     	    currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	    setMap(currentLocation);
	    initMarkers(map);
	    
		<!-- 	// google.maps.event.addListener(map, 'click', function(event) { -->
		<!-- 	//     placeLocationMarker(event.latLng); -->
		<!-- 	// }); -->
	    
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
	    }
	})}
    else {
	currentLocation = new google.maps.LatLng(51.03,13.43);
    }
    
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
