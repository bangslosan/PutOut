//GLOBALS
var APP = require("core");
var SOCIAL = require("social");
var CONFIG = arguments[0] || {};
var parent_id = CONFIG.target || 0;
var showMenu = CONFIG.showMenu || 0;
var showSearch = CONFIG.showSearch || false;
var searchText = CONFIG.searchText || "";
var fromTransfers = CONFIG.fromTransfers || false;
var targetRow = 0;
//var deviceWidth = Ti.Platform.displayCaps.platformWidth;

//EVENTS
$.Wrapper.addEventListener("focus", function(e) {
	Ti.API.info('View Focused.');
	getFiles({
		parent_id: 0
	});
});

$.content.addEventListener("click", function(e) {
	clickHandler(e.row);
});

$.content.addEventListener("longpress", function(e) {
	longpressHandler(e);
});

$.dialog.addEventListener("click", function(e) {
	optionsHandler(e);
});

$.go.addEventListener("click", function(e) {
	APP.addChild("files", {
		searchText: $.searchText.value
	});
});

APP.MainWindow.addEventListener("file_refresh", function(e) {
	getFiles({
		parent_id: parent_id
	});
});

//FUNCTIONS
var init = function() {
	APP.log("debug", "files | " + JSON.stringify(CONFIG));
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	APP.closeLoading();

	if((parent_id && !showMenu) || searchText.length || CONFIG.isChild) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	} else {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	}

	if(CONFIG.title) {
		//folder from menu
		Alloy.Globals.lastDirectoryName = CONFIG.title;
	} else {
		//not from menu
	}

	Ti.API.info('[qk]:CONFIG.showSearch\ = ' + CONFIG.showSearch);

	if(showSearch) {
		$.search.height = Ti.UI.SIZE;
		$.content.top = "0";
	}

	$.NavigationBar.showRight({
		image: "/icons/white/glyphicons_081_refresh.png",
		callback: function() {
			getFiles({
				parent_id: parent_id
			});
		}
	});

	if(fromTransfers) {
		getFiles({
			parent_id: CONFIG.data.file.parent_id,
			clickHandler: CONFIG.data.file
		});
	} else {
		if(!searchText.length) {
			getFiles({
				parent_id: parent_id
			});
		} else {
			getFiles({
				parent_id: parent_id,
				searchText: searchText
			});
		}
	}

};

