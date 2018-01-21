chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.msg) {
      var notification = {
        'type': 'basic',
        'iconUrl': chrome.extension.getURL('icons/icon128.png'),
        'title': 'This is a notification',
        'message': request.msg,
        'contextMessage': 'Happy trucking!'
      };
      chrome.notifications.create(notification)
    }
  }
);

chrome.runtime.onInstalled.addListener(function () {
  val_init().then(function (v) {
    if (v.last_version != chrome.runtime.getManifest().version) {
      window.open(chrome.runtime.getURL('src/options/new_version.html'))
    }
  }).catch(function (v) {
    alert('Oops... -> ' + v)
  });
});