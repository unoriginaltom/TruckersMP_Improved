chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.msg) {
      var notification = {
        type: 'basic',
        iconUrl: chrome.extension.getURL('icons/icon128.png'),
        title: 'This is a notification',
        message: request.msg,
        contextMessage: request.contextMessage || 'Happy trucking!'
      };

      var notificationID = null
      chrome.notifications.create(notification, function (id) {
        notificationID = id
      })

      setTimeout(() => {
        chrome.notifications.clear(notificationID)
      }, request.timeout);
    }
  }
);

var notificationID = null
chrome.runtime.onInstalled.addListener(function (details) {
  console.log(details)
  if (details.reason === 'update') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.extension.getURL('icons/icon128.png'),
      title: "TruckersMP Improved has been updated",
      message: "New version: " + chrome.runtime.getManifest().version,
      contextMessage: "Previous version: " + details.previousVersion,
      buttons: [{
          title: 'Options',
          iconUrl: chrome.extension.getURL('icons/notification/options.png')
        },
        {
          title: 'Changelog',
          iconUrl: chrome.extension.getURL('icons/notification/changelog.png')
        }
      ],
      requireInteraction: true
    }, function (id) {
      notificationID = id
    })

    chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
      if (notifId === notificationID) {
        if (btnIdx === 0) {
          window.open(chrome.runtime.getURL('src/options/index.html'))
        } else if (btnIdx === 1) {
          window.open(chrome.runtime.getURL('src/options/new_version.html'))
        }
      }

      chrome.notifications.clear(notificationID)
    })
  } else {
    if (details.reason === 'install') {
      window.open(chrome.runtime.getURL('src/options/index.html'));
    }
  }

  chrome.browserAction.setBadgeText({
    "text": chrome.runtime.getManifest().version,
  })
  chrome.browserAction.setBadgeBackgroundColor({
    "color": [0, 113, 197, 255]
  })
});