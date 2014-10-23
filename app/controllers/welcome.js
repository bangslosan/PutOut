//GLOBALS
var APP = require("core");
var PUTOUT = require("putout");
var UTIL = require("utilities");
var CONFIG = arguments[0] || {};

//EVENTS

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
	$.content.url = "/local/chart.html";
	setTimeout(function() {
		getInfo();
	}, 1000);
	/*
	 setTimeout(function() {
	 getFiles();
	 }, 2000);
	 */
};

var getInfo = function() {
	if(Alloy.Globals.session) {
		APP.openLoading();
		var request = Ti.Network.createHTTPClient(),
			url = Alloy.CFG.api + "account/info?oauth_token=" + Alloy.Globals.session.token;

		Ti.API.info('[qk]:url\ = ' + url);

		request.onload = function(e) {
			var json = JSON.parse(this.responseText);
			if(json.status == "OK") {

				Ti.API.info("Inspecting Object: " + json);
				for(var thing in json) {
					Ti.API.info("json." + thing + " = " + json[thing]);
				}

				var chartData = {
					platformWidth: parseInt(Ti.Platform.displayCaps.platformWidth) - 50
				};
				var free = parseFloat(json.info.disk.avail) / parseFloat(json.info.disk.size);
				var used = parseFloat(json.info.disk.used) / parseFloat(json.info.disk.size);
				chartData.data = [{
					value: free,
					color: "#92B9D0"
				}, {
					value: used,
					color: "#1D3747"
				}];

				Alloy.Globals.username = json.info.username;
				Ti.App.Properties.setString('username', Alloy.Globals.username);
				PUTOUT.loadMenu();

				$.header.text = json.info.username + " Put.io Space";

				$.freeLegend.backgroundColor = chartData.data[0].color;
				$.usedLegend.backgroundColor = chartData.data[1].color;

				$.free.text = "Free: " + PUTOUT.bytesToSize(json.info.disk.avail);
				$.used.text = "Used: " + PUTOUT.bytesToSize(json.info.disk.used);

				Ti.App.fireEvent('renderChart', chartData);

				APP.closeLoading();
			}
		};

		request.onerror = function(e) {
			Ti.API.info("Inspecting Object: " + e);
			for(var thing in e) {
				Ti.API.info("e." + thing + " = " + e[thing]);
			}
			alert("Error connecting to Put.io. Please check your internet connection and try again.");
			APP.closeLoading();
		};

		request.open("GET", url);
		request.send();
	}
};

var getFiles = function() {
	Ti.API.info('exec getfiles');
	if(Alloy.Globals.session) {

		var request = Ti.Network.createHTTPClient(),
			url = Alloy.CFG.api + "files/list?oauth_token=" + Alloy.Globals.session.token;

		request.onload = function(e) {
			var json = JSON.parse(this.responseText);

			Ti.API.info("Inspecting Object: " + json);
			for(var thing in json) {
				Ti.API.info("json." + thing + " = " + json[thing]);
			}

			if(json.status == "OK") {

				var labels = [],
					dataPoints = [];

				for(var i = 0; i < json.files.length; i++) {
					if(json.files[i].size) {
						labels.push(json.files[i].name);
						//labels.push("test");
						dataPoints.push(parseInt(json.files[i].size / 1048576));
						//dataPoints.push(5);
					}
				}

				labels.pop();
				dataPoints.pop();

				var chartData2 = {
					platformWidth: parseInt(Ti.Platform.displayCaps.platformWidth) - 50,
					data: {
						labels: labels,
						datasets: [{
							fillColor: "rgba(220,220,220,0.5)",
							strokeColor: "rgba(220,220,220,1)",
							data: dataPoints
						}]
					}
				};

				Ti.App.fireEvent('renderChart2', chartData2);

				Ti.API.info('[qk]:labels\ = ' + labels);
				Ti.API.info('[qk]:labels.length\ = ' + labels.length);
				Ti.API.info('[qk]:dataPoints\ = ' + dataPoints);
				Ti.API.info('[qk]:dataPoints.length\ = ' + dataPoints.length);

				var test = JSON.stringify(chartData2.data);
				Ti.API.info('[qk]:test\ = ' + test);

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
	}
};

Ti.App.addEventListener("welcome:reinit", function(e) {
	getInfo();
});

Ti.App.addEventListener("getInfo", function(e) {
	getInfo();
});

init();