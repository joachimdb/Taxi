$( '#add-destination-popup' ).live( 'pageshow',function(event){
    $(function() {
	  var centerOfMap = map.getCenter();
	  var lat = centerOfMap.lat();
	  $('#Lat').val(lat);
	  var lng = centerOfMap.lng();
	  $('#Lng').val(lng);
	  
	  var geocoder = new google.maps.Geocoder();
	  geocoder.geocode({'latLng': new google.maps.LatLng(lat,lng)},function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				$('#Address').val(results[0].formatted_address);
				$('#Name').val(results[1].formatted_address);
			} else {
				alert("Reverse geocode not successful: " + status);
				$('#Address').val("Enter Address");
				$('#Name').val("Enter Name");
			}})
    })
})

$("form[name='add-destination-form']").submit(function() {
    // alert("pressed save");
    $("form[name='add-destination-form']").valid();
    if ($("form[name='add-destination-form']").validate().numberOfInvalids()==0) {
	$.post("/new-location", $("form[name='add-destination-form']").serializeArray(), function(data){
		var lat = $('#Lat').val();
		var lng = $('#Lng').val();
		addMarker(data.id,lat,lng,map);
		
		var address = $('#Address').val();
		$('#SearchField').val(address);

		$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
	})
    } 
    return false;
});

$('#cancel-add-button').click(
    function(){
        $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

