$( '#destination-page' ).live( 'pageshow',function(event){
    $(function() {
	//setMap(currentLocation);
        // initialize();
    })
})

$("form[name='searchForm']").submit(function() {
    $('#delete-destination-button').hide();
    geocoder.geocode({'address': $('#SearchField').val()},function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
    		$('#SearchField').val(results[0].formatted_address);
    		var latlng = results[0].geometry.location;
    		map.panTo(latlng);
    		map.setZoom(13);
    	    $("form[name='add-destination-form'] input[name='Lat']").val(latlng.lat());
    		$("form[name='add-destination-form'] input[name='Lng']").val(latlng.lng());
			$("form[name='add-destination-form'] input[name='Address']").val(results[0].formatted_address);
			$("form[name='add-destination-form'] input[name='Name']").val("Enter name...");
		} else {
			alert("geocode not successful: " + status);
		}
		$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false } );
	});	
	return false;
});
