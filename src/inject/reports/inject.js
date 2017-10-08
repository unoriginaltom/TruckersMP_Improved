if (!chrome.extension.sendMessage) {
    inject_init('firefox');
} else {
    chrome.extension.sendMessage({}, function() {
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                inject_init('chrome');
            }
        }, 10);
    });
}

function inject_init(browser) {
    var storage;
    if (chrome.storage.sync) {
        storage = chrome.storage.sync;
    } else {
        storage = chrome.storage.local;
    }
    var steam_id = $('input[name="steam_id"]').val();
    var now = moment.utc(); // Moment.js init
    var version = {
        number: chrome.runtime.getManifest().version,
        changes: [
            'Rewrited version'
        ],
        features: [
            'Many fixes'
        ]
    };
    var templates = {
        /*
            UndescoreJS Templates
         */
        header: _.template(` Improved <span class="badge" data-toggle="tooltip" title="by @cjmaxik"> <%= version.number %></span> <a href="#" id="go_to_options"><i class="fa fa-cog" data-toggle="tooltip" title="Script settings"></i></a> <a href="#new_version_modal" data-toggle="modal" id="version_detected"><i class="fa fa-question" data-toggle="tooltip" title="Changelog"></i></a>  <i class="fa fa-spinner fa-spin" id="loading-spinner" data-toggle="tooltip" title="Loading..."></i>  <i class="fa fa-exclamation-triangle" id="loading-error" style="display:none; color: #ac2925;" data-toggle="tooltip" title="Steam has an issue, try again later..."></i>`),
    };
    var injects = {
        header: 'body > div.wrapper > div.breadcrumbs > div > h1',
        date_buttons: '#confirm-accept > div > div > form > div.modal-body > div:nth-child(5) > label:nth-child(4)',
        report_language: 'div.container.content > div > div > div > table.table > tbody > tr:nth-child(8) > td:nth-child(2)',
        claim_report: 'div.container.content > div > div > div > table.table > tbody > tr:nth-child(10) > td:nth-child(2) > a',
        accept_comment: '#confirm-accept > div > div > form > div.modal-body > div:nth-child(7) > textarea',
        bans: {
            table: 'body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr',
            header: 'body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > h4:nth-child(4)',
        },
        summary: {
            first_column: 'body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr > td:nth-child(1)',
        }
    };

    /*
        SERVICE FUNCTIONS
     */
    // Escape HTML due to HTML tags in Steam usernames
    function escapeHTML(s) {
        return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

    /*
        ECHO
     */

    function version_checker(last_version) {
        $(injects.header).append(templates.header({
            version: version
        }));

        if (browser == 'firefox') {
            if (last_version != chrome.runtime.getManifest().version) {
                window.open(chrome.runtime.getURL('src/options/new_version.html'));
                storage.set({
                    last_version: chrome.runtime.getManifest().version
                });
            }
        }
    }

    function accept_modal_init() {
        var reason_buttons = construct_buttons(OwnReasons, false),
            decline_buttons = construct_buttons(OwnReasons, true),
            comments_buttons = construct_buttons(OwnReasons, false, true);

        $(reason_buttons).insertAfter('#confirm-accept > div > div > form > div.modal-body > div:nth-child(6) > input');
        $(decline_buttons).insertAfter('#confirm-decline > div > div > form > div.modal-body > div > textarea');

        if(comments_buttons.length > 0){
            var textArea = $('div.container.content').find('textarea[name=comment]');
            $(textArea).css('margin-bottom', '10px');
            $(textArea).parent().append(comments_buttons);
        }
	    templates.date_buttons = construct_dates(OwnDates);
        $(templates.date_buttons).insertAfter(injects.date_buttons);
        $('input[id="perma.false"]').prop("checked", true);
        // ===== DateTime and Reason inputs checking =====
        $('#confirm-accept > div > div > form').on('submit', function(event) {
            var time_check = $('#datetimeselect').val();
            var perm_check = $('input[id="perma.true"]').prop("checked");
            // console.log(perm_check);
            var reason_check = $('#confirm-accept > div > div > form > div.modal-body > div:nth-child(6) > input').val();
            var error_style = {
                'border-color': '#a94442',
                '-webkit-box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)',
                'box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)'
            };
            var normal_style = {
                'border-color': '',
                '-webkit-box-shadow': '',
                'box-shadow': ''
            };
            if (!time_check && !perm_check) {
                $('#datetimeselect').css(error_style);
                event.preventDefault();
            } else {
                $('#datetimeselect').css(normal_style);
            }
            if (!reason_check) {
                $('#confirm-accept > div > div > form > div.modal-body > div:nth-child(6) > input').css(error_style);
                event.preventDefault();
            } else {
                $('#confirm-accept > div > div > form > div.modal-body > div:nth-child(6) > input').css(normal_style);
            }
        });
        // ===== Reasons FTW =====
        $('.plusreason').on('click', function(event) {
            event.preventDefault();
            // console.log(settings);

            var reason = $('input[name="reason"]'), 
            	reason_val = $(reason).val(),
            	sp = '';
            if(!checkDoubleSlash($(reason)[0]))
            	sp = (settings.separator) ? settings.separator : ',';

            if ($(this).data('place') == 'before') {
                $(reason).val($(this).html() + ' ' + reason_val.trim() + ' ');
            } else if (($(this).data('place') == 'after-wo') || (reason_val.trim() == 'Intentional')) {
                $(reason).val(reason_val.trim() + ' ' + $(this).html() + ' ');
            } else if (reason_val.length) {
                $(reason).val(reason_val.trim() + sp + ' ' + $(this).html() + ' ');
            } else {
                $(reason).val($(this).html() + ' ');
            }
            $(reason).focus();
        });
        $('button#reason_clear').on('click', function(event) {
            event.preventDefault();
            $('input[name="reason"]').val("");
        });
        // ===== Timing FTW! =====

        $('.plusdate').on("click", function(event) {
            event.preventDefault();
            var number = $(this).data('number');
            switch (number) {
                case 'clear':
                    now = moment.utc();
                    break;
                default:
                    var key = $(this).data('key');
                    now.add(number, key);
                    break;
            }
            $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
        });
    }

    function decline_modal_init() {
        $('#confirm-decline > div > div > form').on('submit', function(event) {
            var comment_check = $('#confirm-decline > div > div > form > div.modal-body > div > textarea').val();
            var error_style = {
                'border-color': '#a94442',
                '-webkit-box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)',
                'box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)'
            };
            var normal_style = {
                'border-color': '',
                '-webkit-box-shadow': '',
                'box-shadow': ''
            };
            if (!comment_check) {
                $('#confirm-decline > div > div > form > div.modal-body > div > textarea').css(error_style);
                event.preventDefault();
            } else {
                $('#confirm-decline > div > div > form > div.modal-body > div > textarea').css(normal_style);
            }
        });
        $('.plusdecline').on('click', function(event) {
            event.preventDefault();
            var reason_val = $('#confirm-decline > div > div > form > div.modal-body > div > textarea').val();
            if ($(this).data('place') == 'before') {
                $('#confirm-decline > div > div > form > div.modal-body > div > textarea').val($(this).html() + ' ' + reason_val + ' ');
            } else {
                $('#confirm-decline > div > div > form > div.modal-body > div > textarea').val(reason_val + ' ' + $(this).html());
            }
            $('#confirm-decline > div > div > form > div.modal-body > div > textarea').focus();
        });
        function setReason(reason, reason_val){
           $(reason).val($(reason).val() + ' ' + reason_val + ' ');
           $(reason).focus();
        }
	    $('.pluscomment').on('click', function(event) {
           event.preventDefault();
           setReason($('form').find('textarea[name=comment]'), $(this).html());
        });
        $('button#decline_clear').on('click', function(event) {
            event.preventDefault();
            $('#confirm-decline > div > div > form > div.modal-body > div > textarea').val("");
        });
        $('button#comments_clear').on('click', function(event) {
            event.preventDefault();
            $('form').find('textarea[name=comment]').val("");
        });
    }

    String.prototype.contains = function (needle) {
        for (var i = needle.length - 1; i >= 0; i--) {
            if (this.includes(needle[i])) {
                return true;
            }
        }
    };

    function getYouTubeIdFromUrl(youtubeUrl) {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      var match = youtubeUrl.match(regExp);
      if (match && match[2].length == 11) {
        return match[2];
      } else {
        return false;
      }
    }

    function parseURLParams(url) {
      var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {},
        i, n, v, nv;

      if (query === url || query === "") {
        return;
      }

      for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
          parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
      }
      return parms;
    }

    function checkTimestamps(url) {
      var params = parseURLParams(url);
      if (params) {
        if (params.t) {
          console.log('t');
          start = params.t[0];
          console.log(start);
          if (start.includes('s')) {
            var hrs, min, sec;

            spl = start.split('h');
            if (spl.length == 2) {
              hrs = Number(spl[0]);
              spl = spl[1];
            } else {
              hrs = 0;
              spl = spl[0];
            }
	          spl = spl.split('m');
            if (spl.length == 2) {
              min = Number(spl[0]);
              spl = spl[1];
            } else {
              min = 0;
              spl = spl[0];
            }
	          spl = spl.split('s');
            sec = Number(spl[0]);

            hrs = hrs * 3600;
            min = min * 60;
            start = hrs + min + sec;
          }
        } else if (params.time_continue) {
          console.log('time_continue');
          start = params.time_continue[0];
        } else {
          console.log('out');
          start = params[0];
        }
	      if (start) {
            return '?t=' + start + 's';
        } else {
            return '';
        }
      } else {
        return '';
      }
    }

    function content_links() {
        $('.autolink > a').each(function() {
            var sub = $(this).attr('href');
            var copy_link = '   <a href="#" class="jmdev_ca" data-link="' + sub + '"><i class="fa fa-copy fa-fw" data-toggle="tooltip" title="Shorted + to clipboard"></i></a> ';

            $(this).after(copy_link);

            if (sub.contains(["youtube.com", "youtu.be"])) {
                $('<a href="' + sub + '" class="youtube">  <i class="fa fa-youtube-play fa-fw" data-toggle="tooltip" title="Watch this video in modal"></i></a>').insertAfter($(this));
            }
	        if (sub.length > 60) {
                $(this).text(sub.substring(0, 40) + '...');
            }

        });

        if (settings.img_previews !== false) {
            $('div.comment .autolink > a').each(function () {
                var sub = $(this).attr('href');
                // console.log(sub);
                if (sub.contains(['.png', '.jpg', ".gif", "images.akamai."])) {
                    $('<img src="' + sub + '" class="img-responsive img-thumbnail" alt="' + sub + '"><br>').insertBefore($(this));
                }
            });
        }

        $('a.jmdev_ca').on('click', function(event) {
            event.preventDefault();
            $("#loading-spinner").show();
            var link = $(this).data("link");
            var length = ($(this).data("link")).length;

            if (link.includes('youtube.com')) {
                link = 'https://youtu.be/' + getYouTubeIdFromUrl(link) + checkTimestamps(link);
            }
	        if (length < 30) {
                copyToClipboard($(this).data("link"));
                chrome.runtime.sendMessage({
                    msg: "This URL is short enough. Check your clipboard!"
                });
                $("#loading-spinner").hide();
            } else {
                urlShorter(link);
            }
        });
    }

    function urlShorter(link, paste = false) {
        $.ajax({
            url: "https://www.jmdev.ca/url/algo.php?method=insert&url=" + encodeURIComponent(link),
            type: 'GET',
            success: function(val) {
                if (val.result.url_short === undefined || val.result.url_short === null) {
                  alert('Looks like we have a problem with URL shortener... Try again!');
                } else {
                  copyToClipboard('https://jmdev.ca/url/?l=' + val.result.url_short);

                  if (paste) {
                      msg = "Steam info just saved! Check your clipboard for the link!"
                  } else {
                      msg = "URL just being shorted! Check your clipboard!";
                  }

                  chrome.runtime.sendMessage({
                      msg: msg
                  });
                }
            },
            error: function() {
                if (paste) {
                    copyToClipboard(link);
                    alert('Steam info just saved! Check your clipboard for the link!');
                } else {
                    alert('Looks like we have a problem with URL shortener... Try again!');
                }
            },
            complete: function() {
                $("#loading-spinner").hide();

                chrome.runtime.sendMessage({
                    msg: msg
                });
            }
        });
    }

    function copyToClipboard(text) {
        const input = document.createElement('input');
        input.style.position = 'fixed';
        input.style.opacity = 0;
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');
        document.body.removeChild(input);
    }
	function comment_language() {
        var report_language = $(injects.report_language).text().trim();
        var comment;

        if (!settings.own_comment) {
            switch (report_language) {
                case 'German':
                    comment = 'Wir bedanken uns für deinen Report :)';
                    break;
                case 'Turkish':
                    comment = 'Raporun için teşekkür ederim :)';
                    break;
                case 'Norwegian':
                    comment = 'Takk for rapporten :)';
                    break;
                case 'Spanish':
                    comment = 'Muchas gracias por tu reporte :)';
                    break;
                case 'Dutch':
                    comment = 'Bedankt voor de report :)';
                    break;
                case 'Polish':
                    comment = 'Dziękuję za report :)';
                    break;
                case 'Russian':
                    comment = 'Спасибо за репорт :)';
                    break;
                case 'French':
                    comment = 'Merci pour le rapport :)';
                    break;
                default:
                    comment = 'Thank you for the report :)';
            }
        } else {
            comment = settings.own_comment;
        }
	    $(injects.accept_comment).val(comment);
    }

    function bans_count_fetch() {
        // console.log('Current locale is ' + $('body > div.wrapper > div.header > div.container > div > ul > li.hoverSelector > ul > li.active > a').attr('hreflang'));
        if ($('body > div.wrapper > div.header > div.container > div > ul > li.hoverSelector > ul > li.active > a').attr('hreflang').indexOf("en_US") == 0) {
            var bans_count = 0;
            var expired_bans_count = 0;
            $(injects.bans.table).each(function(index) {
                // console.log($(this).children('td:nth-child(1)').text());
                var banned_time_td = $(this).children('td:nth-child(1)').text();
                var banned_reason_td = $(this).children('td:nth-child(3)').text();
                var banned_time;
                if (banned_time_td.indexOf("Today") !== -1) {
                    banned_time = now;
                } else if (banned_time_td.indexOf("Tomorrow") !== -1) {
                    banned_time = now.add(1, 'd');
                } else if (banned_time_td.indexOf("Yesterday") !== -1) {
                    banned_time = now.add(1, 'd');
                } else {
                    banned_time = moment(banned_time_td);
                }
                if (banned_time.year() == '2001') {
                    banned_time.year(now.year());
                }
                if (banned_reason_td == '@BANBYMISTAKE') {
                    banned_time.year('1998');
                }
                if (banned_time.isValid()) {
                    if (Math.abs(banned_time.diff(now, 'd')) >= 365) {
                        $(this).hide();
                        $(this).addClass('expired_bans');
                        $(this).find('td').css('color', '#555');
                        expired_bans_count++;
                    } else {
                        bans_count++;
                    }
                }
            });

            $(injects.bans.header).html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small>');
            if (bans_count >= 3) {
                $(injects.bans.header).css('color', '#d43f3a');
            }
            if (expired_bans_count > 0) {
                $(injects.bans.header).html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small> <a href="#" id="expired_bans_toggler"><i class="fa fa-toggle-off" data-toggle="tooltip" title="Show/hide bans further than 12 months and @BANBYMISTAKE"></i></a>');
                $('#expired_bans_toggler').on('click', function(event) {
                    event.preventDefault();
                    $('.expired_bans').fadeToggle('slow');
                    if ($('#expired_bans_toggler > i').hasClass('fa-toggle-off')) {
                        $('#expired_bans_toggler > i').removeClass('fa-toggle-off');
                        $('#expired_bans_toggler > i').addClass('fa-toggle-on');
                    } else {
                        $('#expired_bans_toggler > i').removeClass('fa-toggle-on');
                        $('#expired_bans_toggler > i').addClass('fa-toggle-off');
                    }
                });
            }

            if ($('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2) > td:nth-child(5) > i').hasClass('fa-check')) {
                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2)').children('td').css({
                    'color': '#d43f3a'
                });
            }
        } else {
        $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > h4')
        .html('Ban history <small>Sorry, but bans count checking works only on <a rel="alternate" hreflang="en_US" href="/user/locale/en_US"><img src="/assets/images/flags/en_US.png">&nbsp;English</a> locale :(</small>');
        }

        $(injects.bans.header).before('<hr class="small"/>')
    }

    function table_impoving() {
        $('table').addClass('table-condensed table-hover');
        $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > div:nth-child(1)').after('<hr class="small"/>');

        var perpetrator_id = $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a').attr('href').replace('/user/', '');
        var perpetrator_nickname = $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a').text();

        $(document).prop('title', perpetrator_nickname + ' - ' + perpetrator_id + ' | TruckersMP');

        if (steamapi === "none") {
            // console.log(":O");
            $("body > div.wrapper > div.breadcrumbs > div > h1").append("<kbd>#blame" + $('body > div.wrapper > div.header > div.container > div > ul > li:nth-child(1) > a').html() + "</kbd>");
            $("#loading-spinner").hide();
            $(function() {
                $('[data-toggle="tooltip"]').tooltip();
            });
        } else if (steamapi !== null && steamapi != "https://steamcommunity.com/dev/apikey") {
            $.ajax({
                url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + steamapi + "&format=json&steamids=" + steam_id,
                type: 'GET',
                success: function(steam_data) {
                    // console.log(steam_data);
                    if (steam_data === undefined) {
                        console.error('No Response by Steam');
                        $("#loading-error").show();
                        $("#loading-spinner").hide();
                        blink('#loading-error');
                        return;
                    }

                    var steam_name = escapeHTML(steam_data.response.players[0].personaname);
                    $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('TruckersMP');

                    $.ajax({
                        url: "https://api.truckersmp.com/v2/player/" + perpetrator_id,
                        type: "GET",
                        success: function(tmp_data) {
                            if (tmp_data !== true) {
                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a').after(' <img src="' + tmp_data.response.avatar + '" class="img-rounded" style="width: 32px; height: 32px;">');
                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a').wrap('<kbd>');

                                var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">' + steam_name + '</a></kbd> <img src="' + steam_data.response.players[0].avatar + '" class="img-rounded"></td></tr>';
                                $(steam_link).insertAfter('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2)');

                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)').css('text-align', 'right');
                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)').css('text-align', 'right');

                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)').css('text-align', 'right');
                                $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)').css('text-align', 'right');

                                $(injects.summary.first_column).each(function(index) {
                                    $(this).css('font-weight', 'bold');
                                });
                                $('[data-toggle="tooltip"]').tooltip();
                                $("#loading-spinner").hide();
                            }
                        }
                    })

                }
            });
        }
        if (perpetrator_id <= 3500) {
            low_id = ' <span class="badge badge-red" data-toggle="tooltip" title="Be careful! Perpetrator ID seems to be an In-Game ID. Double-check Steam aliases! If you want to change Perpetrator ID, please send request to CMs/team leads">Low ID! <strong>' + perpetrator_id + '</strong></span>';
        } else {
            low_id = ' <span class="badge badge-u" data-toggle="tooltip" title="ID is legit">ID ' + perpetrator_id + '</span>';
        }
        $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)').append(low_id);
        $('input[type=radio][name=perma]').change(function() {
            if (this.id == 'perma.true') {
                $('#ownreasons_buttons').slideUp('fast');
                $('#datetimeselect').slideUp('fast');
                $('label[for=\'perma.true\']').addClass('text-danger').addClass('lead').addClass('text-uppercase');
            } else if (this.id == 'perma.false') {
                $('#ownreasons_buttons').slideDown('fast');
                $('#datetimeselect').slideDown('fast');
                $('label[for=\'perma.true\']').removeClass('text-danger').removeClass('lead').removeClass('text-uppercase');
            }
        });
        $('input[name=reason]').attr('autocomplete', 'off');
        $('input[name=expire]').attr('autocomplete', 'off');
    }

    function comments_nice_look() {
        $(".comment > p").each(function() {
            $('<hr style="margin: 10px 0 !important;">').insertAfter(this);
            $(this).wrap("<blockquote></blockquote>");
            if (!$(this).text().length) {
                $(this).html('<i>Empty comment</i>');
            }
        });
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

    function bannedInit(){
    	var isBanned = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(2) > table').find('i.fa-check');
    	if(isBanned.length > 0){
			var perpetrator = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
			$(perpetrator).append('<span class="badge badge-red badge-banned">Banned</span>');
    	}
    }

    function final_init() {
        $(document).ready(function() {
            $('#go_to_options').on('click', function(event) {
                event.preventDefault();
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
                }
            });
            $('#version_detected').on('click', function(event) {
                event.preventDefault();
                window.open(chrome.runtime.getURL('src/options/new_version.html'), "_blank");
            });

            if (settings.wide !== false) {
                $('div.container.content').css('width', '85%');
            }
	        $(".youtube").YouTubeModal({autoplay:0, width:640, height:480});
        });
    }

    function construct_dates(OwnDates) {
        var html = '<br><div id="ownreasons_buttons">';

        html += each_type('default', OwnDates.white.split(';'));
        html += each_type('warning', OwnDates.yellow.split(';'));
        html += each_type('danger', OwnDates.red.split(';'));
        html += each_type('other', OwnDates.other.split(';'));

        html += '</div>';
        return html;

        function each_type(type, buttons) {
            snippet = '<div class="btn-group" role="group">';
            buttons.forEach(function(item) {
                item = item.split(',');
                var number = item[0].trim();
                var key = (item[1]) ? item[1].trim() : undefined;
                var title = (item[2]) ? item[2].trim() : ('+'+number);

                if (type == 'other') {
                    if (number == 'current_utc') {
                        snippet += '<button type="button" class="btn btn-link plusdate" data-number="clear">Current UTC time</button>'
                    }
                } else {
                    snippet += '<button type="button" class="btn btn-'+ type+' plusdate" data-number="'+ number +'" data-key="'+ key +'">'+ title +'</button>';
                }
            });
            snippet += '</div>   ';
            return snippet;
        }
    }

    function construct_buttons(OwnReasons, if_decline, isComments) {
        var html = '';
        if(!isComments){
            html = '<br>';
            if (if_decline) {
                // console.log(typeof OwnReasons);
                var declines = OwnReasons.declines.split(';');
                html += each_type_new('Declines', declines);
                html += '<button type="button" class="btn btn-link" id="decline_clear">Clear</button>';
            } else {
                // console.log(typeof OwnReasons);
                var prefixes = OwnReasons.prefixes.split(';');
                var reasons = OwnReasons.reasons.split(';');
                var postfixes = OwnReasons.postfixes.split(';');
                html += each_type_new('Reasons', reasons);
                html += each_type_new('Prefixes', prefixes);
                html += each_type_new('Postfixes', postfixes);
                html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>';
            }
        }else{
            if(typeof OwnReasons.comments !== 'undefined'){
                var comments = OwnReasons.comments.split(';');
                html += each_type_new('Comments', comments);
                html += '<button type="button" class="btn btn-link" id="comments_clear">Clear</button>';
            }
        }
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
            } else if (type == 'Declines') {
                place = 'after';
                color = 'info';
                change = 'decline';
            } else if (type == 'Comments') {
                place = 'after';
                color = 'u';
                change = 'comment';
            }
            var snippet = '<div class="btn-group dropdown mega-menu-fullwidth"><a class="btn btn-' + color + ' dropdown-toggle" data-toggle="dropdown" href="#">' + type + ' <span class="caret"></span></a><ul class="dropdown-menu"><li><div class="mega-menu-content disable-icons" style="padding: 4px 15px;"><div class="container" style="width: 800px !important;"><div class="row equal-height" style="display: flex;">';
            var count = 0;
            var md = 12 / ((buttons.join().match(/\|/g) || []).length + 1);
            buttons.forEach(function(item) {
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

    function supportInit(){
    	if($(injects.claim_report).length == 0){
    		var select = $('select[name=visibility]');
    		$(select).find('option:selected').removeProp('selected');
    		$(select).find('option[value=Private]').prop('selected', 'selected');
    	}
    }

    function val_init() {
        var steamapi, OwnReasons, OwnDates, last_version;
        return new Promise(function(resolve) {
            storage.get({
                steamapi: null,
                OwnReasons: null,
                OwnDates: null,
                last_version: chrome.runtime.getManifest().version,
                settings: {}
            }, function(items) {
                resolve(items);
            });
        });
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
		$('#confirm-accept > div > div > form > div.modal-body > div:nth-child(6) > input').bind('paste', function(e) {
			var self = this,
				data = e.originalEvent.clipboardData.getData('Text').trim(),
				dataLower = data.toLowerCase();
			if((dataLower.indexOf('http://') == 0 || dataLower.indexOf('https://') == 0) && !checkDoubleSlash(this) && settings.autoinsertsep){
				e.preventDefault();
				insertAtCaret($(self)[0], '- ' + data);
			}
		});
	}

    /*
        INIT SCRIPT
     */

    function init() {
        val_init().then(function(v) {
            if (v.OwnReasons == null || v.OwnDates == null) {
                alert("Hello! Looks like this is your first try in Reports Improved (or just new version)! I'll open the settings for you...");
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
                }
            } else {
                // console.log(v);
                OwnReasons = v.OwnReasons;
                OwnDates = v.OwnDates;
                last_version = v.last_version;
                steamapi = v.steamapi;
                settings = v.settings;
                version_checker(last_version);
                content_links();
                comment_language();
                bans_count_fetch();
                table_impoving();
                comments_nice_look();
                accept_modal_init();
                decline_modal_init();
                dropdown_enchancements();
                supportInit();
                bannedInit();
                evidencePasteInit();
                final_init();
            }
        }).catch(function(v) {
            console.error(v);
        });
    }
    init();
}
