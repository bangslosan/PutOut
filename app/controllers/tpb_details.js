//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};

//FUNCTIONS
var getTorrent = function(data) {
	var apiCall = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "/transfers/add?oauth_token=" + Alloy.Globals.session.token;

	apiCall.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		/*var dialog = Ti.UI.createAlertDialog({
		 cancel : 0,
		 buttonNames : ['OK'],
		 message : 'Your torrent has been sent to Put.io and will be downloaded shortly.',
		 title : 'Download in progress'
		 });
		 dialog.show();*/
		Alloy.createWidget("com.mcongrove.toast", null, {
			text: "Torrent sent to Put.io!",
			duration: 2000,
			view: APP.GlobalWrapper
		});

		APP.MainWindow.fireEvent("file_refresh");

	};

	apiCall.open("POST", url);
	apiCall.send({
		url: data.url
	});

};

var init = function() {
	APP.log("debug", "files | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");
	$.NavigationBar.showBack(function(_event) {
		APP.removeChild();
	});

	//APP.openLoading();
	getComments();
};

var resetUI = function() {
	$.search.width = Ti.Platform.displayCaps.platformWidth - 120;
};

var getComments = function(q) {
	var tpbDomain = Ti.App.Properties.getString('tpbUrl');
	var qry = 'select * from html where url="https://' + tpbDomain + '/' + escape(CONFIG.href) + '" and xpath="//div[contains(@id,\'comment\')]"';

	var url = "http://query.yahooapis.com/v1/public/yql?q=" + escape(qry) + "&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

	Ti.API.info('[qk]:qry\ = ' + qry);
	Ti.API.info('[qk]:url\ = ' + url);

	var apiCall = Ti.Network.createHTTPClient();

	apiCall.onload = function(e) {
		try {
			var json = JSON.parse(this.responseText);

			var comments = json.query.results.div,
				rows = [],
				spacer = Ti.UI.createView({
					width: Ti.UI.FILL,
					height: "10dp"
				});

			for(var i = 0; i < comments.length; i++) {

				if(comments[i].p) {
					var username = comments[i].p.a.content + comments[i].p.content;

					if(comments[i].div.p.content) {
						var comment = comments[i].div.p.content;
					} else {
						var comment = comments[i].div.p;
					}

					if(i % 2 == 0) {
						var backgroundColor = "#59ade2";
					} else {
						var backgroundColor = "#549dcc";
					}

					var row = Ti.UI.createTableViewRow({
						layout: "vertical",
						backgroundColor: backgroundColor
					}),
						userame = Ti.UI.createLabel({
							left: "10dp",
							color: "#ffffff",
							text: username,
							font: {
								fontSize: "16dp",
								fontFamily: Alloy.Globals.customFont1
							}
						}),
						comment = Ti.UI.createLabel({
							left: "10dp",
							text: comment,
							color: "#ffffff",
							font: {
								fontSize: "22dp",
								fontFamily: Alloy.Globals.customFont1
							}
						});
					row.add(spacer);
					row.add(userame);
					row.add(comment);
					row.add(spacer);

					rows.push(row);

				}

			}

			$.tv.setData(rows);
			APP.closeLoading();

		} catch(e) {
			Ti.API.info('Failed to load comments.');
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

$.download.addEventListener("click", function(e) {
	var confirm = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['Yes', 'No'],
		message: "Are you sure you want to add " + CONFIG.name + " to your Put.io queue?",
		title: 'Confirm torrent add'
	});
	confirm.addEventListener('click', function(ev) {
		if(ev.index === ev.source.cancel) {
			Ti.API.info('The cancel button was clicked');
		} else if(ev.index == 0) {
			var url;
			if(CONFIG.torrent.length) {
				url = CONFIG.torrent;
			}
			if(CONFIG.magnet.length) {
				url = CONFIG.magnet;
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