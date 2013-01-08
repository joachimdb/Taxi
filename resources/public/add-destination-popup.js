$( '#add-destination-popup' ).live( 'pageshow',function(event){
    $(function() {
	  var centerOfMap = map.getCenter();
	  $('#Lat').val(centerOfMap.lat());
	  $('#Lng').val(centerOfMap.lng());
	  $('#Name').val("Enter Name");
    })
})


$("form[name='add-destination-form']").submit(function() {
    // alert("pressed save");
    $("form[name='add-destination-form']").valid();
    if ($("form[name='add-destination-form']").validate().numberOfInvalids()==0) {
	$.post("/new-location", $("form[name='add-destination-form']").serializeArray(), function(data){
		addMarker(data.id,$('#Lat').val(),$('#Lng').val(),map);
	    $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
	})
    } 
    return false;
});

$('#cancel-add-button').click(
    function(){
        $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

