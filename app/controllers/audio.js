//GLOBALS
var APP = require("core");
var CONFIG = arguments[0] || {};
var audioPlayer = {}, audioFiles = [],
	_fileSize = 0,
	currentIndex = 0,
	firstRun = true;

//EVENTS

/*
 $.startStop.addEventListener('click', function() {
 if(audioPlayer.playing || audioPlayer.paused) {
 audioPlayer.stop();
 $.pauseResume.enabled = false;
 if(OS_ANDROID) {
 audioPlayer.release();
 }

 } else {
 audioPlayer.start();
 $.playPause.enabled = true;

 }
 });
 */

$.playPauseWrapper.addEventListener('click', function() {
	if(audioPlayer.paused) {
		audioPlayer.start();
		$.playPause.image = "/controls/pause.png";
	} else {
		audioPlayer.pause();
		$.playPause.image = "/controls/play.png";
	}
});

$.nextWrapper.addEventListener('click', function() {
	audioPlayer.stop();
	if(OS_ANDROID) {
		audioPlayer.release();
	}
	currentIndex++;

	if(currentIndex >= audioFiles.length) {
		currentIndex = 0;
	}

	trackChange();
});

$.prevWrapper.addEventListener('click', function() {
	audioPlayer.stop();
	if(OS_ANDROID) {
		audioPlayer.release();
	}

	currentIndex--;

	if(currentIndex < 0) {
		currentIndex = audioFiles.length - 1;
	}

	trackChange();
});

//FUNCTIONS
var trackChange = function() {
	Ti.API.info('[qk]:currentIndex\ = ' + currentIndex);
	var target = audioFiles[currentIndex];
	Ti.API.info("Inspecting Object: " + target);
	for(var thing in target) {
		Ti.API.info("target." + thing + " = " + target[thing]);
	}
	CONFIG.url = "https://api.put.io/v2/files/" + target.id + "/stream?oauth_token=" + Alloy.Globals.session.token;
	CONFIG.id = target.id;
	audioPlayer.url = CONFIG.url;
	Ti.API.info('[qk]:CONFIG.url\ = ' + CONFIG.url);
	audioPlayer.start();
	$.trackName.text = target.name;
};

var sortByKey = function(array, key) {
	return array.sort(function(a, b) {
		var x = a[key];
		var y = b[key];
		return((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
};

var albumArtAndPlaylist = function() {
	var targets = Alloy.Globals.lastDirectory.files;
	var images = [];
	for(var i = 0; i < targets.length; i++) {
		if(targets[i].content_type.substr(0, 5) == "image") {
			var image = {
				name: targets[i].name,
				size: targets[i].size,
				id: targets[i].id
			};
			images.push(image);
		} else if(targets[i].content_type.substr(0, 5) == "audio") {
			audioFiles.push(targets[i]);
		}

	}

	for(var i = 0; i < audioFiles.length; i++) {
		if(audioFiles[i].id == CONFIG.id) {
			currentIndex = i;
		}
	}

	if(images.length) {
		var target = images[0];
		var albumArtImage = Alloy.CFG.api + "files/" + target.id + "/stream?oauth_token=" + Alloy.Globals.session.token;
		$.albumArt.image = albumArtImage;
		$.noArt.visible = false;
	} else {
		getGoogleImage();
	}
	$.trackName.text = audioFiles[currentIndex].name;
};

var getGoogleImage = function() {
	Ti.API.info('[qk]:Alloy.Globals.lastDirectoryName\ = ' + Alloy.Globals.lastDirectoryName);
	var regEx = /[A-Za-z0-9& ]*/g;
	var regResults = regEx.exec(Alloy.Globals.lastDirectoryName);
	var request = Ti.Network.createHTTPClient();
	var url = "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&imgsz=large&q=" + regResults[0];
	Ti.API.info('[qk]:url\ = ' + url);
	request.onload = function(e) {
		var json = JSON.parse(this.responseText);

		if(json.responseData.results.length) {
			var albumArtImage = json.responseData.results[0].unescapedUrl;
			Ti.API.info('[qk]:albumArtImage\ = ' + albumArtImage);
			$.albumArt.image = albumArtImage;
			$.noArt.visible = false;
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

var getItunes = function() {
	Ti.API.info('[qk]:Alloy.Globals.lastDirectoryName\ = ' + Alloy.Globals.lastDirectoryName);
	var regEx = /[A-Za-z0-9& ]*/g;
	var regResults = regEx.exec(Alloy.Globals.lastDirectoryName);
	var request = Ti.Network.createHTTPClient();
	var url = "https://itunes.apple.com/search?limit=1&media=music&attribute=artistTerm&term=" + regResults[0];
	Ti.API.info('[qk]:url\ = ' + url);
	request.onload = function(e) {
		var json = JSON.parse(this.responseText);

		if(json.resultCount) {
			var albumArtImage = json.results[0].artworkUrl100;

			Ti.API.info('[qk]:albumArtImage\ = ' + albumArtImage);

			albumArtImage = albumArtImage.replace('100x100', '600x600');

			Ti.API.info('[qk]:albumArtImage\ = ' + albumArtImage);

			$.albumArt.image = albumArtImage;
			$.noArt.visible = false;
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

var init = function() {
	APP.log("debug", "audio | " + JSON.stringify(CONFIG));
	APP.closeLoading();
	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(CONFIG.isChild === true) {
		$.NavigationBar.showBack(closeBack);
	} else {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	}

	Ti.API.info('[qk]:CONFIG.url\ = ' + CONFIG.url);

	audioPlayer = Ti.Media.createAudioPlayer({
		url: CONFIG.url,
		allowBackground: true,
		allowsAirPlay: true,
		allowBackground: true
	});
	audioPlayer.start();
	/*
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function() {
	_fileSize = this.getResponseHeader('Content-Length');
	Ti.API.info('SETTING FILESIZE: ' + _fileSize);
	};
	xhr.open('HEAD', CONFIG.url);
	xhr.send();
	*/
	//EVENTS
	audioPlayer.addEventListener("change", function(e) {
		Ti.API.info('player state: ' + e.state);
		if(e.state == 1) {
			//APP.openLoading();
		} else if(e.state >= 4) {
			APP.closeLoading();
			/*Ti.API.info("Inspecting Object: " + audioPlayer);
			 for(var thing in audioPlayer) {
			 Ti.API.info("audioPlayer." + thing + " = " + audioPlayer[thing]);
			 }*/
		}
	});

	audioPlayer.addEventListener("progress", function(e) {
		/*Ti.API.info("Inspecting Object: " + e);
		 for(var thing in e) {
		 Ti.API.info("e." + thing + " = " + e[thing]);
		 }*/
	});

	albumArtAndPlaylist();

};

var closeAudio = function() {
	audioPlayer.stop();
	APP.removeChild();
};

init();