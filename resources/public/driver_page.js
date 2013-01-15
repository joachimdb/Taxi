var locationSender = null;
var locationID = 1;

function sendLocation() {
	alert("Sending location, round ".concat((locationID++).toString()));
}

$("#btn").attr("select", "false");

$("#btn").bind("click", function(event) {
	var selected = $(this).attr("select");
	if (selected == "true") {
		$(this).attr("select", "false");
		$(this).find(".ui-icon").hide();
		$(this).find(".ui-btn-text").text("Not available");
		$(this).buttonMarkup({
			theme : 'd'
		});

		if (locationSender == null) {
			throw "unexpected state locationSender == null";
		}
		clearInterval(locationSender);
		locationSender = null;
	} else {
		$(this).attr("select", "true");
		$(this).find(".ui-icon").show();
		$(this).find(".ui-btn-text").text("Available");
		$(this).buttonMarkup({
			theme : 'e'
		});

		if (locationSender != null) {
			throw "unexpected state locationSender != null";
		}
		locationSender = setInterval(sendLocation, 3000);
	}
});
