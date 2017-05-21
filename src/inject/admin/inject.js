if (!chrome.extension.sendMessage) {
    init();
    // alert("Firefox");
} else {
    chrome.extension.sendMessage({}, function(response) {
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                init();
                // alert("Chrome");
            }
        }, 10);
    });
}

function init() {
    $('.fa').each(function() {
        $(this).addClass('fa-fw');
    });
}