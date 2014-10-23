var APP = require("core");
var keepRunning = true;
var targetRow = 0;
var CONFIG = arguments[0] || {};

var init = function() {
	APP.log("debug", "transfers.init");
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

	$.NavigationBar.showRight({
		image: "/icons/white/glyphicons_081_refresh.png",
		callback: function() {
			getTransfers(true);
		}
	});

	//testing();
	getTransfers(true);
	reinit();
};

var reinit = function() {
	if(keepRunning) {
		getTransfers(true);
	}

	/*Alloy.Globals.interval = setInterval(function() {
		if(keepRunning) {
			getTransfers(false);
		}
	}, 5000);*/

};

var clearRefresh = function() {
	clearInterval(Alloy.Globals.interval);
};

var testing = function() {
	//temp no wifi
	var temp = '{
			  "status": "OK",
			  "transfers": [
			    {
			      "uploaded": 0,
			      "estimated_time": 5,
			      "peers_getting_from_us": 0,
			      "extract": false,
			      "current_ratio": 0.00,
			      "size": 9409268,
			      "up_speed": 0,
			      "id": 2293761,
			      "source": "magnet:?xt=urn:btih:194a4c341487fd12d36718054c1e8fef4358b2ab3",
			      "subscription_id": null,
			      "status_message": "\u2193 1.2 MB/s, \u2191 0.0 bytes/s | connected to 36 peers, sending to 0 peers | dl: 2.9 MB / 9.0 MB, ul: 0.0 bytes",
			      "status": "DOWNLOADING",
			      "down_speed": 1249337,
			      "peers_connected": 36,
			      "downloaded": 2999431,
			      "file_id": null,
			      "peers_sending_to_us": 22,
			      "percent_done": 30,
			      "tracker_message": null,
			      "name": "A video",
			      "created_at": "2012-03-28T09:14:17",
			      "error_message": null,
			      "save_parent_id": 0
			    },
			    {
			      "uploaded": 0,
			      "estimated_time": null,
			      "peers_getting_from_us": 0,
			      "extract": false,
			      "current_ratio": 0.00,
			      "size": null,
			      "up_speed": 0,
			      "is_seeding": false,
			      "id": 63,
			      "subscription_id": null,
			      "status_message": "In queue",
			      "status": "IN_QUEUE",
			      "down_speed": 0,
			      "peers_connected": 0,
			      "downloaded": 0,
			      "file_id": null,
			      "peers_sending_to_us": 0,
			      "percent_done": 65,
			      "tracker_message": null,
			      "name": "Another video",
			      "created_at": "2012-03-23T05:56:30",
			      "error_message": null,
			      "save_parent_id": 46
			    }
			  ]
			}';

	var data = JSON.parse(temp),
		rows = [];

	for(var i = 0; i < data.transfers.length; i++) {
		var row = parseRow(data.transfers[i], i);
		rows.push(row);
	}

	$.content.setData(rows);

	//end temp no wifi
};

var getTransfers = function(showLoading) {
	Ti.API.info('GETTING TRANSFERS');
	if(showLoading) {
		APP.openLoading();
	}
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "transfers/list?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {

			//create rows from file results
			var rows = [];

			if(json.transfers.length) {
				for(var i = 0; i < json.transfers.length; i++) {
					var row = parseRow(json.transfers[i], i);
					rows.push(row);
				}
			} else {
				keepRunning = false;
				//alert("You currently do not have any active transfers.");
				Alloy.createWidget("com.mcongrove.toast", null, {
					text: "You currently do not have any active transfers.",
					duration: 2000,
					view: APP.GlobalWrapper
				});
			}

			rows.reverse();
			$.content.setData(rows);

			APP.closeLoading();

		} else {
			APP.closeLoading();
			keepRunning = false;
			//alert("Error getting transfers. Please try again.");
			Alloy.createWidget("com.mcongrove.toast", null, {
				text: "Error getting transfers. Please try again.",
				duration: 2000,
				view: APP.GlobalWrapper
			});
		}
	}

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	}

	request.open("GET", url);
	request.send();
};

var parseRow = function(data, rowNum) {
	var row = Alloy.createController("transfer_row", {
		data: data,
		rowNum: rowNum
	}).getView();
	return row;
};

var optionsHandler = function(e) {
	switch(e.index) {
		//go to file
		case 0:
			if(targetRow.allData.percent_done == "100") {
				gotoTransfer(targetRow);
			} else {
				Alloy.createWidget("com.mcongrove.toast", null, {
					text: "Torrent still downloading!",
					duration: 2000,
					view: APP.GlobalWrapper
				});
			}
			break;
			//Cancel Transfer
		case 1:
			cancelTransfer(targetRow.id);
			break;
			//Clean
		case 2:
			clean();
			break;
			//nevermind
		case 3:
			break;
	}
};

var gotoTransfer = function(targetRow) {
	Ti.API.info('files: ' + targetRow.id);

	APP.openLoading();

	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/" + targetRow.allData.file_id + "?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			APP.closeLoading();

			APP.addChild("files", {
				fromTransfers: true,
				data: json,
				isChild: true
			});
		} else {
			APP.closeLoading();
			keepRunning = false;
			//alert("Error cancelling transfers. Please try again.");
			Alloy.createWidget("com.mcongrove.toast", null, {
				text: "Error finding transfer. Please try again.",
				duration: 2000,
				view: APP.GlobalWrapper
			});
		}
	}

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	}

	request.open("GET", url);
	request.send();

};

var cancelTransfer = function(target) {
	Ti.API.info('CANCEL TRANSFER');
	APP.openLoading();

	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "transfers/cancel?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			getTransfers(true);
			//APP.closeLoading();
		} else {
			APP.closeLoading();
			keepRunning = false;
			//alert("Error cancelling transfers. Please try again.");
			Alloy.createWidget("com.mcongrove.toast", null, {
				text: "Error cancelling transfers. Please try again.",
				duration: 2000,
				view: APP.GlobalWrapper
			});
		}
	}

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	}

	request.open("POST", url);
	request.send({
		transfer_ids: target
	});
};

var clean = function() {
	Ti.API.info('CLEAN TRANSFERS');
	APP.openLoading();

	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "transfers/clean?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			getTransfers(true);
			//APP.closeLoading();
		} else {
			APP.closeLoading();
			keepRunning = false;
			//alert("Error cleaning transfers. Please try again.");
			Alloy.createWidget("com.mcongrove.toast", null, {
				text: "Error cleaning transfers. Please try again.",
				duration: 2000,
				view: APP.GlobalWrapper
			});
		}
	}

	request.onerror = function(e) {
		Ti.API.info("Inspecting Object: " + e);
		for(var thing in e) {
			Ti.API.info("e." + thing + " = " + e[thing]);
		}
	}

	request.open("POST", url);
	request.send();
};

//EVENTS
Ti.App.addEventListener("transfers:reinit", function(e) {
	reinit();
});

$.content.addEventListener("click", function(e) {
	targetRow = e.row;
	$.dialog.show();
});

$.dialog.addEventListener("click", function(e) {
	optionsHandler(e);
});

// Kick off the init
init();