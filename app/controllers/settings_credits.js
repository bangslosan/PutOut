/**
 * Controller for the settings credits screen
 * 
 * @class Controllers.settings.credits
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0] || {};

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "settings_credits.init");

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

};

// Kick off the init
$.init();