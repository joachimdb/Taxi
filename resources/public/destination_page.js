var sugList = $("#suggestions");

$( '#destination_page' ).live( 'pageshow',function(event){
    $(function() {
    	sugList.html("");
    	sugList.listview("refresh");
   });
});

$("#searchField").on("input", function(e) {
	var text = $(this).val();
	if(text.length < 1) {
		sugList.html("");
		sugList.listview("refresh");
	} else {
		geocoder.geocode({'address': text},function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var htmlStr = "";
				for(var i=0, len=results.length; i<len; i++) {
					htmlStr += "<li\><a id=\"searchResultItem-"+i+"\" result=\""+results[i].formatted_address+"\"\>"+results[i].formatted_address+"</a></li>";
				}
				sugList.html(htmlStr);
				sugList.listview("refresh");
			} else {
				sugList.html("");
				sugList.listview("refresh");
			}});
	}
});

$(document).on("click", '[id^=searchResultItem]', function(event, ui) {
	$("form[name='search_form'] input[name='searchField']").val($(this).attr('result'));
	$("form[name='search_form']").submit();
});	

$("form[name='search_form']").submit(function() {
	geocoder.geocode({'address': $('#searchField').val()},function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
    		$('#searchField').val(results[0].formatted_address);
    	    var latlng = results[0].geometry.location;
    	    map.panTo(latlng);
    	    // map.setZoom(13);
    	    $("form[name='plan_trip_form'] input[name='addressFrom']").val(currentLocation.Address);
    	    $("form[name='plan_trip_form'] input[name='latFrom']").val(currentLocation.latlng.lat());
    	    $("form[name='plan_trip_form'] input[name='lngFrom']").val(currentLocation.latlng.lng());			
    	    $("form[name='plan_trip_form'] input[name='addressTo']").val(results[0].formatted_address);
    	    $("form[name='plan_trip_form'] input[name='latTo']").val(latlng.lat());
    	    $("form[name='plan_trip_form'] input[name='lngTo']").val(latlng.lng());
	} else {
	    alert("geocode not successful: " + status);
	}
    $.mobile.changePage($("#plan_trip_page"), { transition: "pop", role: "dialog", reverse: false } );
    });	
    return false;
});
