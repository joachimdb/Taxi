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
    navigationMap = new google.maps.Map(document.getElementById("directions_map_canvas"), Options);
    directionsDisplay.setMap(navigationMap);
    directionsDisplay.setPanel(document.getElementById("directions_panel"));
    
    var destinationLat = $("form[name='edit-destination-form'] input[name='destinationLat']").val();
    var destinationLng = $("form[name='edit-destination-form'] input[name='destinationLng']").val();
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
	    var leg = response.routes[0].legs[0];
	    alert(leg.distance.text);
	    alert(leg.steps.length);
	    var str = "";
	    for (step in leg.steps) {
		str = str + leg.steps[step].instructions + "<br>";
	    }
	    alert(str);
            directionsDisplay.setDirections(response);
    	} else {
    	    alert("Could not calculate route...");
    	    $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    	}
    });
}


// function calcRoute(origin,destination) {
//     var request = {
//      	origin: origin,
//      	destination: destination,
//      	travelMode: google.maps.DirectionsTravelMode.DRIVING
//     };
//     directionsService.route(request, function(response, status) {
//      	if (status == google.maps.DirectionsStatus.OK) {
// 	    for (i in response.routes[0].legs[0]) {
// 	     	alert(i); }
//             directionsDisplay.setDirections(response);
//     	} else {
//     	    alert("Could not calculate route...");
//     	    $.mobile.changePage($("#location-page"), { transition: "pop", role: "page", reverse: false } );
//     	}
//     });
// }

$( '#directions-page' ).live( 'pageshow',function(event){
    $(function() {
  	  initializeDirections();
	  calcRoute(currentLocation,targetLocation);
	  // for navigation: repeatedly check currentLocation and call calcRoute again
    })
})

$('#cancel-navigation-button').click(
    function(){
	// alert("cancel-navigation");
        $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

