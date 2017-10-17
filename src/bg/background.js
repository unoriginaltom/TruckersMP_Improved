chrome.runtime.onMessage.addListener(
    function(request) {
        // console.log(request);
        if (request.msg) {
            var notification = {
                "type": "basic",
                "iconUrl": chrome.extension.getURL("icons/icon128.png"),
                "title": "This is a notification",
                "message": request.msg,
                "contextMessage": "Happy trucking!"
            }
            chrome.notifications.create(notification);
        };
    }
);

var storage;
if (chrome.storage.sync) {
    storage = chrome.storage.sync;
} else {
    storage = chrome.storage.local;
};

chrome.runtime.onInstalled.addListener(function (object) {
    val_init().then(function(v) {
        if (!v.steamapi) {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('src/options/index.html'));
            }
        } else {
            if (v.last_version != chrome.runtime.getManifest().version) {
                window.open(chrome.runtime.getURL('src/options/new_version.html'));
            }
        }
    }).catch(function(v) {
        alert('Oops... -> ' + v);
    });

    // chrome.browserAction.setBadgeText({'text': chrome.runtime.getManifest().version});
    storage.set({
        last_version: chrome.runtime.getManifest().version
    });
});


function val_init() {
    var steamapi, last_version;

    return new Promise(function(resolve, reject) {
        storage.get({
            steamapi: 'none',
            last_version: chrome.runtime.getManifest().version,
            settings: {
                img_previews: true,
                wide: true,
                separator: ',',
                own_comment: null
            }
        }, function(items) {
            resolve(items);
        });
    });

}