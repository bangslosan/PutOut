var APP = require("core");
var CONFIG = arguments[0] || {};

APP.log("debug", "text | " + JSON.stringify(CONFIG));

$.heading.text = CONFIG.heading;
$.text.text = CONFIG.text;

$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

if(CONFIG.isChild === true) {
	$.NavigationBar.showBack(function(_event) {
		APP.removeChild();
	});
} else {
	$.NavigationBar.showMenu(function(_event) {
		APP.toggleMenu();
	});
}