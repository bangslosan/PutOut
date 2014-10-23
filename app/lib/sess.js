var APP = require("core");

exports.save = function(token) {
	var session = {
		token: token
	};
	Ti.App.Properties.setObject("session", session);
	Alloy.Globals.session = session;
};

exports.get = function() {
	var session = Ti.App.Properties.getObject("session");
	//offline debug
	/*session = {
	token: "fake"
	};*/
	//session = null;
	Alloy.Globals.session = session;
	return session;
};

exports.kill = function() {
	var session = null;
	Ti.App.Properties.setObject("session", session);
	Alloy.Globals.session = session;
	if(OS_ANDROID) {
		Ti.Network.removeAllSystemCookies();
	}

	var client = Ti.Network.createHTTPClient();
	client.clearCookies("http://put.io");
	client.clearCookies("https://put.io");

	APP.removeAllChildren();
	APP.addChild("session", {
		mode: "login"
	});
};