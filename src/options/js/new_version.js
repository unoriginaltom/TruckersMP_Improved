var storage;

if (chrome.storage.sync) {
    storage = chrome.storage.sync;
} else {
    storage = chrome.storage.local;
};

$('#ext_name').html('<strong>' + chrome.runtime.getManifest().name + '</strong> ' + chrome.runtime.getManifest().version);
$('.subheader').html(chrome.runtime.getManifest().version);

$('#close').on('click', function(event) {
    window.close();
});

$('#go_to_options').on('click', function(event) {
    event.preventDefault();
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
        window.close();
    } else {
        window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
        window.close();
    }
});