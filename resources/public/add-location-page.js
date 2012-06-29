$( '#add-location-page' ).live( 'pageshow',function(event){
    $(function() {
	var centerOfMap = map.getCenter();
	$('#locationId').val(-1);
	$('#locationLat').val(centerOfMap.lat());
	$('#locationLng').val(centerOfMap.lng());
	$('#locationName').val("Enter Name");
    })
})


$("form[name='location-add-form']").submit(function() {
    // alert("pressed save");
    $("form[name='location-add-form']").valid();
    if ($("form[name='location-add-form']").validate().numberOfInvalids()==0) {
	$.post("/location", $("form[name='location-add-form']").serializeArray(), function(data){
	    addMarker(data.storeId,$('#locationLat').val(),$('#locationLng').val(),map);
	    //showMarker(data.storeId);
	    $.mobile.changePage($("#location-page"), { transition: "pop", role: "page", reverse: false } );
	})
    } 
    return false;
});

$('#cancel-add').click(
    function(){
        $.mobile.changePage($("#location-page"), { transition: "pop", role: "page", reverse: false } );
    });

