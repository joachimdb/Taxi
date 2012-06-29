
$( '#location-page' ).live( 'pageshow',function(event){
    $(function() {
	//setMap(currentLocation);
        // initialize();
    })
})

$('#add-location').click(
    function(){
	$.mobile.changePage($("#add-location-page"), { transition: "pop", role: "dialog", reverse: false });
    })

