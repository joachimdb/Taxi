
$( '#destination-page' ).live( 'pageshow',function(event){
    $(function() {
	//setMap(currentLocation);
        // initialize();
    })
})

$('#add-destination-button').click(
    function(){
	$.mobile.changePage($("#add-destination-popup"), { transition: "pop", role: "dialog", reverse: false });
    })

