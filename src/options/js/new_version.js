function inject_init() {
  $('#ext_name').html('<strong>' + chrome.runtime.getManifest().name + '</strong> ' + chrome.runtime.getManifest().version);
  $('.subheader').html(chrome.runtime.getManifest().version);

  $('#close').on('click', function () {
    window.close();
  });
  
  loadSettings(function (i) {
    saveSettings(chrome.storage.sync, parseItems(i), false);
    saveSettings(chrome.storage.sync, i, false);
  });
}