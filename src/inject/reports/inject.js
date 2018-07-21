function inject_init() {
  var steam_id = $('input[name="steam_id"]').val();

  console.log(steam_id)
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
      table: $('#bans > #ban > div:nth-child(1) > table.table.table-responsive > tbody > tr'),
      header: $('#bans > div:nth-child(1) > h4'),
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

  // Fixes word dates
  var day = 60 * 60 * 24 * 1000;
  var fixDate = function (date) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var d = new Date();
    date = date.replace('Today,', d.getDate() + ' ' + months[d.getMonth()]);

    var yesterday = new Date(d);
    yesterday.setTime(d.getTime() - day);
    date = date.replace('Yesterday,', yesterday.getDay() + ' ' + months[d.getMonth()]);

    var tomorrow = new Date(d);
    tomorrow.setTime(d.getTime() + day);
    date = date.replace('Tomorrow,', tomorrow.getDay() + ' ' + months[d.getMonth()]);

    if (!date.match(/20[0-9]{2}/)) {
      date += " " + (new Date()).getFullYear();
    }

    return date;
  };

  // Escape HTML due to HTML tags in Steam usernames
  function escapeHTML(s) {
    return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function accept_modal_init() {
    var reasonMax = 190;
    $("<div id='reasonCount'>0/" + reasonMax + "</div>").insertAfter(injects.accept.reason);
    var reasonCount = $('#reasonCount');

    addButtons($('input[name=reason]'), '<div class="ban-reasons">' + construct_buttons('accept') + '</div>');
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
    var unban_time = moment.utc();
    if ($('#datetimeselect').val().length) {
      unban_time = moment($('#datetimeselect').val())
    }
    console.log(unban_time);
    $('.plusdate').on("click", function (event) {
      event.preventDefault();
      var number = $(this).data('number');
      switch (number) {
        case 'clear':
          unban_time = moment.utc();
          break;
        default:
          var key = $(this).data('key');
          unban_time.add(number, key);
          break;
      }
      injects.accept.time.val(unban_time.format("YYYY-MM-DD HH:mm"));
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
          $("input[id='decline.rating.negative']").prop("checked", true);
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

  $("body").append("<div class='modal fade ets2mp-modal' id='videoModal' tabindex='-1' role='dialog' aria-labelledby='videoModalLabel' aria-hidden='true'><div class='modal-dialog modal-lg' role='document'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title' id='videoModalLabel'>Video preview</h4></div><div class='modal-body' style='padding:0;'></div></div></div></div>");

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
          comment = 'Wir bedanken uns für deinen Report :) Es ist zu bedenken, dass die zur Verfügung gestellten Beweise sowohl für die gesamte Dauer des Banns als auch einen Monat darüber hinaus verfügbar sein müssen.';
          break;
        case 'Turkish':
          comment = 'Raporunuz için teşekkürler :) Lütfen sunduğunuz kanıtın, yasağın uygulandığı ve takiben gelen bir(1) aylık süreç boyunca kullanılabilir olması gerektiğini lütfen unutmayın.';
          break;
        case 'Norwegian':
          comment = 'Takk for rapporten :) Vennligst husk at bevis må være tilgjengelig for hele bannlysningspreioden pluss 1 måned';
          break;
        case 'Spanish':
          comment = 'Muchas gracias por tu reporte :) Recuerda que las pruebas/evidencias deben estar disponibles durante toda la vigencia de la prohibicion y más 1 mes.';
          break;
        case 'Dutch':
          comment = 'Bedankt voor je rapport :) Onthoud alsjeblieft dat het bewijs beschikbaar moet zijn voor de volledige lengte van de ban PLUS 1 maand.';
          break;
        case 'Polish':
          comment = 'Dziękuję za report :) Proszę pamiętać o tym że dowód musi być dostępny przez cały okres bana, plus jeden miesiąc. ';
          break;
        case 'Russian':
          comment = 'Спасибо за репорт :) Помните, что доказательства должны быть доступны весь период бана ПЛЮС 1 месяц.';
          break;
        case 'French':
          comment = 'Merci pour votre rapport :) Notez que la preuve doit être disponible durant toute la durée du ban PLUS 1 mois.';
          break;
        case 'Lithuanian':
          comment = 'Thank you for your report :) Please, remember that evidence must be available for the full duration of the ban PLUS 1 month.';
          break;
        case 'Portuguese':
          comment = 'Obrigado por seu relatório :) Por favor, lembre-se que as provas devem estar disponíveis para a duração total da proibição MAIS 1 mês.';
          break;
        default:
          comment = 'Thank you for your report :) Please, remember that evidence must be available for the full duration of the ban PLUS 1 month.';
      }
    } else {
      comment = settings.own_comment;
    }
    injects.accept.comment.val(comment);
  }

  function bans_count_fetch() {

    function getUnbanTime(unban_time_td, banned_reason_td) {
      var unban_time;
      now = moment.utc();
      if (unban_time_td.indexOf("Today") !== -1) {
        unban_time = now;
      } else if (unban_time_td.indexOf("Tomorrow") !== -1) {
        unban_time = now.add(1, 'd');
      } else if (unban_time_td.indexOf("Yesterday") !== -1) {
        unban_time = now.add(1, 'd');
      } else {
        nb_parts = unban_time_td.split(" ").length;
        if (nb_parts == 3) {
          unban_time = moment(unban_time_td, "DD MMM HH:mm");
        } else if (nb_parts == 4) {
          unban_time = moment(unban_time_td, "DD MMM YYYY HH:mm");
        } else {
          unban_time = moment(unban_time_td);
          console.log([
            unban_time_td,
            nb_parts,
            unban_time
          ]);
        }
      }
      if (unban_time.year() == '2001') {
        unban_time.year(now.year());
      }
      if (banned_reason_td == '@BANBYMISTAKE') {
        unban_time.year('1998');
      }

      return unban_time;
    }

    var bans_count = 0;
    var expired_bans_count = 0;
    var nb_parts;
    injects.bans.table.each(function () {
      var ban_time_td = $(this).find('td:nth-child(1)').text();
      var unban_time_td = $(this).find('td:nth-child(2)').text();
      var banned_reason_td = $(this).find('td:nth-child(3)').text();
      var unban_time;
      if (unban_time_td == "Never") {
        unban_time = getUnbanTime(ban_time_td, banned_reason_td);
      } else {
        unban_time = getUnbanTime(unban_time_td, banned_reason_td);
      }
      if (unban_time.isValid()) {
        if (Math.abs(unban_time.diff(now, 'd')) >= 365) {
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
  }

  function table_improving() {
    $('table').addClass('table-condensed table-hover');

    var perpetrator_id = injects.summary.perpetrator_link.attr('href').replace('/user/', '');
    var perpetrator_nickname = injects.summary.perpetrator_link.text();
    var reporter_id = $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a').attr('href').replace('/user/', '');

    $(document).prop('title', perpetrator_nickname.replace(/(.*)Change$/, '$1') + ' - ' + perpetrator_id + ' | TruckersMP');

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
        }
      });
    }

    $.ajax({
      url: "https://api.truckersmp.com/v2/player/" + perpetrator_id,
      type: "GET",
      success: function (tmp_data) {
        if (tmp_data !== true) {
          injects.summary.perpetrator_link.after(' <img src="' + tmp_data.response['avatar'] + '" class="img-rounded" style="width: 32px; height: 32px;">');
          injects.summary.perpetrator_link.wrap('<kbd>');

          var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">' + steam_id + '</a></kbd></td></tr>';
          if (typeof steam_data !== 'undefined') {
            var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">Steam Profile</a></kbd> <img src="' + steam_data.response['players'][0]['avatar'] + '" class="img-rounded"></td></tr>';
          }
          $(steam_link).insertAfter('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2)');

          injects.summary.perpetrator_label.css('text-align', 'right');
          injects.summary.previous_usernames.css('text-align', 'right');

          $('td kbd').each(function () {
            $(this).html($(this).html().trim())
          })

          injects.summary.first_column.each(function () {
            $(this).css('font-weight', 'bold');
          });
          $('[data-toggle="tooltip"]').tooltip();
          $("#loading-spinner").hide();
        }
      }
    })

    var low_id;
    if (perpetrator_id <= 4200) {
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
      $('#reports > #report > div:nth-child(1) > table').find('a:contains("View report")').prop('target', '_blank');
    else
      $('#reports > #report > div:nth-child(1) > table').find('a:contains("View report")').prop('target', '');
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
        html += " " + each_type_new('Prefixes', OwnReasons.prefixes);
        html += " " + each_type_new('Postfixes', OwnReasons.postfixes);
        html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>';
        break;

      case "decline":
        html += each_type_new('Declines', OwnReasons.declines);
        html += " " + each_type_new('Declines (Positive)', OwnReasons.declinesPositive);
        html += " " + each_type_new('Declines (Negative)', OwnReasons.declinesNegative);
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
      var md = 12 / (Math.max(buttons.length, 1));
      $.each(buttons, function (key, val) {
        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">';
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="' + encodeURI(item.trim()) + '">' + item.trim() + '</a></li>';
          });
        } else {
          $.each(val, function (title, item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="' + encodeURI(item.trim()) + '">' + title.trim() + '</a></li>';
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

    /* rateAccept.find("input[id='accept.rating.positive']").prop("checked", true); */

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
    var videoBtns = $(".video");
    var videoModal = $("#videoModal");
    videoBtns.click(function (e) {
      e.preventDefault();
      videoModal.find(".modal-body").html("<div class='embed-responsive-16by9 embed-responsive'><iframe src='" + $(this).attr('href') + "' width='640' height='480' frameborder='0' scrolling='no' allowfullscreen='true' style='padding:0; box-sizing:border-box; border:0; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; margin:0.5%; width: 99%; height: 98.5%;'></iframe></div>");
      videoModal.modal('show');
    });
    videoModal.on("hidden.bs.modal", function () {
      videoModal.find(".modal-body").html("");
    });

    if (settings.enablebanlength === true) {
      $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2)').append('<hr class="small" /><h4>Recommended Ban length</h4><div style="display: flex"><div class="col-md-12"><div class="text-center"><div class="loading-for-bans" style="display: none;">Loading...</div><a class="btn btn-block btn-success" href="#" id="check-ban-length">Check the recommended length of the next ban</a></div></div>');
    }
    $('#check-ban-length').click(function (e) {
      e.preventDefault();
      $("#loading-spinner").show();
      $('#check-ban-length').remove();
      $('div.loading-for-bans').show();

      var userProfileLink = $(injects.summary.perpetrator_link).attr('href');
      $.ajax({
        url: "https://truckersmp.com" + userProfileLink,
        type: "GET",
        success: function (data) {
          // Gets all bans
          var bans = $(data).find('.profile-body .panel-profile:nth-child(4) .timeline-v2 li');
          var activeBans = 0,
            bans1m = 0,
            bans3m = 0;
          var active1m = false,
            active3m = false;
          // If the user is banned
          var banned = false;
          if ($(data).find('.profile-body .panel-profile .profile-bio .label-red').text() === 'Banned') {
            banned = true;
          }

          $.each(bans, function (index, ban) {
            // @BANBYMISTAKE is not counted
            var reason = $(ban).find('.cbp_tmlabel > .autolink').text().split(' : ')[1];
            if (reason === '@BANBYMISTAKE' || $(ban).find('.cbp_tmicon').css('background-color') === "rgb(255, 0, 38)") {
              return;
            }

            var date = $(ban).find('.cbp_tmtime span:last-of-type').text();
            var issuedOn = Date.parse(fixDate(date));
            var dateExp = $(ban).find('.cbp_tmlabel > .autolink + p').text().split(' : ')[1];
            if (dateExp === 'Never') {
              dateExp = date;
            }
            var expires = Date.parse(fixDate(dateExp));

            if (expires - issuedOn >= day * 85) {
              bans3m++;
            } else if (expires - issuedOn >= day * 27) {
              bans1m++;
            }
            if ((new Date()).getTime() - day * 365 <= expires) {
              activeBans++;
              if (expires - issuedOn >= day * 85) {
                active3m = true;
              } else if (expires - issuedOn >= day * 27) {
                active1m = true;
              }
            }
          });

          var html = '<div class="col-md-6 text-center" style="align-self: center"><kbd';
          if (banned) {
            html += ' style="color: rgb(212, 63, 58)">The user is already banned! However, the length can be extended!</kbd><br />Length of the next ban: <kbd';
          }
          // Length checks
          if ((bans3m >= 2) || (activeBans >= 5 && active3m && active1m)) {
            html += ' style="color: rgb(212, 63, 58)">Permanent';
          } else if (bans1m >= 2 || (activeBans >= 4 && active1m)) {
            html += ' style="color: rgb(212, 63, 58)">3 months';
          } else if (activeBans >= 3) {
            html += ' style="color: rgb(212, 63, 58)">1 month';
          } else {
            html += '>You can choose :)';
          }
          html += '</kbd></div>';
          // Information
          html += '<div class="col-md-6 text-center">';
          html += 'Banned: <kbd' + (banned ? ' style="color: rgb(212, 63, 58)">yes' : '>no') + '</kbd><br />';
          html += 'Active bans: ' + activeBans + '<br />';
          html += '1 month bans: ' + bans1m + '<br />';
          html += '3 month bans: ' + bans3m + '<br />';
          html += 'Active 1 month ban: ' + active1m + '<br />';
          html += 'Active 3 month ban: ' + active3m;
          html += '<br/><br/></div><div class="text-center"><em>This tool is very accurate, but please check the profile to avoid mistakes.</em></div></div>';
          $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2)').append(html);

          $("#loading-spinner").hide();
          $('div.loading-for-bans').hide();
        }
      });
    });

  });
  if (typeof steam_id !== 'undefined') {
    init();
  } else {
    injects.spinner.remove();
    alert('Deleted User detected! Extension is not working!\n\nYou should decline it for now (as HumaneWolf suggested)')
  }


  $('.pluscomment').on('click', function (event) {
    event.preventDefault();
    setReason($('form').find('textarea').not($('.modal-body').find('textarea')), decodeURI(String($(this).data("text"))));
  });

  $('button#comments_clear').on('click', function (event) {
    event.preventDefault();
    $('form').find('textarea[name=comment]').val("");
  });


}
