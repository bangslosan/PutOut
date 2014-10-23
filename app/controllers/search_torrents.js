//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};

//FUNCTIONS
var getTorrent = function(data) {
	var apiCall = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "/transfers/add?oauth_token=" + Alloy.Globals.session.token;

	apiCall.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var dialog = Ti.UI.createAlertDialog({
			cancel: 0,
			buttonNames: ['OK'],
			message: 'Your torrent has been sent to Put.io and will be downloaded shortly.',
			title: 'Download in progress'
		});
		dialog.show();
	};

	apiCall.open("POST", url);
	apiCall.send({
		url: data.url
	});

};

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
};

var resetUI = function() {
	$.search.width = Ti.Platform.displayCaps.platformWidth - 120;
};

var doSearch = function(q) {
	var apiCall = Ti.Network.createHTTPClient(),
		url = "http://fenopy.se/module/search/api.php?keyword=" + Ti.Network.encodeURIComponent(q) + "&sort=peer&format=json&limit=50";

	apiCall.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText),
			rows = [],
			spacer = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: "10dp"
			});

		for(var i = 0; i < json.length; i++) {

			if(i % 2 == 0) {
				var backgroundColor = "#59ade2";
			} else {
				var backgroundColor = "#549dcc";
			}

			var row = Ti.UI.createTableViewRow({
				layout: "vertical",
				name: json[i].name,
				torrent: json[i].torrent,
				magnet: json[i].magnet,
				backgroundColor: backgroundColor
			}),
				name = Ti.UI.createLabel({
					left: "10dp",
					text: json[i].name,
					color: "#ffffff",
					font: {
						fontSize: "22dp",
						fontWeight: "bold",
						fontFamily: Alloy.Globals.customFont1
					}
				}),
				descr = Ti.UI.createLabel({
					left: "10dp",
					color: "#ffffff",
					text: "Size: " + size_format(json[i].size) + " // Seed: " + json[i].seeder + " // Leech: " + json[i].leecher,
					font: {
						fontSize: "16dp",
						fontFamily: Alloy.Globals.customFont1
					}
				});

			row.add(spacer);
			row.add(name);
			row.add(descr);
			row.add(spacer);

			rows.push(row);
		}

		$.tv.setData(rows);

	};

	apiCall.open("GET", url);
	apiCall.send();
};

function number_format(number, decimals, dec_point, thousands_sep) {
	// http://kevin.vanzonneveld.net
	// +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +     bugfix by: Michael White (http://crestidg.com)
	// +     bugfix by: Benjamin Lupton
	// +     bugfix by: Allan Jensen (http://www.winternet.no)
	// +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)    
	// *     example 1: number_format(1234.5678, 2, '.', '');
	// *     returns 1: 1234.57     

	var n = number,
		c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
	var d = dec_point == undefined ? "," : dec_point;
	var t = thousands_sep == undefined ? "." : thousands_sep,
		s = n < 0 ? "-" : "";
	var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;

	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function size_format(filesize) {
	if(filesize >= 1073741824) {
		filesize = number_format(filesize / 1073741824, 2, '.', '') + ' Gb';
	} else {
		if(filesize >= 1048576) {
			filesize = number_format(filesize / 1048576, 2, '.', '') + ' Mb';
		} else {
			if(filesize >= 1024) {
				filesize = number_format(filesize / 1024, 0) + ' Kb';
			} else {
				filesize = number_format(filesize, 0) + ' bytes';
			};
		};
	};
	return filesize;
};

//EVENTS
Ti.App.addEventListener("search_torrents:reinit", function(e) {
	resetUI();
});

Ti.App.addEventListener("APP:orientationChange", function(e) {
	resetUI();
});

$.doSearch.addEventListener("click", function(e) {
	doSearch($.search.value);
});

$.tv.addEventListener("click", function(e) {
	var confirm = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['Yes', 'No'],
		message: "Are you sure you want to add " + e.row.name + " to your Put.io queue?",
		title: 'Confirm torrent add'
	});
	confirm.addEventListener('click', function(ev) {
		if(ev.index === ev.source.cancel) {
			Ti.API.info('The cancel button was clicked');
		} else if(ev.index == 0) {
			var url;
			if(e.row.torrent.length) {
				url = e.row.torrent;
			}
			if(e.row.magnet.length) {
				url = e.row.magnet;
			}

			getTorrent({
				url: url
			});
		}
	});
	confirm.show();

});

//BOOTSTRAP
init();