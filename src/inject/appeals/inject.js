let inject_init = () => { // eslint-disable-line no-unused-vars
  // var steam_id = $('input[name="steam_id"]').val();
  var steam_id = 0;
  var perpetrator_link = $('body > div.wrapper > div.container.content > div.row > div.row > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a')
  console.log('TMP Improved (inject/appeals)', perpetrator_link)

  var injects = {
    header: $('body > div.wrapper > div.breadcrumbs > div > h1'),
    spinner: $("#loading-spinner"),
    accept: $('#confirm-accept'),
    decline: $('#confirm-decline'),
    modify: $('#confirm-modify'),
    reason: $('input[name="reason"]'),
    summary: {
      perpetrator_link: $('.summary > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'),
    }
  };

  function construct_buttons(type) {
    var html = '';
    switch (type) {
      case "comments":
        html += each_type_new('Comments', OwnReasons.commentsAppeals);
        html += '<button type="button" class="btn btn-link" id="comments_clear">Clear</button>';
        break;

      case "declines":
        html += each_type_new('Declines', OwnReasons.declinesAppeals);
        html += '<button type="button" class="btn btn-link" id="decline_clear">Clear</button>';
        break;

      case "accepts":
        html += each_type_new('Accepts', OwnReasons.acceptsAppeals);
        html += '<button type="button" class="btn btn-link" id="accept_clear">Clear</button>';
        break;

      case "reasons":
        html += each_type_new('Reasons', OwnReasons.reasons);
        html += " " + each_type_new('Prefixes', OwnReasons.prefixes);
        html += " " + each_type_new('Postfixes', OwnReasons.postfixes);
        html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>';
        break;

      case "modify":
        html += each_type_new('Modify', OwnReasons.modifyAppeals);
        html += '<button type="button" class="btn btn-link" id="modify_clear">Clear</button>';
        break;
    }

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
      } else if (type == 'Modify') {
        place = 'after';
        color = 'default';
        change = 'modify';
      } else if (type == 'Postfixes') {
        place = 'after-wo';
        color = 'danger';
        change = 'reason';
      } else if (type == 'Declines') {
        place = 'after';
        color = 'info';
        change = 'decline';
      } else if (type == 'Accepts') {
        place = 'after';
        color = 'u';
        change = 'accept';
      } else if (type == 'Comments') {
        place = 'after';
        color = 'u';
        change = 'comment';
      }
      var snippet = '<div class="btn-group dropdown mega-menu-fullwidth"><a class="btn btn-' + color + ' dropdown-toggle" data-toggle="dropdown" href="#">' + type + ' <span class="caret"></span></a><ul class="dropdown-menu"><li><div class="mega-menu-content disable-icons" style="padding: 4px 15px;"><div class="container" style="width: 800px !important;"><div class="row equal-height" style="display: flex;">';
      var md = 12 / ((buttons.join().match(/\|/g) || []).length + 1);
      $.each(buttons, function (key, val) {
        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">';
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-text="' + encodeURI(item.trim()) + '">' + item.trim() + '</a></li>';
          });
        } else {
          $.each(val, function (title, item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-text="' + encodeURI(item.trim()) + '">' + title.trim() + '</a></li>';
          });
        }
        snippet += '</ul></div>';
      });
      snippet += '</div></div></div></li></ul></div>';
      return snippet;
    }

    return html;
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

  function setReason(reason, reason_val) {
    if ($(reason).val() == "") {
      $(reason).val(reason_val);
    } else {
      $(reason).val($(reason).val() + ' ' + reason_val);
    }
    $(reason).focus();
  }

  function table_impoving() {
    $('table').addClass('table-condensed table-hover');

    // if (steamapi !== null && steamapi !== 'none') {
    //   $.ajax({
    //     url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + steamapi + "&format=json&steamids=" + steam_id,
    //     type: 'GET',
    //     success: function (val) {
    //       if (val === undefined) {
    //         $("#loading-error").show();
    //         injects.spinner.hide();
    //         return;
    //       }
    //       var player_data = val;
    //       var tmpname = summary.find('table > tbody > tr:nth-child(2) > td:nth-child(2)');
    //       var steam_name = escapeHTML(player_data.response.players[0].personaname);
    //       summary.find('table > tbody > tr:nth-child(2) > td:nth-child(1)').text('TruckersMP');
    //       tmpname.html('<kbd>' + tmpname.text() + '</kbd>');

    //       var steam_link = '<tr><td>Steam</td><td> <a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank"><kbd>' + steam_name + '</kbd></a> <img src="' + player_data.response.players[0].avatar + '" class="img-rounded"></td></tr>';
    //       $(steam_link).insertAfter('.summary > table > tbody > tr:nth-child(2)');
    //     }
    //   });
    // }

    var perpetrator_id = perpetrator_link.attr('href').replace('/user/', '');
    $.ajax({
      url: "https://api.truckersmp.com/v2/player/" + perpetrator_id,
      type: "GET",
      success: function (tmp_data) {
        if (tmp_data !== true) {
          perpetrator_link.after(' <img src="' + tmp_data.response['avatar'] + '" class="img-rounded" style="width: 32px; height: 32px;">');
          perpetrator_link.wrap('<kbd>');

          var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">' + steam_id + '</a></kbd></td></tr>';
          if (typeof steam_data !== 'undefined') {
            var steam_link = '<tr><td>Steam</td><td> <kbd><a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank" rel="noreferrer nofollow noopener">Steam Profile</a></kbd> <img src="' + steam_data.response['players'][0]['avatar'] + '" class="img-rounded"></td></tr>';
          }
          $(steam_link).insertAfter('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2)');

          $('[data-toggle="tooltip"]').tooltip();
        }
      }
    })

    $('input[type=radio][name=perma]').change(function () {
      permcheck()
    });
    $('input[name=reason]').attr('autocomplete', 'off');
    $('input[name=expire]').attr('autocomplete', 'off');

    // Adding links to appeals for the same ban
    $.ajax({
      url: "https://truckersmp.com/user/appeals/" + perpetrator_id,
      type: "GET",
      success: function (data) {
        var appeals = $(data).find('div.container.content > div > table.table > tbody > tr:not(:first-of-type)');
        var appealsData = '';
        var reason = $('table > tbody > tr > td:contains("Reason")').parent().find("td:nth-child(2)").text();

        $.each(appeals, function (index, appeal) {
          var appealReason = $(appeal).find('td:first-of-type').text();

          if (appealReason.replace(/\s/g, '') === reason.replace(/\s/g, '')) {
            var link = $(appeal).find('td:last-of-type > a').attr('href');
            var appealId = link.replace('/appeals/view/', '');
            // Same appeals will be skipped; based on their ID
            if (appealId === window.location.href.replace(/[^0-9]+([0-9]+).*/, "$1") || appealReason === '@BANBYMISTAKE') {
              return;
            }

            appealsData += (appealsData !== '' ? '<br />' : '') + '<kbd><a href="' + link + '" target="_blank">#' + appealId + '</a></kbd>';
          }
        });
        if (appealsData === '') {
          appealsData = '<kbd>Not appealed before</kbd>';
        }
        $(".container > .row > .row > div:nth(0) table").append('<tr><td style="font-weight: bold"><a href="/user/appeals/' + perpetrator_id + '/" target="_blank">Previous appeals</a></td><td>' + appealsData + '</td></tr>');

        $("#loading-spinner").hide();
      }
    });
  }

  function aftermath() {
    // $(document).prop('title', $('table.table > tbody > tr:nth-child(1) > td:nth-child(2) > a').text() + '\'s Ban Appeal - TruckersMP');

    $(".comment > p").each(function () {
      $('<hr style="margin: 10px 0 !important;">').insertAfter(this);
      $(this).wrap("<blockquote></blockquote>");
      if (!$(this).text().length) {
        $(this).html('<i>Empty comment</i>');
      }
    });

    if (settings.wide !== false) {
      $('div.container.content').css('width', '85%');
    }

    $(function () {
      $(".youtube").YouTubeModal({
        autoplay: 0,
        width: 640,
        height: 480
      });
    });

    injects.spinner.remove();
  }

  function permcheck() {
    if ($("input[id='perma.true']").prop("checked")) {
      $('#ownreasons_buttons').slideUp('fast');
      $('#datetimeselect').slideUp('fast');
      $('label[for=\'perma.true\']').addClass('text-danger').addClass('lead').addClass('text-uppercase');
    } else {
      $('#ownreasons_buttons').slideDown('fast');
      $('#datetimeselect').slideDown('fast');
      $('label[for=\'perma.true\']').removeClass('text-danger').removeClass('lead').removeClass('text-uppercase');
    }
  }

  function init() {
    $('body > div.wrapper > div.container.content > div > table').addClass('table-condensed table-hover');
    $('body > div.wrapper > div.container.content > div > table > tbody > tr:nth-child(1) > td:nth-child(1)').removeAttr('style');
    $('body > div.wrapper > div.container.content > div > table > tbody > tr > td:nth-child(1)').each(function () {
      $(this).css('font-weight', 'bold');
    });
    
    // Add user's ID to the table
    var banned_id = perpetrator_link.attr('href').replace('/user/', '');
    perpetrator_link.parent().append(' <span class="badge badge-u">ID ' + banned_id + '</span>');

    // $.ajax({
    //   url: "https://api.truckersmp.com/v2/bans/" + steam_id,
    //   type: 'GET',
    //   success: function (val) {
    //     $('#bans-table').find('tbody:last-child').append("<tr style=\"font-weight: bold;\"><th>Banned</th><th>Expires</th><th>Reason</th><th>By</th><th>Active</th></tr>");
    //     $(val.response).each(function () {
    //       var row = '<tr>';

    //       this.timeAdded = moment(this.timeAdded, "YYYY-MM-DD HH:mm:dd");
    //       this.timeAdded = this.timeAdded.format("DD MMM YYYY HH:mm");
    //       row += "<td>" + this.timeAdded + "</td>";

    //       if (this.expiration === null) {
    //         this.expiration = "Never"
    //       } else {
    //         this.expiration = moment(this.expiration, "YYYY-MM-DD HH:mm:dd");
    //         this.expiration = this.expiration.format("DD MMM YYYY HH:mm");
    //       }
    //       row += "<td>" + this.expiration + "</td>";

    //       row += "<td class='autolink'>" + this.reason + "</td>";
    //       row += "<td><a href='/user/" + this.adminID + "' target='_blank'>" + this.adminName + "</a></td>";

    //       if (this.active == false) {
    //         this.active = 'times';
    //       } else if (this.active == true) {
    //         this.active = 'check';
    //       }
    //       row += "<td><i class='fas fa-" + this.active + "'></i></td>";

    //       row += '</tr>';
    //       $('#bans-table').find('tbody:last-child').append(row);
    //     });
    //     $('#loading').remove();
    content_links();
    table_impoving();
    aftermath();
    //   }
    // });

    function addButtons(textArea, html) {
      if (typeof textArea !== 'undefined' && html.length > 0) {
        $(textArea).css('margin-bottom', '10px');
        $(html).insertAfter(textArea);
      }
    }

    function checkReasonLength() {
      if (injects.reason.val().length > reasonMax) {
        injects.reason.css({
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
        injects.reason.css({
          'background-color': '',
          'color': ''
        });
      }
      reasonCount.html(injects.reason.val().length + "/" + reasonMax);
    }

    var reasonMax = 190;
    $("<div id='reasonCount'>0/" + reasonMax + "</div>").insertAfter(injects.reason);
    var reasonCount = $('#reasonCount');
    injects.reason.keyup(function () {
      checkReasonLength();
    });
    var dateTimeSelect = $('#datetimeselect');

    addButtons(injects.accept.find('textarea[name=comment]'), construct_buttons("accepts"));
    addButtons($('input[name=reason]'), '<div class="ban-reasons">' + construct_buttons('reasons') + '</div>');
    addButtons(dateTimeSelect, construct_dates(OwnDates));
    addButtons(injects.modify.find('textarea[name=comment]'), construct_buttons("modify"));
    addButtons(injects.decline.find('textarea[name=comment]'), construct_buttons("declines"));
    addButtons($('div.container.content').find('textarea[name=comment]'), construct_buttons("comments"));

    $('.pluscomment').on('click', function (event) {
      event.preventDefault();
      setReason($('form').find('textarea[name=comment]'), decodeURI($(this).data("text")));
    });
    $('.plusaccept').on('click', function (event) {
      event.preventDefault();
      setReason(injects.accept.find('textarea[name=comment]'), decodeURI($(this).data("text")));
    });
    $('.plusmodify').on('click', function (event) {
      event.preventDefault();
      setReason(injects.modify.find('textarea[name=comment]'), decodeURI($(this).data("text")));
    });
    $('.plusdecline').on('click', function (event) {
      event.preventDefault();
      setReason(injects.decline.find('textarea[name=comment]'), decodeURI($(this).data("text")));
    });

    var unban_time = moment.utc();
    if (dateTimeSelect.val()) {
      if (dateTimeSelect.val().length) {
        unban_time = moment(dateTimeSelect.val())
      }
    }
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
      $("#datetimeselect").val(unban_time.format("YYYY-MM-DD HH:mm"));
    });

    $('button#comments_clear').on('click', function (event) {
      event.preventDefault();
      $('form').find('textarea[name=comment]').val("");
    });
    $('button#accept_clear').on('click', function (event) {
      event.preventDefault();
      injects.accept.find('textarea[name=comment]').val("");
    });
    $('button#modify_clear').on('click', function (event) {
      event.preventDefault();
      injects.modify.find('textarea[name=comment]').val("");
    });
    $('button#decline_clear').on('click', function (event) {
      event.preventDefault();
      injects.decline.find('textarea[name=comment]').val("");
    });

    if ($('div.container.content > div.row').find('a.btn').length == 0) {
      var select = $('select[name=visibility]');
      $(select).find('option:selected').removeProp('selected');
      $(select).find('option[value=Private]').prop('selected', 'selected');
    }

    $('.plusreason').on('click', function (event) {
      event.preventDefault();

      var reason_val = injects.reason.val(),
        sp = '';
      if (!checkDoubleSlash(injects.reason[0]))
        sp = (settings.separator) ? settings.separator : ',';

      if ($(this).data('place') == 'before') {
        injects.reason.val(decodeURI(String($(this).data("text"))) + ' ' + reason_val.trim() + ' ');
      } else if ($(this).data('place') == 'after-wo') {
        injects.reason.val(reason_val.trim() + ' ' + decodeURI(String($(this).data("text"))) + ' ');
      } else if (reason_val.length) {
        injects.reason.val(reason_val.trim() + sp + ' ' + decodeURI(String($(this).data("text"))) + ' ');
      } else {
        injects.reason.val(decodeURI(String($(this).data("text"))) + ' ');
      }
      injects.reason.focus();
      checkReasonLength();
    });

    dropdown_enchancements();
    permcheck();
  }

  init();
}