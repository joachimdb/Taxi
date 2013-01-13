var fromList = $("#suggestions_from");

$( '#plan_trip_page' ).live( 'pageshow',function(event){
    $(function() {
    	fromList.html("");
    	fromList.listview("refresh");
    })
})

$("#address_from").on("input", function(e) {
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

$("form[name='plan-trip-form']").submit(function() {
	$("form[name='plan-trip-form']").valid();
	if ($("form[name='plan-trip-form']").validate().numberOfInvalids()==0) {
		$.post("/new-trip", $("form[name='plan-trip-form']").serializeArray(), function(data){
			$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
		});
	}
});

$(document).on("click", '[id^=fromItem]', function(event, ui) {
	fromList.html("");
	fromList.listview("refresh");
	$("form[name='plan-trip-form'] input[name='address_from']").val($(this).attr('address'));
	$("form[name='plan-trip-form'] input[name='Lat_from']").val($(this).attr('lat'));
	$("form[name='plan-trip-form'] input[name='Lng_from']").val($(this).attr('lng'));
});	

$('#cancel-plan-trip-button').click(
    function(){
    	$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

