var sugList = $("#suggestions");

$( '#destination-page' ).live( 'pageshow',function(event){
    $(function() {
    	sugList.html("");
    	sugList.listview("refresh");
    	
	//setMap(currentLocation);
        // initialize();
    })
})

$("#SearchField").on("input", function(e) {
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
	// How do I get to the result?
	$("form[name='searchForm'] input[name='SearchField']").val($(this).attr('result'));
	$("form[name='searchForm']").submit();
});	

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
			$("form[name='add-destination-form'] input[name='Description']").val("Enter description ...");
		} else {
			alert("geocode not successful: " + status);
		}
		$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false } );
	});	
	return false;
});
