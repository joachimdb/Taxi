var map;
var currentLocation = {};
var markers = {};

var zoomLevel = 10;
var defaultMapTypeId = google.maps.MapTypeId.ROADMAP;
var selectedDestination;
var directionsDisplay;
var noDestinations = true;

var directionsService = new google.maps.DirectionsService();

var geocoder = new google.maps.Geocoder();

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
}

function mapClicked(LatLng) {
    map.panTo(LatLng);
    
    $('#delete-destination-button').hide();
    
    $("form[name='add-destination-form'] input[name='Lat']").val(LatLng.lat());
	$("form[name='add-destination-form'] input[name='Lng']").val(LatLng.lng());
	
	geocoder.geocode({'latLng': LatLng},function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			$("form[name='add-destination-form'] input[name='Address']").val(results[0].formatted_address);
			$("form[name='add-destination-form'] input[name='Description']").val(results[1].formatted_address);
		} else {
			alert("Reverse geocode not successful: " + status);
			$$("form[name='add-destination-form'] input[name='Address']").val("Enter Address");
			$("form[name='add-destination-form'] input[name='Description']").val("Enter Description");
		}
		$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false } );
	});
	return false
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
    	$("form[name='add-destination-form'] input[name='id']").val(ID);
    	$("form[name='add-destination-form'] input[name='Lat']").val(destination.fields.Lat);
    	$("form[name='add-destination-form'] input[name='Lng']").val(destination.fields.Lng);
    	$("form[name='add-destination-form'] input[name='Description']").val(destination.fields.Description);
    	$("form[name='add-destination-form'] input[name='Address']").val(destination.fields.Address);
    	// $('#delete-point-text').html(destination.fields.Description);
    	$('#delete-destination-button').show();
    	$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false } );
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

//function getAddress (latlng) {	
//var geocoder = new google.maps.Geocoder();	
//
//geocoder.geocode({'latLng': latlng}, function(results, status) {
//	if (status == google.maps.GeocoderStatus.OK) {
//		results[0].formatted_address;
//	} else {
//		alert("Geocoder failed due to: " + status);
//	}
//})
//}

function setCurrentLocation (callback) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			currentLocation.LatLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			geocoder.geocode({'latLng': currentLocation.LatLng},function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					currentLocation.Address = results[0].formatted_address;
					callback();
				} else {
					alert("Reverse geocode not successful: " + status);
					callback();
				}})
		}, function (error) {
        	currentLocation.LatLng = new google.maps.LatLng(51.03,13.43);
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
        callback();})
	} else {
		alert('Geo-location not available');
		callback();
	}
}

function initialize () {
    directionsDisplay = new google.maps.DirectionsRenderer();
    setCurrentLocation(function () {
    	setMap(currentLocation.LatLng);
    	initMarkers(map);
    	$('#SearchField').val(currentLocation.Address);
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
