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
