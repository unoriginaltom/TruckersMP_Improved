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
    var date_buttons = `<div id="ownreasons_buttons">
            <br>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-default plusdate" data-plus="3hrs">+3 hrs</button>
                </div>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-default plusdate" data-plus="1day">+1 day</button>
                    <button type="button" class="btn btn-default plusdate" data-plus="3day">+3</button>
                </div>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-warning plusdate" data-plus="1week">+1 week</button>
                </div>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-danger plusdate" data-plus="1month">+1 month</button>
                    <button type="button" class="btn btn-danger plusdate" data-plus="3month">+3</button>
                    <button type="button" class="btn btn-link plusdate" data-plus="back" id="current_ban_time"><b>Current Ban time</b></button>
                    <button type="button" class="btn btn-link plusdate" data-plus="clear">Current UTC time</button>
                </div>
            </div>`;

    var version = chrome.runtime.getManifest().version;
    var is_add_ban = window.location.pathname.includes('/admin/ban/add/');

    $('body > div.wrapper > div.breadcrumbs > div > h1').append(' Improved <span class="badge" data-toggle="tooltip" title="by @cjmaxik">' + version + '</span> <a href="#" id="go_to_options"><i class="fa fa-cog" data-toggle="tooltip" title="Script settings"></i></a> <a href="#" id="version_detected"><i class="fa fa-question" data-toggle="tooltip" title="Changelog"></i></a>  <i class="fa fa-spinner fa-spin" id="loading-spinner" data-toggle="tooltip" title="Loading...">');

    var ban_time;
    var empty_date;
    if (is_add_ban) {
        if (!ban_time) {
            empty_date = true;
        };
        ban_time = moment().utc();
    } else {
        $('<p class="help-block">Only change a Reason? Click <a href="#" class="plusdate" data-plus="string" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a><br>Ban is by mistake? Click <a href="#" id="by_mistake" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a> and do not forget to post this ban in <a href="https://forum.truckersmp.com/index.php?/topic/17815-ban-by-mistake/#replyForm" style="color: #72c02c; text-decoration: underline;" target="_blank"><b>Ban by mistake</b></a> forum topic</p>').insertAfter('input[name=reason]');
        ban_time = $('#datetimeselect').val();
    };

    if (ban_time) {
        var now = moment(ban_time);
        var put_back;

        $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
        $(date_buttons).insertAfter('#datetimeselect');

        if (empty_date) {
            $('#current_ban_time').remove();
        };

        $('.plusdate').on("click", function(event) {
            event.preventDefault();
            switch ($(this).data("plus")) {
                case '3hrs':
                    now.add(3, 'h');
                    break;
                case '1day':
                    now.add(1, 'd');
                    break;
                case '3day':
                    now.add(3, 'd');
                    break;
                case '1week':
                    now.add(1, 'w');
                    break;
                case '1month':
                    now.add(1, 'M');
                    break;
                case '3month':
                    now.add(3, 'M');
                    break;
                case 'back':
                    now = moment(ban_time);
                    break;
                case 'clear':
                    now = moment().utc();
                    break;
                case 'string':
                    put_back = ban_time;
                    break;
            }
            if (put_back) {
                $('#datetimeselect').val(put_back);
                put_back = '';
                $('#ownreasons_buttons').remove();
            } else {
                $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
            };
        });
    } else {
        console.log("This is a permanent ban!");
        $('#datetimeselect').slideUp('fast');
        $('label[for=\'perma.true\']').addClass('text-uppercase');
    };

    $('input[type=radio][name=perma]').change(function() {
        perma_perform(this);
    });
    $('input[name=reason]').attr('autocomplete', 'off');
    $('input[name=expire]').attr('autocomplete', 'off');

    $('#go_to_options').on('click', function(event) {
        event.preventDefault();
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('src/options/index.html'));
        }
    });

    $('#version_detected').on('click', function(event) {
        event.preventDefault();
        window.open(chrome.runtime.getURL('src/options/new_version.html'));
    });

    $('#by_mistake').on('click', function(event) {
        event.preventDefault();
        $('input[name=reason]').val('@BANBYMISTAKE');
        $('input[name=active]').prop('checked', false);
    });

    $(document).prop('title', 'Edit ' + $('body > div.wrapper > div.container.content-md > form > h2').text() + '\'s Ban - TruckersMP');

    $('[data-toggle="tooltip"]').tooltip();
    $("#loading-spinner").remove();
}

function perma_perform(el) {
    if (el.id == 'perma.true') {
        $('#ownreasons_buttons').slideUp('fast');
        $('#datetimeselect').slideUp('fast');
        $('label[for=\'perma.true\']').addClass('text-uppercase');
    } else if (el.id == 'perma.false') {
        $('#ownreasons_buttons').slideDown('fast');
        $('#datetimeselect').slideDown('fast');
        $('label[for=\'perma.true\']').removeClass('text-uppercase');
    }
}