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
	APP.openLoading();
	q = encodeURIComponent(q);
	var filter = Ti.App.Properties.getString("filter"),
		order = Ti.App.Properties.getString("order");
	var tpbDomain = Ti.App.Properties.getString('tpbUrl');
	var qry = 'select * from html where url="https://' + tpbDomain + '/search/' + q + '/0/' + order + '/' + filter + '" and xpath="//tr"';
	Ti.API.info('[qk]:qry\ = ' + qry);
	var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(qry) + "&format=json&diagnostics=true&callback=";

	Ti.API.info('[qk]:url\ = ' + url);

	var apiCall = Ti.Network.createHTTPClient();

	apiCall.onload = function(e) {
		var json = JSON.parse(this.responseText);

		if(json.query.count) {

			var torrents = json.query.results.tr,
				rows = [],
				spacer = Ti.UI.createView({
					width: Ti.UI.FILL,
					height: "10dp"
				});

			for(var i = 0; i < torrents.length; i++) {

				if(torrents[i].td) {
					var title = torrents[i].td[1].div.a.content,
						seeds = torrents[i].td[2].p,
						leechers = torrents[i].td[3].p,
						href = torrents[i].td[1].div.a.href;

					if(torrents[i].td[1].font.a) {
						var details = torrents[i].td[1].font.content + torrents[i].td[1].font.a.content;
					} else {
						var details = torrents[i].td[1].font.content + "Anonymous";
					}

					if(!torrents[i].td[1].a.href) {
						var magnet = torrents[i].td[1].a[0].href;
					} else {
						var magnet = torrents[i].td[1].a.href;
					}

					if(i % 2 == 0) {
						var backgroundColor = "#59ade2";
					} else {
						var backgroundColor = "#549dcc";
					}

					var row = Ti.UI.createTableViewRow({
						layout: "vertical",
						name: title,
						torrent: magnet,
						magnet: magnet,
						href: href,
						backgroundColor: backgroundColor
					}),
						name = Ti.UI.createLabel({
							left: "10dp",
							text: title,
							color: "#ffffff",
							font: {
								fontSize: "22dp",
								fontWeight: "bold",
								fontFamily: Alloy.Globals.customFont1
							}
						}),
						descr1 = Ti.UI.createLabel({
							left: "10dp",
							color: "#ffffff",
							text: details,
							font: {
								fontSize: "16dp",
								fontFamily: Alloy.Globals.customFont1
							}
						}),
						descr2 = Ti.UI.createLabel({
							left: "10dp",
							color: "#ffffff",
							text: "Seeds: " + seeds + " // Leechers: " + leechers,
							font: {
								fontSize: "16dp",
								fontFamily: Alloy.Globals.customFont1
							}
						});

					row.add(spacer);
					row.add(name);
					row.add(descr1);
					row.add(descr2);
					row.add(spacer);

					rows.push(row);

				}

			}

			$.tv.setData(rows);
			APP.closeLoading();

		} else {
			APP.closeLoading();
			alert("No results found.");
		}

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
	$.search.blur();
});

$.showOptions.addEventListener("click", function(e) {
	APP.addChild("tpb_options");
});

$.tv.addEventListener("click", function(e) {
	APP.addChild("tpb_details", e.row);
});

//BOOTSTRAP
init();