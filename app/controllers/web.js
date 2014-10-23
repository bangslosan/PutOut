//GLOBALS
var APP = require("core");
var UTIL = require("utilities");
var CONFIG = arguments[0] || {};
var optionsOpen = false;

//FUNCTIONS
var init = function() {
	APP.log("debug", "files | " + JSON.stringify(CONFIG));
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

	$.content.scalesPageToFit = true;
	$.content.url = Ti.App.Properties.getString('homeUrl');
};

var hideOptions = function() {
	var targets = $.options.children;
	for(var i = 0; i < targets.length; i++) {
		Ti.API.info('[qk]:targets[i]\ = ' + targets[i]);
		targets[i].visible = false;
	}
};

var toggleOption = function(mode) {
	if(optionsOpen) {
		closeOptions(mode);
	} else {
		openOptions(mode);
	}
};

var openOptions = function(mode) {
	hideOptions();
	if(mode == "location") {
		var topValue = "150dp";
		$.location.visible = true;
	} else if(mode == "detect") {
		var topValue = "100dp";
		$.detect.visible = true;
	}

	$.webWrapper.animate({
		top: topValue,
		duration: 250,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});

	optionsOpen = true;

	Ti.API.info("Inspecting Object: " + $.location);
	for(var thing in $.location) {
		Ti.API.info("$.location." + thing + " = " + $.location[thing]);
	}

	Ti.API.info("Inspecting Object: " + $.detect);
	for(var thing in $.detect) {
		Ti.API.info("$.detect." + thing + " = " + $.detect[thing]);
	}

};

var closeOptions = function(mode) {
	$.webWrapper.animate({
		top: "0dp",
		duration: 250,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});

	optionsOpen = false;
};

var onLoad = function(e) {
	Ti.API.info('LOAD');

	setTimeout(function() {
		var magFound = scanForMagnets();
		if(!magFound) {
			scanForTorrents();
		}
	}, 1000);

	if($.content.canGoBack()) {
		$.containerBack.opacity = 1.0;
	} else {
		$.containerBack.opacity = 0.5;
	}

	if($.content.canGoForward()) {
		$.containerForward.opacity = 1.0;
	} else {
		$.containerForward.opacity = 0.5;
	}

	//$.containerStop.opacity = 0.5;
	$.containerRefresh.opacity = 1.0;
};

var gimmeGimme = function(target, type) {
	$.gottaHaveIt.targetURL = target;
	$.detect.text = type + " detected on page.";
	openOptions("detect");
};

var scanForMagnets = function() {
	var htmlData = $.content.html;
	var pattern = /magnet:\?xt=urn:[a-z0-9:&=+-/%;]*/gi;
	var magnet = htmlData.match(pattern);
	if(magnet != null) {
		Ti.API.info('Magent found.');
		gimmeGimme(magnet, "Magnet");
		return true;
	} else {
		Ti.API.info('No magnets.');
		return false;
	}
};

var scanForTorrents = function() {
	var htmlData = $.content.html;
	var pattern = /(http|https)\:\/\/[a-z0-9\:&=+-/%;?_]*(\.torrent)/gi;
	var torrent = htmlData.match(pattern);
	if(torrent != null) {
		Ti.API.info('Torrent found.');
		gimmeGimme(torrent, "Torrent");
		return true;
	} else {
		Ti.API.info('No torrents.');
		return false;
	}
};

//EVENTS
$.home.addEventListener("click", function(e) {
	var url = Ti.App.Properties.getString('homeUrl');
	$.content.url = url;
	closeOptions();
});

$.content.addEventListener("load", function(e) {
	onLoad(e);
});

$.containerBack.addEventListener("click", function(e) {
	$.content.goBack();
});

$.containerForward.addEventListener("click", function(e) {
	$.content.goForward();
});

$.containerRefresh.addEventListener("click", function(e) {
	$.content.reload();
	$.containerRefresh.opacity = 0.5;
});

$.containerSafari.addEventListener("click", function(e) {
	toggleOption("location");
});

$.containerDownload.addEventListener("click", function(e) {
	var magFound = scanForMagnets();
	if(!magFound) {
		magFound = scanForTorrents();
	}
	if(!magFound) {
		Alloy.createWidget("com.mcongrove.toast", null, {
			text: "No torrents detected!",
			duration: 2000,
			view: APP.GlobalWrapper
		});

	}
});

$.cancel.addEventListener("click", function(e) {
	closeOptions();
});

$.cancel2.addEventListener("click", function(e) {
	closeOptions();
});

$.gottaHaveIt.addEventListener("click", function(e) {
	var apiCall = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "transfers/add?oauth_token=" + Alloy.Globals.session.token,
		magnet = UTIL.htmlDecode($.gottaHaveIt.targetURL);

	apiCall.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		Ti.API.info('[qk]:url\ = ' + url);
		Ti.API.info('[qk]:magnet\ = ' + magnet);
		/*var dialog = Ti.UI.createAlertDialog({
			cancel: 0,
			buttonNames: ['OK'],
			message: 'Your torrent has been sent to Put.io and will be downloaded shortly.',
			title: 'Download in progress'
		});
		closeOptions();
		dialog.show();*/
		Alloy.createWidget("com.mcongrove.toast", null, {
			text: "Torrent sent to Put.io!",
			duration: 2000,
			view: APP.GlobalWrapper
		});

		APP.MainWindow.fireEvent("file_refresh");
	};

	apiCall.open("POST", url);
	apiCall.send({
		url: magnet
	});
});

$.go.addEventListener("click", function(e) {
	$.url.blur();
	var url = $.url.value;
	Ti.API.info('[qk]:url.substr(0,4)\ = ' + url.substr(0, 4));
	if(url.substr(0, 4) != "http") {
		url = "http://" + url;
	}
	closeOptions();
	$.content.setUrl(url);
});

init();