$('#plan_trip_page').live('pageshow',function(event){
    $(function() {
    	alert("plan page init");
    });
})

$('#cancel_plan_trip_button').click(
    function(){
    	$.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
    });

