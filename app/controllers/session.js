//GLOBALS
var APP = require("core"),
	SESS = require("sess"),
	PUTOUT = require("putout");
var epoch = (new Date).getTime();
var CONFIG = arguments[0] || {},
authURL = 'https://api.put.io/v2/oauth2/authenticate?client_id=' + Alloy.CFG.client_id + '&response_type=token&redirect_uri=' + Alloy.CFG.redirect_uri + '&' + epoch,
	loginURL = 'https://api.put.io/v2/oauth2/login?' + epoch;

Ti.API.info('[qk]:authURL\ = ' + authURL);
Ti.API.info('[qk]:loginURL\ = ' + loginURL);

//EVENTS
$.content.addEventListener("load", function(e) {
	scanForAuth();
});

$.instructions.addEventListener("click", function(e) {
	$.content.url = authURL;
});

//FUNCTIONS
var init = function() {
	APP.log("debug", "session | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");
	Alloy.Globals.slideOn = false;

	if(CONFIG.mode == "logout") {
		SESS.kill();
	}

	$.content.url = 'https://api.put.io/v2/oauth2/authenticate?client_id=' + Alloy.CFG.client_id + '&response_type=token&redirect_uri=' + Alloy.CFG.redirect_uri;

	/*
	setTimeout(function() {
		var warningRead = Ti.App.Properties.getString("warningRead");
		Ti.API.info('[qk]:warningRead\ = ' + warningRead);
		if(!warningRead) {
			Ti.API.info('show warning');
			APP.addChild("warning");
		} else {
			Ti.API.info('skip warning');
		}
	}, 250);
*/

};

var scanForAuth = function() {
	var targetUrl = $.content.url;

	Ti.API.info('[qk]:targetUrl\ = ' + targetUrl);

	if(targetUrl.substr(0, 19) == "http://firstsnow.co") {
		var token = targetUrl.replace(Alloy.CFG.redirect_uri + "#access_token=", "");
		Alloy.Globals.slideOn = true;
		SESS.save(token);
		APP.removeChild();
		Ti.App.fireEvent("getInfo");
		PUTOUT.loadMenu();
	} else {
		Ti.API.info('NO TOKEN');

		if($.content.url.search(loginURL.substr(0, 34)) != -1) {
			$.instructionText.text = "Scroll down to login.";
			$.content.evalJS('window.scrollTo(0,100);');
		} else {
			$.instructionText.text = "Click here to login.";
		}

	}

};

init();