var APP = require("core");
var CONFIG = arguments[0] || {};

var init = function() {
	APP.log("debug", "files | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");
	APP.closeLoading();
	if(OS_IOS) {
		$.NavigationBar.showBack(closeVideo);
		$.content.allowsAirPlay = true;
		$.content.url = CONFIG.url;
		Ti.API.info('[qk]:CONFIG.url\ = ' + CONFIG.url);
	} else if(OS_ANDROID) {
		var content = Ti.Media.createVideoPlayer({
			url: CONFIG.url,
			autoplay: true
		});
		var win = Ti.UI.createWindow({
			fullscreen: true,
			navBarHidden: true
		});
		var loader = Ti.UI.createLabel({
			text: "Loading video ",
			font: {
				fontSize: "18dp",
				fontWeight: "bold",
				fontFamily: Alloy.Globals.customFont1
			},
			zIndex: 500
		});
		var counter = 0;
		var loading = setInterval(function() {
			if(counter <= 3) {
				loader.text = loader.text + ".";
				counter++;
			} else {
				loader.text = "Loading video ";
				counter = 0;
			}
		}, 500);

		win.add(content);
		win.add(loader);

		content.addEventListener("loadstate", function(e) {
			if(e.loadState == 1) {
				win.remove(loader);
				clearInterval(loading);
			}
		});

		win.open();
		setTimeout(function() {
			APP.removeChild();
		}, 250);
	}
};

var closeVideo = function() {
	$.content.stop();
	APP.removeChild();
};

init();