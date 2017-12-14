function inject_init() {
  var steam_id = $('input[name="steam_id"]').val();
  var accept_modal = $('#confirm-accept');
  var decline_modal = $('#confirm-decline');
  var injects = {
    header: $('body > div.wrapper > div.breadcrumbs > div > h1'),
    date_buttons: accept_modal.find('div > div > form > div.modal-body > div:nth-child(5) > label:nth-child(4)'),
    report_language: $('div.container.content > div > div > div > table.table > tbody > tr:nth-child(8) > td:nth-child(2)'),
    claim_report: $('div.container.content > div > div > div > table.table > tbody > tr:nth-child(10) > td:nth-child(2) > a'),
    spinner: $("#loading-spinner"),
    accept: {
      comment: accept_modal.find('div > div > form > div.modal-body > div:nth-child(7) > textarea'),
      form: accept_modal.find('div > div > form'),
      time: $('#datetimeselect'),
      reason: accept_modal.find('div > div > form > div.modal-body > div:nth-child(6) > input')
    },
    bans: {
      table: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr'),
      header: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > h4:nth-child(4)'),
      ban_toggler: $('#expired_bans_toggler').find('i')
    },
    decline: {
      comment: decline_modal.find('div > div > form > div.modal-body > div > textarea'),
      form: decline_modal.find('div > div > form')
    },
    summary: {
      first_column: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr > td:nth-child(1)'),
      perpetrator_link: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a'),
      perpetrator_label: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)'),
      previous_usernames: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)')
    }
  };

  // Escape HTML due to HTML tags in Steam usernames
  function escapeHTML(s) {
    return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function accept_modal_init() {
    var reasonMax = 190;
    $("<div id='reasonCount'>0/" + reasonMax + "</div>").insertAfter(injects.accept.reason);
    var reasonCount = $('#reasonCount');

    addButtons($('input[name=reason]'),'<div class="ban-reasons">' + construct_buttons('accept') + '</div>');
    addButtons($('div.container.content').find('textarea[name=comment]'), construct_buttons('comments'));

    var date_buttons = construct_dates(OwnDates);
    $(date_buttons).insertAfter(injects.date_buttons);
    $('input[id="perma.false"]').prop("checked", true);
  
    // ===== DateTime and Reason inputs checking =====
    injects.accept.form.on('submit', function (event) {
      var time_check = injects.accept.time.val();
      var perm_check = $('input[id="perma.true"]').prop("checked");
      var reason_check = injects.accept.reason.val();
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
        injects.accept.time.css(error_style);
        event.preventDefault();
      } else {
        injects.accept.time.css(normal_style);
      }
      if (!reason_check) {
        injects.accept.reason.css(error_style);
        event.preventDefault();
      } else {
        injects.accept.reason.css(normal_style);
      }
    });
    // ===== Reasons FTW =====
    $('.plusreason').on('click', function (event) {
      event.preventDefault();
    
      var reason_val = injects.accept.reason.val(),
        sp = '';
      if (!checkDoubleSlash(injects.accept.reason[0]))
        sp = (settings.separator) ? settings.separator : ',';
    
      if ($(this).data('place') == 'before') {
        injects.accept.reason.val(decodeURI(String($(this).data("text"))) + ' ' + reason_val.trim() + ' ');
      } else if ($(this).data('place') == 'after-wo') {
        injects.accept.reason.val(reason_val.trim() + ' ' + decodeURI(String($(this).data("text"))) + ' ');
      } else if (reason_val.length) {
        injects.accept.reason.val(reason_val.trim() + sp + ' ' + decodeURI(String($(this).data("text"))) + ' ');
      } else {
        injects.accept.reason.val(decodeURI(String($(this).data("text"))) + ' ');
      }
      injects.accept.reason.focus();
      checkReasonLength();
    });
    $('button#reason_clear').on('click', function (event) {
      event.preventDefault();
      injects.accept.reason.val("");
    });
    // ===== Timing FTW! =====
    $('.plusdate').on("click", function (event) {
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
      injects.accept.time.val(now.format("YYYY/MM/DD HH:mm"));
    });
  
    //Ban reason length check
    function checkReasonLength() {
      if (injects.accept.reason.val().length > reasonMax) {
        injects.accept.reason.css({
          'background-color': 'rgba(255, 0, 0, 0.5)',
          'color': '#fff'
        });
        reasonCount.css({
          'color': 'red',
          'font-weight': 'bold'
        });
        } else {
        reasonCount.css({
          'color': '',
          'font-weight': ''
        });
        injects.accept.reason.css({
          'background-color': '',
          'color': ''
        });
      }
      reasonCount.html(injects.accept.reason.val().length + "/" + reasonMax);
    }
  
    injects.accept.reason.keyup(function () {
      checkReasonLength();
    });
  }

  function decline_modal_init() {
    addButtons(injects.decline.comment, construct_buttons('decline'));

    injects.decline.form.on('submit', function (event) {
      var comment_check = injects.decline.comment.val();
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
        injects.decline.comment.css(error_style);
        event.preventDefault();
      } else {
        injects.decline.comment.css(normal_style);
      }
    });
    $('.plusdecline').on('click', function (event) {
      event.preventDefault();
      setReason(injects.decline.comment, decodeURI(String($(this).data("text"))));

      switch ($(this).data('action')) {
        case "negative":
          $("input[id='decline.rating.negative']").prop("checked",true);
          break;

        case "positive":
          $("input[id='decline.rating.positive']").prop("checked", true);
          break;
      }
      injects.decline.comment.focus();
    });
    
    $('button#decline_clear').on('click', function (event) {
      event.preventDefault();
      injects.decline.comment.val("");
    });
  }
  
  function setReason(reason, reason_val) {
    if ($(reason).val() == "") {
      $(reason).val(reason_val + ' ');
    } else {
      $(reason).val($(reason).val().trim() + ' ' + reason_val + ' ');
    }
    $(reason).focus();
  }
  
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
        var start = params.t[0];
        if (start.includes('s')) {
          var hrs, min, sec;

          var spl = start.split('h');
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
      } else if (params['time_continue']) {
        start = params['time_continue'][0];
      } else {
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
    $('.autolink > a').each(function () {
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
        if (sub.contains(['.png', '.jpg', ".gif", "images.akamai."])) {
          $('<img src="' + sub + '" class="img-responsive img-thumbnail" alt="' + sub + '"><br>').insertBefore($(this));
        }
      });
    }

    $('a.jmdev_ca').on('click', function (event) {
      event.preventDefault();
      $(injects.spinner).show();
      var link = $(this).data("link");
      var length = ($(this).data("link")).length;

      if (length < 30) {
        copyToClipboard($(this).data("link"));
        chrome.runtime.sendMessage({
          msg: "This URL is short enough. Check your clipboard!"
        });
        $("#loading-spinner").hide();
      } else {
        if (link.includes('youtube.com') || link.includes('youtu.be')) {
          copyToClipboard('https://youtu.be/' + getYouTubeIdFromUrl(link) + checkTimestamps(link));
          chrome.runtime.sendMessage({
            msg: "URL just being shorted! Check your clipboard!"
          });
        } else {
          urlShorter(link);
        }
      }
    });
  }

  function urlShorter(link, paste = false) {
    var msg;
    $.ajax({
      url: "https://www.jmdev.ca/url/algo.php?method=insert&url=" + encodeURIComponent(link),
      type: 'GET',
      success: function (val) {
        if (val.result['url_short'] === undefined || val.result['url_short'] === null) {
          alert('Looks like we have a problem with URL shortener... Try again!');
        } else {
          copyToClipboard('https://jmdev.ca/url/?l=' + val.result['url_short']);

          if (paste) {
            msg = "Steam info just saved! Check your clipboard for the link!"
          } else {
            msg = "URL just being shorted! Check your clipboard!";
          }
        }
      },
      error: function () {
        if (paste) {
          copyToClipboard(link);
          alert('Steam info just saved! Check your clipboard for the link!');
        } else {
          alert('Looks like we have a problem with URL shortener... Try again!');
        }
      },
      complete: function () {
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
    input.style.opacity = "0";
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
  }

  function comment_language() {
    var report_language = injects.report_language.text().trim();
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
    injects.accept.comment.val(comment);
  }

  function bans_count_fetch() {
    var bans_count = 0;
    var expired_bans_count = 0;
    var nb_parts;
    injects.bans.table.each(function () {
      var banned_time_td = $(this).find('td:nth-child(2)').text();
      var banned_reason_td = $(this).find('td:nth-child(3)').text();
      var banned_time;
      if (banned_time_td.indexOf("Today") !== -1) {
        banned_time = now;
      } else if (banned_time_td.indexOf("Tomorrow") !== -1) {
        banned_time = now.add(1, 'd');
      } else if (banned_time_td.indexOf("Yesterday") !== -1) {
        banned_time = now.add(1, 'd');
      } else {
        nb_parts = banned_time_td.split(" ").length;
        if (nb_parts = 3) {
          banned_time = moment(banned_time_td, "DD MMM HH:mm");
        } else if (nb_parts == 4) {
          banned_time = moment(banned_time_td, "DD MMM YYYY HH:mm");
        } else {
          banned_time = moment(banned_time_td);
          console.log([
            banned_time_td,
            nb_parts,
            banned_time
          ]);
        }
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

    injects.bans.header.html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small>');
    if (bans_count >= 3) {
      injects.bans.header.css('color', '#d43f3a');
    }
    if (expired_bans_count > 0) {
      injects.bans.header.html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small> <a href="#" id="expired_bans_toggler"><i class="fa fa-toggle-off" data-toggle="tooltip" title="Show/hide bans further than 12 months and @BANBYMISTAKE"></i></a>');
      $('#expired_bans_toggler').on('click', function (event) {
        event.preventDefault();
        $('.expired_bans').fadeToggle('slow');
        if (injects.bans.ban_toggler.hasClass('fa-toggle-off')) {
          injects.bans.ban_toggler.removeClass('fa-toggle-off');
          injects.bans.ban_toggler.addClass('fa-toggle-on');
        } else {
          injects.bans.ban_toggler.removeClass('fa-toggle-on');
          injects.bans.ban_toggler.addClass('fa-toggle-off');
        }
      });
    }

    if ($('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2) > td:nth-child(5) > i').hasClass('fa-check')) {
      $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2)').find('td').css({
        'color': '#d43f3a'
      });
    }
    injects.bans.header.before('<hr class="small"/>');
  }

  function table_improving() {
    $('table').addClass('table-condensed table-hover');
    $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > div:nth-child(1)').after('<hr class="small"/>');

    var perpetrator_id = injects.summary.perpetrator_link.attr('href').replace('/user/', '');
    var perpetrator_nickname = injects.summary.perpetrator_link.text();
    var reporter_id = $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a').attr('href').replace('/user/', '');

    $(document).prop('title', perpetrator_nickname + ' - ' + perpetrator_id + ' | TruckersMP');

    if (steamapi === "none") {
      $("#loading-spinner").hide();
      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    } else if (steamapi !== null && steamapi != "https://steamcommunity.com/dev/apikey") {
      $.ajax({
        url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + steamapi + "&format=json&steamids=" + steam_id,
        type: 'GET',
        success: function (steam_data) {
          if (steam_data === undefined) {
            $("#loading-error").show();
            $("#loading-spinner").hide();
            return;
          }

          var steam_name = escapeHTML(steam_data.response['players'][0]['personaname']);
          $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('TruckersMP');

          $.ajax({
            url: "https://api.truckersmp.com/v2/player/" + perpetrator_id,
            type: "GET",
            success: function (tmp_data) {
              if (tmp_data !== true) {
                injects.summary.perpetrator_link.after(' <img src="' + tmp_data.response['avatar'] + '" class="img-rounded" style="width: 32px; height: 32px;">');
                injects.summary.perpetrator_link.wrap('<kbd>');

                var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">' + steam_name + '</a></kbd> <img src="' + steam_data.response['players'][0]['avatar'] + '" class="img-rounded"></td></tr>';
                $(steam_link).insertAfter('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2)');

                injects.summary.perpetrator_label.css('text-align', 'right');
                injects.summary.previous_usernames.css('text-align', 'right');

                injects.summary.first_column.each(function () {
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

    var low_id;
    if (perpetrator_id <= 3500) {
      low_id = ' <span class="badge badge-red" data-toggle="tooltip" title="Be careful! Perpetrator ID seems to be an In-Game ID. Double-check names & aliases">Low ID! <strong>' + perpetrator_id + '</strong></span>';
    } else if (perpetrator_id == reporter_id) {
      low_id = ' <span class="badge badge-red" data-toggle="tooltip" title="Be careful! Perpetrator ID is the same as Reporter ID"> Same IDs! <strong>' + perpetrator_id + '</strong></span>';
    } else {
      low_id = ' <span class="badge badge-u" data-toggle="tooltip" title="ID is legit">ID ' + perpetrator_id + '</span>';
    }
    $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)').append(low_id);
    $('input[type=radio][name=perma]').change(function () {
      if (this.id == 'perma.true') {
        $('#ownreasons_buttons').slideUp('fast');
        $(injects.accept.time).slideUp('fast');
        $('label[for=\'perma.true\']').addClass('text-danger').addClass('lead').addClass('text-uppercase');
      } else if (this.id == 'perma.false') {
        $('#ownreasons_buttons').slideDown('fast');
        $(injects.accept.time).slideDown('fast');
        $('label[for=\'perma.true\']').removeClass('text-danger').removeClass('lead').removeClass('text-uppercase');
      }
    });
    $('input[name=reason]').attr('autocomplete', 'off');
    $('input[name=expire]').attr('autocomplete', 'off');

  }

  function comments_nice_look() {
    $(".comment > p").each(function () {
      $('<hr style="margin: 10px 0 !important;">').insertAfter(this);
      $(this).wrap("<blockquote></blockquote>");
      if (!$(this).text().length) {
        $(this).html('<i>Empty comment</i>');
      }
    });
  }

  function dropdown_enchancements() {
    $('ul.dropdown-menu').css('top', '95%');
    $(".dropdown").hover(function () {
      $('.dropdown-menu', this).stop(true, true).fadeIn("fast");
      $(this).toggleClass('open');
      $('b', this).toggleClass("caret caret-up");
    }, function () {
      $('.dropdown-menu', this).stop(true, true).fadeOut("fast");
      $(this).toggleClass('open');
      $('b', this).toggleClass("caret caret-up");
    });
    $("a.hovery").hover(function (e) {
      $(this).css("background", e.type === "mouseenter" ? "#303030" : "transparent");
      $(this).css("color", e.type === "mouseenter" ? "#999!important" : "");
    });
  }

  function bannedInit() {
    var isBanned = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(2) > table').find('i.fa-check');
    if (isBanned.length > 0) {
      var perpetrator = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
      $(perpetrator).append('<span class="badge badge-red badge-banned">Banned</span>');
    }
  }

  function viewReportBlankInit() {
    if (settings.viewreportblank)
      $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(2) > table').find('a:contains("View report")').prop('target', '_blank');
  }
  
  function construct_buttons(type) {
    var html = '';
    switch (type) {
      case "comments":
        html += each_type_new('Comments', OwnReasons.comments);
        html += '<button type="button" class="btn btn-link" id="comments_clear">Clear</button>';
        break;
  
      case "accept":
        html += each_type_new('Reasons', OwnReasons.reasons);
        html += each_type_new('Prefixes', OwnReasons.prefixes);
        html += each_type_new('Postfixes', OwnReasons.postfixes);
        html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>';
        break;
  
      case "decline":
        html += each_type_new('Declines', OwnReasons.declines);
        html += each_type_new('Declines (Positive)', OwnReasons.declinesPositive);
        html += each_type_new('Declines (Negative)', OwnReasons.declinesNegative);
        html += '<button type="button" class="btn btn-link" id="decline_clear">Clear</button>';
        break;
    }
    
    return html;

    function each_type_new(type, buttons) {
      var place, color, change, action;
      switch (type) {
        case 'Prefixes':
          place = 'before';
          color = 'warning';
          change = 'reason';
          action = '';
          break;

        case 'Reasons':
          place = 'after';
          color = 'default';
          change = 'reason';
          action = '';
          break;

        case 'Postfixes':
          place = 'after-wo';
          color = 'danger';
          change = 'reason';
          action = '';
          break;

        case 'Declines':
          place = 'after';
          color = 'info';
          change = 'decline';
          action = '';
          break;

        case 'Declines (Positive)':
          place = 'after';
          color = 'warning';
          change = 'decline';
          action = 'positive';
          break;

        case 'Declines (Negative)':
          place = 'after';
          color = 'danger';
          change = 'decline';
          action = 'negative';
          break;

        case 'Comments':
          place = 'after';
          color = 'u';
          change = 'comment';
          action = '';
          break;
      }
      var snippet = '<div class="btn-group dropdown mega-menu-fullwidth"><a class="btn btn-' + color + ' dropdown-toggle" data-toggle="dropdown" href="#">' + type + ' <span class="caret"></span></a><ul class="dropdown-menu"><li><div class="mega-menu-content disable-icons" style="padding: 4px 15px;"><div class="container" style="width: 800px !important;"><div class="row equal-height" style="display: flex;">';
      var md = 12 / (Math.max(buttons.length,1));
      $.each(buttons, function (key,val) {
        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">';
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="'+encodeURI(item.trim())+'">' + item.trim() + '</a></li>';
          });
        } else {
          $.each(val, function (title, item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="'+encodeURI(item.trim())+'">' + title.trim() + '</a></li>';
          });
        }
        snippet += '</ul></div>';
      });
      snippet += '</div></div></div></li></ul></div>     ';
      return snippet;
    }
  }
  
  function supportInit() {
    if (injects.claim_report.length == 0) {
      var select = $('select[name=visibility]');
      $(select).find('option:selected').removeProp('selected');
      $(select).find('option[value=Private]').prop('selected', 'selected');
    }
  }

  function evidencePasteInit() {
    injects.accept.reason.bind('paste', function (e) {
      var self = this,
        data = e.originalEvent.clipboardData.getData('Text').trim(),
        dataLower = data.toLowerCase();
      if ((dataLower.indexOf('http://') == 0 || dataLower.indexOf('https://') == 0) && !checkDoubleSlash(this) && settings.autoinsertsep) {
        e.preventDefault();
        insertAtCaret($(self)[0], '- ' + data, true);
      }
    });
  }

  function fixModals() {
    var path = "div.modal-body > div.form-group:last-child";
    
    var rateAccept = injects.accept.form.find(path);
    rateAccept.find("input[id='rating.positive']").attr("id", "accept.rating.positive");
    rateAccept.find("input[id='rating.negative']").attr("id", "accept.rating.negative");
    rateAccept.find("label[for='rating.positive']").attr("for", "accept.rating.positive");
    rateAccept.find("label[for='rating.negative']").attr("for", "accept.rating.negative");

    rateAccept.find("input[id='accept.rating.positive']").prop("checked", true);

    var rateDecline = injects.decline.form.find(path);
    rateDecline.find("input[id='rating.positive']").attr("id", "decline.rating.positive");
    rateDecline.find("input[id='rating.negative']").attr("id", "decline.rating.negative");
    rateDecline.find("label[for='rating.positive']").attr("for", "decline.rating.positive");
    rateDecline.find("label[for='rating.negative']").attr("for", "decline.rating.negative");
  }

  function addButtons(textArea, html) {
    if (typeof textArea !== 'undefined' && html.length > 0) {
      $(textArea).css('margin-bottom', '10px');
      $(html).insertAfter(textArea);
    }
  }

  /*
      INIT SCRIPT
   */

  function init() {
    content_links();
    comment_language();
    bans_count_fetch();
    table_improving();
    comments_nice_look();
    accept_modal_init();
    decline_modal_init();
    dropdown_enchancements();
    supportInit();
    bannedInit();
    viewReportBlankInit();
    evidencePasteInit();
    fixModals();
  }
  var now = moment.utc(); // Moment.js init
  $(document).ready(function () {
      if (settings.wide !== false) {
          $('div.container.content').css('width', '85%');
      }
      $(".youtube").YouTubeModal({
          autoplay: 0,
          width: 640,
          height: 480
      });
  });
  init();
  
  $('.pluscomment').on('click', function (event) {
    event.preventDefault();
    setReason($('form').find('textarea').not($('.modal-body').find('textarea')), decodeURI(String($(this).data("text"))));
  });
  
  $('button#comments_clear').on('click', function (event) {
    event.preventDefault();
    $('form').find('textarea[name=comment]').val("");
  });
  
  
}