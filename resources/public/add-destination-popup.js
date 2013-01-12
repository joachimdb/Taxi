
$( '#add-destination-popup' ).live( 'pageshow',function(event){
    $(function() {
    	//$('#delete-destination-button').hide();    	
    });
});

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

$('#start-navigation-button').click(
		function(){
			var now=new Date();
			$.mobile.changePage($("#navigation-page"), { transition: "pop", role: "page", reverse: false } );
		});

$('#start_plan_trip_button').click(
		function(){
			$("form[name='plan-trip-form'] input[name='address_from']").val(currentLocation.Address);
			$("form[name='plan-trip-form'] input[name='Lat_from']").val(currentLocation.LatLng.lat());
			$("form[name='plan-trip-form'] input[name='Lng_from']").val(currentLocation.LatLng.lng());			
			$("form[name='plan-trip-form'] input[name='id_to']").val($("form[name='add-destination-form'] input[name='id']").val());
			$("form[name='plan-trip-form'] input[name='address_to']").val($("form[name='add-destination-form'] input[name='Address']").val());
			$("form[name='plan-trip-form'] input[name='Lat_to']").val($("form[name='add-destination-form'] input[name='Lat']").val());
			$("form[name='plan-trip-form'] input[name='Lng_to']").val($("form[name='add-destination-form'] input[name='Lng']").val());
			$.mobile.changePage($("#plan_trip_page"), { transition: "slide", role: "dialog", reverse: false } );
		});


$('#delete-destination-button').click(
	    function(){	
		  $.post("/delete-location", $("form[name='add-destination-form']").serializeArray(), function(){
		    var ID = $("form[name='add-destination-form'] input[name='id']").val();
		    deleteMarker(ID);
	            $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
		});
		return false;
	    })
	    
$('#cancel-add-button').click(
		function(){
			$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
		});
