$('#plan_trip-page').live('pageshow',function(event){
    $(function() {
    	alert("plan page init");
    });
})

$('#cancel-plan_trip-button').click(
    function(){
    	$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

