//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};

//EVENTS
$.go.addEventListener("click", function(e) {
	Ti.App.Properties.setString("warningRead", "true");
	APP.removeChild();
});

//FUNCTIONS
var init = function() {
	APP.log("debug", "warning | " + JSON.stringify(CONFIG));
	APP.swipeEnabled = false;
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");
};

init();