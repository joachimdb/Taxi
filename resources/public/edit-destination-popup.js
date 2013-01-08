
$("form[name='edit-destination-form']").submit(function() {
    alert("pressed save");
    $("form[name='edit-destination-form']").valid();
    if ($("form[name='edit-destination-form']").validate().numberOfInvalids()==0) {
	    $.post("/new-location", $("form[name='edit-destination-form']").serializeArray(), function(data){
	    $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
	})
    } 
    return false;
});

// $('#cancel-edit-button').click(
//     function(){
//         $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
//     });

$('#start-navigation-button').click(
    function(){
        $.mobile.changePage($("#navigation-page"), { transition: "pop", role: "page", reverse: false } );
    });

$('#delete-destination-button').click(
    function(){	
	  $.post("/delete-location", $("form[name='edit-destination-form']").serializeArray(), function(){
	    var ID = $("form[name='edit-destination-form'] input[name='id']").val();
	    deleteMarker(ID);
            $.mobile.changePage($("#destination-page"), { transition: "pop", role: "page", reverse: false } );
	});
	return false;
    })
