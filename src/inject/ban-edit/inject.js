var storage, OwnReasons, settings;

if (!chrome.extension.sendMessage) {
    init();
} else {
    chrome.extension.sendMessage({}, function(response) {
    	var readyStateCheckInterval = setInterval(function() {
        	if (document.readyState === "complete") {
        		clearInterval(readyStateCheckInterval);

                if (chrome.storage.sync) {
                    storage = chrome.storage.sync;
                } else {
                    storage = chrome.storage.local;
                }

                function val_init() {
                    return new Promise(function(resolve, reject) {
                        storage.get({
                            steamapi: null,
                            OwnReasons: null,
                            OwnDates: null,
                            settings: {}
                        }, function(items) {
                            resolve(items);
                        });
                    });
                }

                val_init().then(function(v) {
                    if (v.OwnReasons == null) {
                        alert("Hello! Looks like this is your first try in Reports Improved (or just new version)! I'll open the settings for you...");
                        if (chrome.runtime.openOptionsPage) {
                            chrome.runtime.openOptionsPage();
                        } else {
                            window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
                        }
                    } else {
                        // console.log(v);
                        OwnReasons = v.OwnReasons;
                        settings = v.settings;
                    }
                    init();
                }).catch(function(v) {
                    console.log(v)
                });
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
        }
        ban_time = moment().utc();
    } else {
        $('<p class="help-block">Only change a Reason? Click <a href="#" class="plusdate" data-plus="string" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a><br>Ban is by mistake? Click <a href="#" id="by_mistake" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a> and do not forget to post this ban in <a href="https://forum.truckersmp.com/index.php?/topic/17815-ban-by-mistake/#replyForm" style="color: #72c02c; text-decoration: underline;" target="_blank"><b>Ban by mistake</b></a> forum topic</p>').insertAfter('input[name=reason]');
        ban_time = $('#datetimeselect').val();
    }

    if (ban_time) {
        var now = moment(ban_time);
        var put_back;

        $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
        $(date_buttons).insertAfter('#datetimeselect');

        if (empty_date) {
            $('#current_ban_time').remove();
        }

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
            }
        });
    } else {
        $('#datetimeselect').slideUp('fast');
        $('label[for=\'perma.true\']').addClass('text-uppercase');
    }

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

    if(typeof OwnReasons !== 'undefined'){
        function construct_buttons(OwnReasons) {
            var html = '';
            html = '';
            var prefixes = OwnReasons.prefixes.split(';');
            var reasons = OwnReasons.reasons.split(';');
            var postfixes = OwnReasons.postfixes.split(';');
            html += each_type_new('Reasons', reasons);
            html += each_type_new('Prefixes', prefixes);
            html += each_type_new('Postfixes', postfixes);
            html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>';
            return html;

            function each_type_new(type, buttons) {
                var place, color, change;
                if (type == 'Prefixes') {
                    place = 'before';
                    color = 'warning';
                    change = 'reason';
                } else if (type == 'Reasons') {
                    place = 'after';
                    color = 'default';
                    change = 'reason';
                } else if (type == 'Postfixes') {
                    place = 'after-wo';
                    color = 'danger';
                    change = 'reason';
                }
                var snippet = '<div class="btn-group dropdown mega-menu-fullwidth"><a class="btn btn-' + color + ' dropdown-toggle" data-toggle="dropdown" href="#">' + type + ' <span class="caret"></span></a><ul class="dropdown-menu"><li><div class="mega-menu-content disable-icons" style="padding: 4px 15px;"><div class="container" style="width: 800px !important;"><div class="row equal-height" style="display: flex;">';
                var count = 0;
                // console.log(buttons);
                var md = 12 / ((buttons.join().match(/\|/g) || []).length + 1);
                buttons.forEach(function(item, i, arr) {
                    if (count === 0) {
                        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">';
                    }
                    if (item.trim() == '|') {
                        snippet += '</ul></div>';
                        count = 0;
                    } else {
                        snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '">' + item.trim() + '</a></li>';
                        ++count;
                    }
                });
                snippet += '</div></div></div></li></ul></div>     ';
                return snippet;
            }
        }

        function dropdown_enchancements() {
            $('ul.dropdown-menu').css('top', '95%');
            $(".dropdown").hover(function() {
                $('.dropdown-menu', this).stop(true, true).fadeIn("fast");
                $(this).toggleClass('open');
                $('b', this).toggleClass("caret caret-up");
            }, function() {
                $('.dropdown-menu', this).stop(true, true).fadeOut("fast");
                $(this).toggleClass('open');
                $('b', this).toggleClass("caret caret-up");
            });
            $("a.hovery").hover(function(e) {
                $(this).css("background", e.type === "mouseenter" ? "#303030" : "transparent");
                $(this).css("color", e.type === "mouseenter" ? "#999!important" : "");
            });
        }

        var reason_buttons = construct_buttons(OwnReasons);
        $('<div class="ban-reasons">'+reason_buttons+'</div>').insertAfter('input[name=reason]');

        $('.plusreason').on('click', function(event) {
            event.preventDefault();

            var reason_val = $('input[name="reason"]').val();
            var sp = (settings.separator) ? settings.separator : ',';

            if ($(this).data('place') == 'before') {
                $('input[name="reason"]').val($(this).html() + ' ' + reason_val.trim() + ' ');
            } else if (($(this).data('place') == 'after-wo') || (reason_val.trim() == 'Intentional')) {
                $('input[name="reason"]').val(reason_val.trim() + ' ' + $(this).html() + ' ');
            } else if (reason_val.length) {
                $('input[name="reason"]').val(reason_val.trim() + sp + ' ' + $(this).html() + ' ');
            } else {
                $('input[name="reason"]').val($(this).html() + ' ');
            }
            $('input[name="reason"]').focus();
        });
        $('button#reason_clear').on('click', function(event) {
            event.preventDefault();
            $('input[name="reason"]').val("");
        });

        dropdown_enchancements();
    }
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
}

function insertAtCaret(input, text) {
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
	
	var front = (input.value).substring(0, strPos);
	var back = (input.value).substring(strPos, input.value.length);
	input.value = front + text + back;
	strPos = strPos + text.length;
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
}

function evidencePasteInit(){
	$('input[name="reason"]').bind('paste', function(e) {
		var self = this,
			data = e.originalEvent.clipboardData.getData('Text').trim(),
			dataLower = data.toLowerCase();
		if((dataLower.indexOf('http://') == 0 || dataLower.indexOf('https://') == 0) && !checkDoubleSlash(this) && settings.autoinsertsep){
			e.preventDefault();
			insertAtCaret($(self)[0], '- ' + data);
		}
	});
}

evidencePasteInit();