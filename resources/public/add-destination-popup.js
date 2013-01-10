
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

