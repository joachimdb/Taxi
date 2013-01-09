$( '#destination-page' ).live( 'pageshow',function(event){
    $(function() {
	//setMap(currentLocation);
        // initialize();
    })
})

$('#add-destination-button').click(
    function(){
	$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false });
    })

$("form[name='searchForm']").submit(function() {
    //$("form[name='search-form']").valid();
    var geocoder = new google.maps.Geocoder();
   geocoder.geocode({'address': $('#SearchField').val()},function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				$('#SearchField').val(results[0].formatted_address);
				map.panTo(results[0].geometry.location);
				map.setZoom(13);
//				currentLocation.LatLng = 
//				setMap(currentLocation.LatLng);
				$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
			} else {
				alert("geocode not successful: " + status);
			}});
   return false;
});
