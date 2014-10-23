//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};

//EVENTS
$.go.addEventListener("click", function(e) {
	createFolder();
});

//FUNCTIONS
var init = function() {
	APP.log("debug", "audio | " + JSON.stringify(CONFIG));
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

var createFolder = function() {
	APP.openLoading();
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/create-folder?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			APP.closeLoading();
			APP.MainWindow.fireEvent("file_refresh");
			APP.removeChild();
		}
	};

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	};

	request.open("POST", url);
	request.send({
		parent_id: CONFIG.parent_id,
		name: $.folder.value
	});
};

init();