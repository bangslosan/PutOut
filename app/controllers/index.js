/**
 * Main application controller
 *
 * **NOTE: This controller is opened first upon application start and
 * initializes the core application code (`APP.init`). This controller
 * also sets UI elements to global scope for easy access.**
 *
 * @class Controllers.index
 * @uses core
 */

// Pull in the core APP singleton
var APP = require("core"),
	SESS = require("sess"),
	moment = require("alloy/moment");
//PUTOUT = require("putout");

APP.openLoading();

//var now = moment().format("YYYYMM");

var init = function() {

	if(!Ti.Network.online) {
		alert("You aren't connected to the Internet. You will not be able to login or otherwise use this app until you connect to the Internet.");
	}

	if(OS_IOS) {
		Alloy.Globals.customFont1 = "Proxima Nova";
	} else if(OS_ANDROID) {
		Alloy.Globals.customFont1 = "ProximaNova-Regular";
	}

	var session = SESS.get();

	APP.oNodes = APP.Nodes.slice(0);

	Alloy.Globals.slideOn = true;

	if(session == null) {
		APP.addChild("session", {
			mode: "login"
		});
	} else {
		//PUTOUT.loadMenu();
	}

	if(!Ti.App.Properties.getString('homeUrl')) {
		Ti.App.Properties.setString('homeUrl', "http://www.publicdomaintorrents.info/");
	}

	if(!Ti.App.Properties.getString('tpbUrl')) {
		Ti.App.Properties.setString('tpbUrl', "thepiratebay.se");
	}

	if(!Ti.App.Properties.getString("filter")) {
		Ti.App.Properties.setString("filter", "0");
	}

	if(!Ti.App.Properties.getString("order")) {
		Ti.App.Properties.setString("order", "7");
	}

};

//if(now > 201404) {
//	alert("This dev build has expired.");
//} else {
// Make sure we always have a reference to global elements throughout the APP singleton
APP.MainWindow = $.MainWindow;
APP.GlobalWrapper = $.GlobalWrapper;
APP.ContentWrapper = $.ContentWrapper;
APP.Tabs = $.Tabs;
APP.SlideMenu = $.SlideMenu;

// Start the APP
APP.init();
init();
//}