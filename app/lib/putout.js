var APP = require("core");

exports.loadMenu = function() {
	Alloy.Globals.username = Ti.App.Properties.getString('username');
	Ti.API.info('exec: loadMenu');
	if(Alloy.Globals.username) {
		Ti.API.info('username exists');
		var pattern = /demo[0-9]{1,}/;
		//var pattern = /buck[a-z]{1,}/;
		var isFound = Alloy.Globals.username.match(pattern);
		Ti.API.info('[qk]:Alloy.Globals.username\ = ' + Alloy.Globals.username);
		Ti.API.info('[qk]:isFound\ = ' + isFound);
		if(!isFound) {
			Ti.API.info('!found');
			var parent_id = 0;
			var request = Ti.Network.createHTTPClient(),
				url = Alloy.CFG.api + "files/list?parent_id=" + parent_id + "&oauth_token=" + Alloy.Globals.session.token;

			request.onload = function(e) {
				Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
				var json = JSON.parse(this.responseText);
				if(json.status == "OK") {
					Ti.API.info('Pass one');
					for(var i = 0; i < json.files.length; i++) {
						if(json.files[i].content_type == "application/x-directory") {
							var temp = {
								title: json.files[i].name,
								type: "files",
								image: "glyphicons_144_folder_open",
								target: json.files[i].id,
								index: APP.Nodes.length + 1,
								showMenu: true,
								tabletSupport: false
							};
							if(i == 0) {
								temp.menuHeader = "Put.io Files";
							}
							APP.Nodes.push(temp);
							Ti.API.info('directory added: ' + json.files[i].name);
						}
					}

					APP.SlideMenu.clear();
					var newNodes = [];
					for(var i = 0; i < APP.Nodes.length; i++) {

						if(i == 1) {

							var temp1 = {
								title: "Web Browser",
								type: "web",
								image: "glyphicons_060_compass",
								tabletSupport: false
							};

							var temp2 = {
								title: "Magnet Search",
								type: "search_tpb",
								image: "glyphicons_023_magnet",
								tabletSupport: false
							};
							newNodes.push(temp1);
							newNodes.push(temp2);
							newNodes.push(APP.Nodes[i]);
						} else {
							newNodes.push(APP.Nodes[i]);
						}

					}

					Ti.API.info('[qk]:APP.Nodes.length\ = ' + APP.Nodes.length);
					Ti.API.info('[qk]:newNodes.length\ = ' + newNodes.length);

					APP.Nodes = newNodes.splice(0);
					APP.build(true);

					//exports.advancedOptions();
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

		}

	} else {
		Ti.API.info('foundxx');
		if(Alloy.Globals.session) {

			var request = Ti.Network.createHTTPClient(),
				url = Alloy.CFG.api + "account/info?oauth_token=" + Alloy.Globals.session.token;

			Ti.API.info('[qk]:url\ = ' + url);

			request.onload = function(e) {
				var json = JSON.parse(this.responseText);
				if(json.status == "OK") {
					Alloy.Globals.username = json.info.username;
					exports.advancedOptions();
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
	}
};

exports.advancedOptions = function() {
	if(Alloy.Globals.username) {
		var pattern = /demo[0-9]{1,}/;
		//var pattern = /buck[a-z]{1,}/;
		var isFound = Alloy.Globals.username.match(pattern);

		if(!isFound) {
			APP.SlideMenu.clear();
			var newNodes = [];
			for(var i = 0; i < APP.Nodes.length; i++) {

				if(i == 1) {

					var temp1 = {
						title: "Web Browser",
						type: "web",
						image: "glyphicons_060_compass",
						tabletSupport: false
					};

					var temp2 = {
						title: "Magnet Search",
						type: "search_tpb",
						image: "glyphicons_023_magnet",
						tabletSupport: false
					};
					newNodes.push(temp1);
					newNodes.push(temp2);
					newNodes.push(APP.Nodes[i]);
				} else {
					newNodes.push(APP.Nodes[i]);
				}

			}

			Ti.API.info('[qk]:APP.Nodes.length\ = ' + APP.Nodes.length);
			Ti.API.info('[qk]:newNodes.length\ = ' + newNodes.length);

			APP.Nodes = newNodes.splice(0);
			APP.build(true);

		}

	} else {
		if(Alloy.Globals.session) {

			var request = Ti.Network.createHTTPClient(),
				url = Alloy.CFG.api + "account/info?oauth_token=" + Alloy.Globals.session.token;

			Ti.API.info('[qk]:url\ = ' + url);

			request.onload = function(e) {
				var json = JSON.parse(this.responseText);
				if(json.status == "OK") {
					Alloy.Globals.username = json.info.username;
					exports.advancedOptions();
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
	}
};

exports.menuAddon = function() {
	var parent_id = 0;
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/list?parent_id=" + parent_id + "&oauth_token=" + Alloy.Globals.session.token;

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {

			for(var i = 0; i < json.files.length; i++) {
				if(json.files[i].content_type == "application/x-directory") {
					var temp = {
						title: json.files[i].name,
						type: "files",
						image: "glyphicons_144_folder_open",
						target: json.files[i].id,
						index: APP.Nodes.length + 1,
						showMenu: true,
						tabletSupport: false
					};
					APP.Nodes.push(temp);
				}
			}

			APP.build(true);

			//exports.advancedOptions();
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

exports.isDemo = function() {
	if(Alloy.Globals.username) {
		var pattern = /demo[0-9]{1,}/;
		var isFound = Alloy.Globals.username.match(pattern);

		if(isFound) {
			return true;
		} else {
			return false;
		}
	}
};

exports.bytesToSize = function(bytes, precision) {
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' B';

	} else if((bytes >= kilobyte) && (bytes < megabyte)) {
		return(bytes / kilobyte).toFixed(precision) + ' KB';

	} else if((bytes >= megabyte) && (bytes < gigabyte)) {
		return(bytes / megabyte).toFixed(precision) + ' MB';

	} else if((bytes >= gigabyte) && (bytes < terabyte)) {
		return(bytes / gigabyte).toFixed(precision) + ' GB';

	} else if(bytes >= terabyte) {
		return(bytes / terabyte).toFixed(precision) + ' TB';

	} else {
		return bytes + ' B';
	}
};