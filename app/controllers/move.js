//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};
var parent_id = CONFIG.target || 0;
var showMenu = CONFIG.showMenu || 0;
var targetRow = 0;

//EVENTS
$.Wrapper.addEventListener("focus", function(e) {
	Ti.API.info('View Focused.');
	getFiles(0);
});

$.tv.addEventListener("click", function(e) {
	clickHandler(e);
});

$.cancel.addEventListener("click", function(e) {
	APP.removeAllChildren();
});

$.go.addEventListener("click", function(e) {
	doMove(CONFIG.row.id, parent_id);
});

//FUNCTIONS
var init = function() {
	APP.log("debug", "move | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(parent_id && !showMenu) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	} else {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	}

	$.NavigationBar.showRight({
		image: "reload",
		callback: function() {
			getFiles(parent_id);
		}
	});

	//if(Alloy.Globals.session != null) {
	getFiles(parent_id);
	//}
};

var doMove = function(file_id, parent_id) {
	APP.openLoading();
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/move?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			//refresh files
			//getFiles(parent_id);
			//targetRow = 0;
			APP.closeLoading();
			APP.MainWindow.fireEvent("file_refresh");
			APP.removeAllChildren();
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
		file_ids: file_id,
		parent_id: parent_id
	});
};

var showError = function() {
	var dialog = Ti.UI.createAlertDialog({
		cancel: 0,
		buttonNames: ['OK'],
		message: 'Ran into an error trying to do that. Could be a fluke. I say you should give it another go.',
		title: 'Oops'
	});

	dialog.show();
};

var getFiles = function(parent_id) {
	APP.openLoading();
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/list?parent_id=" + parent_id + "&oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {

			//create rows from file results
			var rows = [],
				trueCount = 0;

			for(var i = 0; i < json.files.length; i++) {

				if(json.files[i].content_type == "application/x-directory") {

					if(trueCount % 2 == 0) {
						var backgroundColor = "#549dcc";
					} else {
						var backgroundColor = "#59ade2";
					}

					var row = Ti.UI.createTableViewRow({
						layout: "vertical",
						hasChild: true,
						id: json.files[i].id,
						content_type: json.files[i].content_type,
						is_mp4_available: json.files[i].is_mp4_available,
						allData: json.files[i],
						backgroundColor: backgroundColor,
						name: json.files[i].name
					}),
						image = Ti.UI.createImageView({
							left: "10dp",
							top: "10dp",
							right: "10dp",
							bottom: "10dp",
							image: json.files[i].icon,
							width: "30dp",
							height: "30dp"
						}),
						spacer = Ti.UI.createView({
							width: Ti.UI.FILL,
							height: "10dp"
						}),
						container = Ti.UI.createView({
							layout: "horizontal",
							width: Ti.UI.FILL,
							height: Ti.UI.SIZE
						}),
						name = Ti.UI.createLabel({
							text: json.files[i].name,
							right: "20dp",
							color: "#ffffff",
							font: {
								fontWeight: "bold",
								fontFamily: Alloy.Globals.customFont1
							}
						});
					container.add(image);
					container.add(name);
					row.add(spacer);
					row.add(container);
					row.add(spacer);
					rows.push(row);
					trueCount++;
				}
			}

			$.tv.setData(rows);

			APP.closeLoading();

		} else {
			APP.closeLoading();
			alert("Error getting files. Please try again.");
		}
	};

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	};

	request.open("GET", url);
	request.send();
};

var clickHandler = function(e) {

	if(e.row.content_type == "application/x-directory") {
		APP.addChild("move", {
			target: e.row.id,
			row: CONFIG.row
		});
	}
};

//BOOTSTRAP
init();