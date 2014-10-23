/**
 * Controller for the settings legal screen
 *
 * @class Controllers.settings.legal
 * @uses core
 */
var APP = require("core");
var CONFIG = arguments[0] || {};

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "settings_legal.init | " + JSON.stringify(CONFIG));

	$.content.url = CONFIG.url;
	$.content.scalesPageToFit = true;
	$.content.willHandleTouches = false;

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");
	$.NavigationBar.setTitle(CONFIG.title);

	$.NavigationBar.showBack(function(_event) {
		APP.removeChild();
	});

};

// Kick off the init
$.init();