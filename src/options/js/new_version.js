$('kbd.subheader').html(chrome.runtime.getManifest().version);

$('#go_to_options').on('click', function (event) {
  event.preventDefault();
  window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
  window.close();
});

$('#close').on('click', function () {
  window.close();
});