var optionsHandler = function(e) {
	switch(e.index) {
		//create folder
		case 0:
			if(targetRow) {
				APP.addChild("new_folder", {
					row: targetRow,
					parent_id: parent_id
				});
			} else {
				showError();
			}
			break;
			//move
		case 1:
			if(targetRow) {
				APP.addChild("move", {
					row: targetRow
				});
			} else {
				showError();
			}
			break;

			//rename
		case 2:
			if(targetRow) {
				APP.addChild("rename", {
					row: targetRow
				});
			} else {
				showError();
			}
			break;

			//delete
		case 3:
			if(targetRow) {
				confirmDelete(targetRow.id);
			} else {
				showError();
			}
			//download
		case 4:
			downloadFile(targetRow);
			break;
			//cancel
		case 5:
			if(targetRow.content_type == "application/x-directory") {
				var url = Alloy.CFG.api + "files/zip?file_ids=" + targetRow.id + "&oauth_token=" + Alloy.Globals.session.token;
			} else {
				var url = Alloy.CFG.api + "files/" + targetRow.id + "/download?oauth_token=" + Alloy.Globals.session.token;
			}
			SOCIAL.share(url, $.NavigationBar.right);
			break;
			//share download link
		case 6:
			if(targetRow.content_type == "application/x-directory") {
				var url = Alloy.CFG.api + "files/zip?file_ids=" + targetRow.id + "&oauth_token=" + Alloy.Globals.session.token;
			} else {
				var url = Alloy.CFG.api + "files/" + targetRow.id + "/download?oauth_token=" + Alloy.Globals.session.token;
			}
			//SOCIAL.share(url, $.NavigationBar.right);
			Ti.UI.Clipboard.setText(url);
			break;
			//share download link
		case 7:
			if(targetRow.content_type == "application/x-directory") {
				var url = Alloy.CFG.api + "your-files/" + targetRow.id + "&oauth_token=" + Alloy.Globals.session.token;
			} else {
				var url = Alloy.CFG.api + "file/" + targetRow.id + "/download?oauth_token=" + Alloy.Globals.session.token;
			}
			SOCIAL.share(url, $.NavigationBar.right);
			//share put.io link
			break;
		case 8:
			//don't really need to do anything here
			break;
	}
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

var downloadFile = function(row) {
	//APP.openLoading();
	var request = Ti.Network.createHTTPClient();

	if(row.content_type == "application/x-directory") {
		var url = Alloy.CFG.api + "files/zip?file_ids=" + row.id + "&oauth_token=" + Alloy.Globals.session.token;
	} else {
		var url = Alloy.CFG.api + "files/" + row.id + "/download?oauth_token=" + Alloy.Globals.session.token;
	}

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		var filename = row.name;
		if(row.content_type == "application/x-directory") {
			filename += ".zip";
		}
		var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);
		f.write(this.responseData);
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

var confirmDelete = function(file_id) {
	var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['Confirm', 'Cancel'],
		message: 'Are you sure you want to delete this item?',
		title: 'Delete'
	});
	dialog.addEventListener('click', function(e) {
		if(e.index == 0) {
			deleteFile(file_id);
		}
	});
	dialog.show();
};

var deleteFile = function(file_id) {
	APP.openLoading();
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/delete?oauth_token=" + Alloy.Globals.session.token;

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		var json = JSON.parse(this.responseText);
		if(json.status == "OK") {
			//refresh files
			APP.closeLoading();
			getFiles({
				parent_id: parent_id
			});
			targetRow = 0;
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
		file_ids: file_id
	});

};

