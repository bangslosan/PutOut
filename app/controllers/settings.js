/**
 * Controller for the settings screen
 *
 * @class Controllers.settings
 * @uses core
 */
var APP = require("core");
var PUTOUT = require("putout");
var SESS = require("sess");
var CONFIG = arguments[0] || {};

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "settings.init");

	if(!PUTOUT.isDemo()) {
		$.advanced.visible = true;
		$.homeUrl.value = Ti.App.Properties.getString('homeUrl');
		$.tpbUrl.value = Ti.App.Properties.getString('tpbUrl');
	}

	if(!APP.LEGAL.TOS && !APP.LEGAL.PRIVACY) {
		$.container.remove($.legal_table);
	} else if(!APP.LEGAL.TOS || !APP.LEGAL.PRIVACY) {
		if(!APP.LEGAL.TOS) {
			$.legal_table.deleteRow(0);
		}

		if(!APP.LEGAL.PRIVACY) {
			$.legal_table.deleteRow(1);
		}

		$.legal_table.height = "45dp";
	}

	if(!Ti.UI.createEmailDialog().isSupported) {
		$.container.remove($.logs_table);
	}

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

// Event listeners
$.terms.addEventListener("click", function(_event) {
	APP.log("debug", "settings @terms");

	APP.addChild("settings_legal", {
		title: "Terms of Service",
		url: "/local/terms.html"
	});
});

$.privacy.addEventListener("click", function(_event) {
	APP.log("debug", "settings @privacy");

	APP.addChild("settings_legal", {
		title: "Privacy Policy",
		url: "/local/privacy.html"
	});
});

$.logs.addEventListener("click", function(_event) {
	APP.log("debug", "settings @logs");

	APP.logSend();
});

$.save.addEventListener("click", function(e) {
	Ti.App.Properties.setString('homeUrl', $.homeUrl.value);
	Ti.App.Properties.setString('tpbUrl', $.tpbUrl.value);

	Alloy.createWidget("com.mcongrove.toast", null, {
		text: "Settings saved!",
		duration: 2000,
		view: APP.GlobalWrapper
	});
});

$.logout.addEventListener("click", function(e) {
	SESS.kill();

});

// Kick off the init
$.init();