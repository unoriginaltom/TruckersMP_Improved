var storage, syncAllowed = false, default_OwnReasons, default_OwnDates, version = chrome.runtime.getManifest().version;

if (chrome.storage.sync) {
	syncAllowed = true;
	storage = chrome.storage.sync;
} else {
	storage = chrome.storage.local;
};

function loadSettings(callBack){
	if(callBack){
		storage.get({
			steamapi: 'none',
			OwnReasons: (default_OwnReasons !== undefined) ? default_OwnReasons : null,
			OwnDates: (default_OwnDates !== undefined) ? default_OwnDates : null,
			last_version: version,
			settings: {
				local_storage: false,
				img_previews: true,
				wide: true,
				autoinsertsep: true,
				viewreportblank: true,
				separator: ','
			}
		}, function(items){
			if(syncAllowed && items.settings.local_storage){
				chrome.storage.local.get(items, function(items){
					callBack(items);
				});
			}else{
				callBack(items);
			};
		});
	};
};

function checkDoubleSlash(input) {
	if (!input) { return; }
	var val = input.value,
		valLength = val.length;
	if(valLength > 1){
		var strPos = 0;
		var br = ((input.selectionStart || input.selectionStart == '0') ?
			"ff" : (document.selection ? "ie" : false ) );
		if (br == "ie") {
			input.focus();
			var range = document.selection.createRange();
			range.moveStart ('character', -input.value.length);
			strPos = range.text.length;
		} else if (br == "ff") {
			strPos = input.selectionStart;
		}
		if(strPos > 1){
			var result = false;
			if(strPos > 2)
				result = val.substring(strPos - 3, strPos) == '// ';
			if(!result)
				result = val.substring(strPos - 2, strPos) == '//';
			return result;
		}else{
			return false;
		}
	}else{
		return false;
	}
};

function insertAtCaret(input, text, firstSpace) {
	if (!input) { return; }

	var strPos = 0;
	var br = ((input.selectionStart || input.selectionStart == '0') ?
		"ff" : (document.selection ? "ie" : false ) );
	if (br == "ie") {
		input.focus();
		var range = document.selection.createRange();
		range.moveStart ('character', -input.value.length);
		strPos = range.text.length;
	} else if (br == "ff") {
		strPos = input.selectionStart;
	}

	var front = (input.value).substring(0, strPos),
		back = (input.value).substring(strPos, input.value.length),
		textVal = text;

	if(firstSpace){
		if(front.length > 0){
			var flOld = front.length;
			front = front.replace(/\s+$/, '');
			strPos = strPos - (flOld - front.length);
		};
		textVal = ' ' + text;
	};

	input.value = front + textVal + back;
	strPos = strPos + textVal.length;
	if (br == "ie") {
		input.focus();
		var ieRange = document.selection.createRange();
		ieRange.moveStart ('character', -input.value.length);
		ieRange.moveStart ('character', strPos);
		ieRange.moveEnd ('character', 0);
		ieRange.select();
	} else if (br == "ff") {
		input.selectionStart = strPos;
		input.selectionEnd = strPos;
		input.focus();
	}
};