var getFiles = function(params) {
	//var targetWidth = (parseInt(Ti.Platform.displayCaps.platformWidth) - 50) + "dp";

	APP.openLoading();
	var request = Ti.Network.createHTTPClient(),
		url = Alloy.CFG.api + "files/list?parent_id=" + params.parent_id + "&oauth_token=" + Alloy.Globals.session.token;

	if(params.searchText) {
		//    files/search/<query>/page/<page_no>
		url = Alloy.CFG.api + "files/search/" + Ti.Network.encodeURIComponent(params.searchText) + "/page/1?oauth_token=" + Alloy.Globals.session.token;
	}

	Ti.API.info('[qk]:url\ = ' + url);

	request.onload = function(e) {
		Ti.API.info('[qk]:this.responseText\ = ' + this.responseText);
		var json = JSON.parse(this.responseText);

		Alloy.Globals.lastDirectory = json;

		if(json.status == "OK") {

			//create rows from file results
			var rows = [];

			for(var i = 0; i < json.files.length; i++) {

				if(i % 2 == 0) {
					var backgroundColor = "#59ade2";
				} else {
					var backgroundColor = "#549dcc";
				}

				var row = Ti.UI.createTableViewRow({
					layout: "vertical",
					id: json.files[i].id,
					content_type: json.files[i].content_type,
					is_mp4_available: json.files[i].is_mp4_available,
					allData: json.files[i],
					backgroundColor: backgroundColor,
					name: json.files[i].name,
					height: Ti.UI.SIZE
				}),
					image = Ti.UI.createImageView({
						left: "10dp",
						top: "10dp",
						right: "10dp",
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
						color: "#ffffff",
						left: "10dp",
						top: "10dp",
						font: {
							fontSize: "18dp",
							fontWeight: "bold",
							fontFamily: Alloy.Globals.customFont1
						},
						width: APP.Device.width - 100
					});

				//name.width = (parseFloat(deviceWidth) - 100) + "dp";

				if(json.files[i].content_type == "application/x-directory" || json.files[i].content_type.substr(0, 5) == "video" || json.files[i].content_type.substr(0, 5) == "audio") {
					row.hasChild = true;
				}

				container.add(image);
				container.add(name);
				row.add(spacer);
				row.add(container);
				row.add(spacer);
				rows.push(row);
			}

			$.content.setData(rows);

			APP.closeLoading();

			if(params.clickHandler) {
				Ti.API.info('clickHandler!');
				clickHandler(params.clickHandler);
			} else {
				Ti.API.info('no clickHandler!');
			}

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

var longpressHandler = function(e) {
	targetRow = e.row;
	$.dialog.show();
};

var clickHandler = function(target) {

	APP.openLoading();

	if(target.content_type == "application/x-directory") {
		Alloy.Globals.lastDirectoryName = target.name;
		APP.addChild("files", {
			target: target.id
		});
	} else if(target.content_type.substr(0, 5) == "video") {

		//play video
		if(target.is_mp4_available || target.content_type == "video/mp4") {

			if(target.content_type == "video/mp4") {
				var url = "https://api.put.io/v2/files/" + target.id + "/stream?oauth_token=" + Alloy.Globals.session.token;
			} else {
				var url = "https://api.put.io/v2/files/" + target.id + "/mp4/stream?oauth_token=" + Alloy.Globals.session.token;
			}

			APP.addChild("video", {
				url: url
			});

			//offer to convert video
		} else {

			APP.closeLoading();

			var checkStatus = Ti.Network.createHTTPClient(),
				chkUrl = Alloy.CFG.api + "files/" + target.id + "/mp4?oauth_token=" + Alloy.Globals.session.token;

			checkStatus.onload = function(e) {
				var chkJson = JSON.parse(this.responseText);

				if(chkJson.mp4.status == "NOT_AVAILABLE") {
					var dialog = Ti.UI.createAlertDialog({
						cancel: 0,
						buttonNames: ['Cancel', 'Confirm'],
						message: 'Convert file to MP4?',
						title: 'Start conversion'
					});

					dialog.addEventListener('click', function(e) {
						if(e.index) {
							var convertVideo = Ti.Network.createHTTPClient();
							convertVideo.onload = function(e) {
								var dialog = Ti.UI.createAlertDialog({
									cancel: 0,
									buttonNames: ['OK'],
									message: 'The video is now converting to MP4 format. This process will take some time but, if you come back I will let you know how far it is.',
									title: 'Video conversion started'
								});
								dialog.show();

							};
							convertVideo.open("POST", chkUrl);
							convertVideo.send();
						}
					});

					dialog.show();

				} else if(chkJson.mp4.status == "IN_QUEUE") {
					var dialog = Ti.UI.createAlertDialog({
						cancel: 0,
						buttonNames: ['OK'],
						message: 'Uh oh. It looks like things are backed up a bit. Your conversion request is in the queue but, hasn\'t started yet. Check back later for more information.',
						title: 'Conversion in queue'
					});
					dialog.show();
				} else if(chkJson.mp4.status == "CONVERTING") {
					var dialog = Ti.UI.createAlertDialog({
						cancel: 0,
						buttonNames: ['OK'],
						message: 'Your file is converting and is currently: ' + chkJson.mp4.percent_done + '% done.',
						title: 'Conversion in progress'
					});
					dialog.show();
				}

			};

			checkStatus.open("GET", chkUrl);
			checkStatus.send();
		}

		//play audio
	} else if(target.content_type.substr(0, 5) == "audio") {
		var url = "https://api.put.io/v2/files/" + target.id + "/stream?oauth_token=" + Alloy.Globals.session.token;

		APP.addChild("audio", {
			url: url,
			id: target.id
		});
	}
};

//BOOTSTRAP
init();