//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};

//FUNCTIONS

var init = function() {
	APP.log("debug", "tpb_options | " + JSON.stringify(CONFIG));
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
	setTimeout(function() {
		setCurrent();
	}, 250);
};

var resetUI = function() {
	$.search.width = Ti.Platform.displayCaps.platformWidth - 120;
};

var setCurrent = function() {
	var filter = Ti.App.Properties.getString("filter");
	var order = Ti.App.Properties.getString("order");

	Ti.API.info('[qk]:filter\ = ' + filter);
	Ti.API.info('[qk]:order\ = ' + order);

	switch(order) {
		case "1":
			$.orderBy.setSelectedRow(0, 4, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "2":
			$.orderBy.setSelectedRow(0, 4, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		case "3":
			$.orderBy.setSelectedRow(0, 3, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "4":
			$.orderBy.setSelectedRow(0, 3, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		case "5":
			$.orderBy.setSelectedRow(0, 2, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "6":
			$.orderBy.setSelectedRow(0, 2, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		case "7":
			$.orderBy.setSelectedRow(0, 0, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "8":
			$.orderBy.setSelectedRow(0, 0, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		case "9":
			$.orderBy.setSelectedRow(0, 1, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "10":
			$.orderBy.setSelectedRow(0, 1, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		case "13":
			$.orderBy.setSelectedRow(0, 5, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
		case "14":
			$.orderBy.setSelectedRow(0, 5, true);
			$.orderBy.setSelectedRow(1, 0, true);
			break;
		default:
			$.orderBy.setSelectedRow(0, 0, true);
			$.orderBy.setSelectedRow(1, 1, true);
			break;
	}

	switch(filter) {
		case "0":
			$.filterBy.setSelectedRow(0, 0);
			break;
		case "100":
			$.filterBy.setSelectedRow(0, 1);
			break;
		case "200":
			$.filterBy.setSelectedRow(0, 2);
			break;
		case "300":
			$.filterBy.setSelectedRow(0, 3);
			break;
		case "400":
			$.filterBy.setSelectedRow(0, 4);
			break;
		case "600":
			$.filterBy.setSelectedRow(0, 5);
			break;
		default:
			$.filterBy.setSelectedRow(0, 0);
			break;
	}

};

//EVENTS
$.save.addEventListener("click", function(e) {
	var orderBy = $.orderBy.getSelectedRow(0);
	var orderDirection = $.orderBy.getSelectedRow(1);
	var filterBy = $.filterBy.getSelectedRow(0);

	Ti.API.info('[qk]:orderBy.title\ = ' + orderBy.title);
	Ti.API.info('[qk]:orderDirection.title\ = ' + orderDirection.title);

	switch(orderBy.title) {
		case "Seeds":
			if(orderDirection.title == "Ascending") {
				var order = "8";
			} else {
				var order = "7";
			}
			break;
		case "Leechers":
			if(orderDirection.title == "Ascending") {
				var order = "10";
			} else {
				var order = "9";
			}
			break;
		case "Size":
			if(orderDirection.title == "Ascending") {
				var order = "6";
			} else {
				var order = "5";
			}
			break;
		case "Uploaded":
			if(orderDirection.title == "Ascending") {
				var order = "4";
			} else {
				var order = "3";
			}
			break;
		case "Name":
			if(orderDirection.title == "Ascending") {
				var order = "2";
			} else {
				var order = "1";
			}
			break;
		case "Type":
			if(orderDirection.title == "Ascending") {
				var order = "14";
			} else {
				var order = "13";
			}
			break;
		default:
			var order = "0";
			break;
	}

	switch(filterBy.title) {
		case "Show All":
			var filter = "0";
			break;
		case "Audio":
			var filter = "100";
			break;
		case "Video":
			var filter = "200";
			break;
		case "Applications":
			var filter = "300";
			break;
		case "Games":
			var filter = "400";
			break;
		case "Other":
			var filter = "600";
			break;
		default:
			var filter = "0";
			break;
	}

	Ti.API.info('[qk]:filter\ = ' + filter);
	Ti.API.info('[qk]:order\ = ' + order);

	Ti.App.Properties.setString("filter", filter);
	Ti.App.Properties.setString("order", order);

	APP.removeChild();

});

Ti.App.addEventListener("APP:orientationChange", function(e) {
	resetUI();
});

//BOOTSTRAP
init();