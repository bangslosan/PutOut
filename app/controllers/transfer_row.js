var APP = require("core");
var CONFIG = arguments[0] || {};
var deviceWidth = Ti.Platform.displayCaps.platformWidth;
var fixer = deviceWidth / 100;
var tester;

var init = function() {
	Ti.API.info('[qk]:CONFIG.rowNum\ = ' + CONFIG.rowNum);
	if(CONFIG.rowNum % 2 == 0) {
		var backgroundColor = "#549dcc";
	} else {
		var backgroundColor = "#59ade2";
	}

	$.Wrapper.id = CONFIG.data.id;
	$.Wrapper.allData = CONFIG.data;
	$.Wrapper.name = CONFIG.data.name;
	$.icon.image = "/icons/glyphicons_364_cloud_download.png";
	$.name.text = CONFIG.data.name;
	$.status.text = CONFIG.data.status_message;
	$.Wrapper.backgroundColor = backgroundColor;
	$.progress.backgroundColor = "#59ade2";
	$.progress.width = CONFIG.data.percent_done * fixer;
	//var rando = Math.random() * 10;
	//tester = setInterval(simulate, rando * 1000);
};

var simulate = function() {
	if(CONFIG.data.percent_done < 100) {
		CONFIG.data.percent_done += 2;
	} else {
		clearInterval(tester);
	}
	$.progress.width = CONFIG.data.percent_done * fixer;
};

init();