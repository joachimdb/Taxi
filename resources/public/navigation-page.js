var rendererOptions = {
    // draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var navigationMap;
var targetLocation;
var directions;

function initializeDirections() {
    var Options = {
	  zoom: zoomLevel,
	  mapTypeId: google.maps.MapTypeId.ROADMAP,
	  center: currentLocation
    };
    navigationMap = new google.maps.Map(document.getElementById("navigation_map_canvas"), Options);
    directionsDisplay.setMap(navigationMap);
    directionsDisplay.setPanel(document.getElementById("navigation_panel"));
    
    var destinationLat = $("form[name='edit-destination-form'] input[name='Lat']").val();
    var destinationLng = $("form[name='edit-destination-form'] input[name='Lng']").val();
    targetLocation = new google.maps.LatLng(destinationLat,destinationLng);
}

function calcRoute(origin,destination) {
    var request = {
     	origin: origin,
     	destination: destination,
     	travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
     	if (status == google.maps.DirectionsStatus.OK) {
     		directionsDisplay.setDirections(response);
     	} else {
     		alert("Could not calculate route...");
     			$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    	}	
    });
}

$('#navigation-page').live('pageshow',function(event){
    $(function() {
    	initializeDirections();
    	calcRoute(currentLocation,targetLocation);
    	// for navigation: repeatedly check currentLocation and call calcRoute again
    })
})

$('#cancel-navigation-button').click(
    function(){
    	$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

