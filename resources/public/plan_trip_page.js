var fromList = $("#suggestions_from");

$( '#plan_trip_page' ).live( 'pageshow',function(event){
    $(function() {
    	fromList.html("");
    	fromList.listview("refresh")
    })
})

$("#addressFrom").on("input", function(e) {
	var text = $(this).val();
	if(text.length < 1) {
		fromList.html("");
		fromList.listview("refresh");
	} else {
		geocoder.geocode({'address': text},function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
	    		var htmlStr = "";
	    		for(var i=0, len=results.length; i<len; i++) {
	    			var address=results[i].formatted_address;
	    			var lat=results[i].geometry.location.lat();
	    			var lng=results[i].geometry.location.lng();
	    			htmlStr += "<li\><a id=\"fromItem-"+i+"\" lng=\""+lng+"\" lat=\""+lat+"\" address="+address+"\"\>"+address+"</a></li>";
	    		}
	    		fromList.html(htmlStr);
	    		fromList.listview("refresh");
			} else {
				fromList.html("");
				fromList.listview("refresh");
			}});
	}
});

$("form[name='plan_trip_form']").submit(function() {
	$("form[name='plan_trip_form'] input[name='mode']").val("offering");
	$("form[name='plan_trip_form']").valid();
	if ($("form[name='plan_trip_form']").validate().numberOfInvalids()==0) {
		$.post("/new_trip", $("form[name='plan_trip_form']").serializeArray(), function(data){
			addMarker(data.id,data.latTo,data.lngTo,map);
			$.mobile.changePage($("#destination_page"), { transition: "pop", role: "page", reverse: false } );
		});
	}
});

$(document).on("click", '[id^=fromItem]', function(event, ui) {
	fromList.html("");
	fromList.listview("refresh");
	$("form[name='plan_trip_form'] input[name='addressFrom']").val($(this).attr('address'));
	$("form[name='plan_trip_form'] input[name='latFrom']").val($(this).attr('lat'));
	$("form[name='plan_trip_form'] input[name='lngFrom']").val($(this).attr('lng'));
});	

$('#search_ride_button').click(function(){
	$("form[name='plan_trip_form'] input[name='mode']").val("searching");
	$("form[name='plan_trip_form']").valid();
	if ($("form[name='plan_trip_form']").validate().numberOfInvalids()==0) {
		$.post("/new_trip", $("form[name='plan_trip_form']").serializeArray(), function(data){
			addMarker(data.id,data.latTo,data.lngTo,map);
			$.mobile.changePage($("#destination_page"), { transition: "pop", role: "page", reverse: false } );
		});
	}});


$('#cancel_plan_trip_button').click(
    function(){
    	$.mobile.changePage($("#destination_page"), { transition: "pop", role: "page", reverse: false } );
    });

