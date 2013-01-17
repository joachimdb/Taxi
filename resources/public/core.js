var map;
var currentLocation = {};
var markers = {};

var zoomLevel = 10;
var defaultMapTypeId = google.maps.MapTypeId.ROADMAP;
var geocoder = new google.maps.Geocoder();

var directionsService = new google.maps.DirectionsService();

var serverChannelToken;
var serverChannel;

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
}

function mapClicked(latlng) {
    map.panTo(latlng);
    geocoder.geocode({'latLng': latlng},function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
    		$("form[name='plan_trip_form'] input[name='addressFrom']").val(currentLocation.Address);
    		$("form[name='plan_trip_form'] input[name='latFrom']").val(currentLocation.latlng.lat());
    		$("form[name='plan_trip_form'] input[name='lngFrom']").val(currentLocation.latlng.lng());			
    		$("form[name='plan_trip_form'] input[name='addressTo']").val(results[0].formatted_address);
    		$("form[name='plan_trip_form'] input[name='latTo']").val(latlng.lat());
    		$("form[name='plan_trip_form'] input[name='lngTo']").val(latlng.lng());
    	} else {
    	    alert("Reverse geocode not successful: " + status);
    	    $("form[name='plan_trip_form'] input[name='addressTo']").val("Enter Address");
    	}
	$.mobile.changePage($("#plan_trip_page"), { transition: "pop", role: "dialog", reverse: false } );
    });
    return false
}

function addMarker(ID,Lat,Lng,toMap) {
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(Lat,Lng),
		map: toMap
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
	$.getJSON( '/trip:'+ID,function(trip) {
    	$("form[name='plan_trip_form'] input[name='addressFrom']").val(currentLocation.Address);
//    	$("form[name='plan_trip_form'] input[name='latFrom']").val(currentLocation.latlng.lat());
//    	$("form[name='plan_trip_form'] input[name='lngFrom']").val(currentLocation.latlng.lng());			
    	$("form[name='plan_trip_form'] input[name='addressFrom']").val(trip.addressFrom);
    	$("form[name='plan_trip_form'] input[name='latFrom']").val(trip.latFrom);
    	$("form[name='plan_trip_form'] input[name='lngFrom']").val(trip.lngFrom);
    	$("form[name='plan_trip_form'] input[name='addressTo']").val(trip.addressTo);
    	$("form[name='plan_trip_form'] input[name='latTo']").val(trip.latTo);
    	$("form[name='plan_trip_form'] input[name='lngTo']").val(trip.lngTo);
    	$.mobile.changePage($("#plan_trip_page"), { transition: "pop", role: "dialog", reverse: false } );
    })
}

function initMarkers(toMap) {
	$.getJSON( '/trips', function(data) {
		$.each(data, function(i, trip) {
			addMarker(trip.tripId,trip.geoPtTo.latitude,trip.geoPtTo.longitude,toMap);
		});});
}

function setCurrentLocation (callback) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			currentLocation.latlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			geocoder.geocode({'latLng': currentLocation.latlng},function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					currentLocation.Address = results[0].formatted_address;
					callback();
				} else {
					alert("Reverse geocode not successful: " + status);
					callback();
				}})
		}, function (error) {
        	currentLocation.latlng = new google.maps.LatLng(51.03,13.43);
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

function onOpened() {
    // alert("Channel opened!");
}

function onError(err) {
	alert("Error "+err.code+": "+err.description);
}

function parseMessage(msg) {
	var result={};
	var match;
	pl     = /\+/g;  // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g;
	decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
	while (match = search.exec(msg))
		result[decode(match[1])] = decode(match[2]);
	return result;
}	
		
function onMessage(msg) {
	alert("Message received from server:\n"+msg.data)
	var response={msgId:parseMessage(msg.data).msgId};
	$.post( "/confirm", response, function(data) {
	});
}

function onClose() {
    alert("Channel closed!");
}

function initializeServerChannel () {
	$.post( '/get_channel_token', {}, function(data) {
		serverChannelToken=data;
		serverChannel = new goog.appengine.Channel(serverChannelToken);
		socket = serverChannel.open();
		socket.onopen = onOpened;
		socket.onmessage = onMessage;
		socket.onerror = onError;
		socket.onclose = onClose;
		$.getJSON( '/token_received', function(data) {});
	});	
}

function initialize () {
	initializeServerChannel();
	setCurrentLocation(function () {
		setMap(currentLocation.latlng);
		initMarkers(map);
		$('#searchField').val(currentLocation.Address);
	});
}

function computeDirections(origin,destination,successCallback,failCallback) {
	var request = {
			origin: origin,
			destination: destination,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			successCallback(response);
		} else {
			alert("Could not calculate route...");
			failCallback(status);
		}	
	});
}