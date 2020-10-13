let inject_init = () => { // eslint-disable-line no-unused-vars
  var accept_modal = $('#confirm-accept')
  var decline_modal = $('#confirm-decline')
  var injects = {
    header: $('body > div.wrapper > div.breadcrumbs > div > h1'),
    date_buttons: accept_modal.find('div > div > form > div.modal-body > div:nth-child(5) > label:nth-child(4)'),
    report_language: $('div.container.content > div > div > div > table.table > tbody > tr:nth-child(8) > td:nth-child(2)'),
    claim_report: $('div.container.content > div > div > div > table.table > tbody > tr:nth-child(10) > td:nth-child(2) > a'),
    spinner: $('#loading-spinner'),
    accept: {
      comment: accept_modal.find('div > div > form > div.modal-body > div:nth-child(7) > textarea'),
      form: accept_modal.find('div > div > form'),
      time: $('#datetimeselect'),
      reason: accept_modal.find('div > div > form > div.modal-body > div:nth-child(6) > input')
    },
    bans: {
      table: $('#ban > div > table > tbody > tr'),
      header: $('#bans > div:nth-child(1) > h4 > a'),
      ban_toggler: $('#expired_bans_toggler').find('i')
    },
    decline: {
      comment: decline_modal.find('div > div > form > div.modal-body > div > textarea'),
      form: decline_modal.find('div > div > form')
    },
    summary: {
      first_column: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr > td:nth-child(1)'),
      perpetrator_link: $('table > tbody > tr:nth-child(2) > td:nth-child(2) > kbd > a'),
      perpetrator_label: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(1)'),
      previous_usernames: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)'),
      reporter_link: $('table > tbody > tr:nth-child(1) > td:nth-child(2) > kbd > a'),
      reporter_label: $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1)')
    }
  }

  const tbody = $('html').find('tbody').first();

  const users = {
   reporter: tbody.find("tr:nth-child(1) > td:nth-child(2) a"),
   perpetrator: tbody.find("tr:nth-child(2) > td:nth-child(2) a"),
   admin: tbody.find("tr:nth-child(7) > td:nth-child(2) > a")
  };

  let cannedVariables = {
    'report.language': tbody.find("tr:nth-child(9) > td:nth-child(2)").text().trim(),
    'report.reason': tbody.find('tr:nth-child(8) > td:nth-child(2) > strong').text(),
    'user.username': users.reporter.text(),
    'user.id': 0,
    'perpetrator.username': users.perpetrator.text(),
    'perpetrator.id': 0,
    'perpetrator.steam_id': tbody.find("tr:nth-child(3) > td > a").text().trim(),
    'admin.username': users.admin.text(),
    'admin.id': 0,
    'admin.group.name': 'Staff Member'
  };

  try {
    cannedVariables["user.id"] = users.reporter.attr('href').split('/')[4]
  } catch (e) {
    console.log("Couldn't set canned variables for reporter ID: " + e.toString())
  }
  try {
    cannedVariables["perpetrator.id"] = users.perpetrator.attr('href').split('/')[4]
  } catch (e) {
    console.log("Couldn't set canned variables for perpetrator ID: " + e.toString())
  }
  try {
    cannedVariables["admin.id"] = (!users.admin.text() ? 0 : users.admin.attr('href').split('/')[4])
  } catch (e) {
    console.log("Couldn't set canned variables for admin ID: " + e.toString())
  }

  var perpetratorProfile;

  function fetchPerpetratorProfile () {
    $.ajax({
      url: $(injects.summary.perpetrator_link).attr('href'),
      type: 'GET',
      success: function (data) {
        perpetratorProfile = data;
        checkBanLength();
        registered();
      }
    });
  }

  function fetchAdminGroupName () {
    switch (users.admin.css('color').replaceAll(" ","")){
      case 'rgb(244,67,54)':
        cannedVariables["admin.group.name"] = 'Game Moderator';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(255,82,82)':
        cannedVariables["admin.group.name"] = 'Report Moderator';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(211,47,47)':
        cannedVariables["admin.group.name"] = 'Game Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(183,28,28)':
        cannedVariables["admin.group.name"] = 'Senior Game Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(0,184,212)':
        cannedVariables["admin.group.name"] = 'Translation Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(0,166,212)':
        cannedVariables["admin.group.name"] = 'Senior Translation Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(21,101,192)':
        cannedVariables["admin.group.name"] = 'Event Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(13,71,161)':
        cannedVariables["admin.group.name"] = 'Senior Event Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(255,143,0)':
        cannedVariables["admin.group.name"] = 'Media Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(0,131,143)':
        cannedVariables["admin.group.name"] = 'Community Moderation Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(0,96,100)':
        cannedVariables["admin.group.name"] = 'Senior Community Moderation Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(236,64,122)':
        cannedVariables["admin.group.name"] = 'Support Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(216,27,96)':
        cannedVariables["admin.group.name"] = 'Senior Support Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(230,74,25)':
        cannedVariables["admin.group.name"] = 'Community Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(191,54,12)':
        cannedVariables["admin.group.name"] = 'Senior Community Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(126,87,194)':
        cannedVariables["admin.group.name"] = 'Add-On Manager';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(96,125,139)':
        cannedVariables["admin.group.name"] = 'Service and Data Analyst';
        if (settings.localisedcomment) comment_language();
        break;
      case 'rgb(103,58,183)':
        cannedVariables["admin.group.name"] = 'Developer';
        if (settings.localisedcomment) comment_language();
        break;
      default:     
        $.ajax({
          url: users.admin.attr('href'),
          type: 'GET',
          success: function (data) {
            console.log('admin role unknown or ambiguous, profile fetched');
            var profile = $(data).find('div.profile-bio');
            cannedVariables["admin.group.name"] = profile.text().substr(profile.text().indexOf('Rank:')).split("\n")[0].replace("Rank: ","");
            if (settings.localisedcomment) comment_language();
          }
        });
        break;
    }
  }

  function registered () {
    var profile = $(perpetratorProfile).find('div.profile-bio');
    var regDate = profile.text().substr(profile.text().indexOf('Member since:')).split("\n")[0].replace("Member since: ","");
    injects.summary.perpetrator_label.next().find('#registerdate').text('Registered: ' + regDate);
  }

  // Fixes word dates
  var day = 60 * 60 * 24 * 1000
  var fixDate = function (date) {
    if (date === '' || date === undefined) {
      return
    }
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    var d = new Date()
    date = date.replace('Today,', d.getDate() + ' ' + months[d.getMonth()])

    var yesterday = new Date(d)
    yesterday.setTime(d.getTime() - day)
    date = date.replace('Yesterday,', yesterday.getDay() + ' ' + months[d.getMonth()])

    var tomorrow = new Date(d)
    tomorrow.setTime(d.getTime() + day)
    date = date.replace('Tomorrow,', tomorrow.getDay() + ' ' + months[d.getMonth()])

    if (!date.match(/20[0-9]{2}/)) {
      date += ' ' + (new Date()).getFullYear()
    }

    return date
  };

  // Escape HTML due to HTML tags in Steam usernames
  function escapeHTML(s) { // eslint-disable-line no-unused-vars
    return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function accept_modal_init() {
    var reasonMax = 190
    var reasonLength = (injects.accept.reason.val() ? injects.accept.reason.val().length : 0)
    $('<div id="reasonCount">' + reasonLength + "/" + reasonMax + '</div>').insertAfter(injects.accept.reason)
    var reasonCount = $('#reasonCount')

    addButtons($('input[name=reason]'), '<div class="ban-reasons">' + construct_buttons('accept') + '</div>')
    addButtons($('div.container.content').find('textarea[name=comment]'), construct_buttons('comments'))

    $(injects.date_buttons).html(construct_dates(OwnDates))
    //$('input[id="perma.false"]').prop('checked', true)

    // ===== DateTime and Reason inputs checking =====
    injects.accept.form.on('submit', function (event) {
      var time_check = injects.accept.time.val()
      var perm_check = $('input[id="perma.true"]').prop('checked')
      var reason_check = injects.accept.reason.val()
      var error_style = {
        'border-color': '#a94442',
        '-webkit-box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)',
        'box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)'
      }
      var normal_style = {
        'border-color': '',
        '-webkit-box-shadow': '',
        'box-shadow': ''
      }

      if (!time_check && !perm_check) {
        injects.accept.time.css(error_style)
        event.preventDefault()
      } else {
        injects.accept.time.css(normal_style)
      }
      if (!reason_check) {
        injects.accept.reason.css(error_style)
        event.preventDefault()
      } else {
        injects.accept.reason.css(normal_style)
      }
    })
    // ===== Reasons FTW =====
    $('.plusreason').on('click', function (event) {
      event.preventDefault()

      var reason_val = injects.accept.reason.val(),
        sp = ''
      if (!checkDoubleSlash(injects.accept.reason[0])) {
        sp = (settings.separator) ? settings.separator : ',';
      }

      if ($(this).data('place') == 'before') { // prefixes
        injects.accept.reason.val(decodeURI(String($(this).data('text'))) + ' ' + reason_val.trimStart())
      } else if ($(this).data('place') == 'after-wo') { // suffixes
        injects.accept.reason.val(reason_val.trim() + ' ' + decodeURI(String($(this).data('text'))))
      } else if (reason_val.length) { // reasons non-empty
        var pos = injects.accept.reason.prop('selectionStart');
        
        if (!pos) { //cursor at start
          injects.accept.reason.val(reason_val.trimStart());
          injects.accept.reason[0].setRangeText(decodeURI(String($(this).data('text'))) + (checkUrlOrDelimiter(reason_val.trim()) ? '' : sp) + (reason_val[0] === ' ' ? '' : ' '), 0, 0, 'end');
        } else {
          //move cursor out of suffix
          if (reason_val.lastIndexOf(" // ") > reason_val.lastIndexOf(" || ")) {
            pos = Math.min(pos, reason_val.length - reason_val.split(" // ").pop().length - 4);
          } else if (reason_val.lastIndexOf(" // ") < reason_val.lastIndexOf(" || ")) {
            pos = Math.min(pos, reason_val.length - reason_val.split(" || ").pop().length - 4);
          }
          //move cursor behind current word
          var new_pos = reason_val.trimEnd().length;
          [',',' - http',' http',' /'].forEach(el => {
            if (reason_val.indexOf(el, pos-2) > -1) new_pos = Math.min(new_pos, reason_val.indexOf(el, pos-2));
          });
          pos = reason_val[new_pos] == ',' ? new_pos + 1 : new_pos;
          //Insert
          var before = reason_val.substring(0, pos).trimEnd();
          var len = before.length - 1
          switch (before[len]) {
            case ',':
              injects.accept.reason[0].setRangeText(before + ' ' + decodeURI(String($(this).data('text'))) + (checkUrlOrDelimiter(reason_val.substr(pos).trim()) ? '' : sp) + ' ', 0, pos + 1, 'end');
              break;
            case '/': case '+':
              if (before[len - 1] === " ") {
                injects.accept.reason[0].setRangeText(before + ' ' + decodeURI(String($(this).data('text'))) + (checkUrlOrDelimiter(reason_val.substr(pos).trim()) ? '' : sp) + ' ', 0, pos + 1, 'end');
                break;
              }
            default:
              if (before.split(" ").pop().startsWith('http')) injects.accept.reason[0].setRangeText(before + ' / ' + decodeURI(String($(this).data('text'))) + ' ', 0, pos + 1, 'end');
              else injects.accept.reason[0].setRangeText(before + sp + ' ' + decodeURI(String($(this).data('text'))) + ' ', 0, pos + 1, 'end');
              break;
          }
        }
      } else { // reasons empty
        injects.accept.reason.val(decodeURI(String($(this).data('text'))) + ' ')
      }
      injects.accept.reason.focus()
      checkReasonLength()
    })
    $('button#reason_clear').on('click', function (event) {
      event.preventDefault()
      injects.accept.reason.val('')
    })

    // ===== Timing FTW! =====
    var unban_time = moment.utc()
    if ($('#datetimeselect').length && $('#datetimeselect').val().length) {
      unban_time = moment($('#datetimeselect').val())
    }
    console.log('TMP Improved (inject/reports)', unban_time)
    $('.plusdate').on('click', function (event) {
      event.preventDefault()
      var number = $(this).data('number')
      switch (number) {
        case 'clear':
          unban_time = moment.utc()
          break;
        default:
          var key = $(this).data('key')
          unban_time.add(number, key)
          break;
      }
      injects.accept.time.val(unban_time.format('YYYY-MM-DD HH:mm'))
    })

    //Ban reason length check
    function checkReasonLength() {
      if (injects.accept.reason.val().length > reasonMax) {
        injects.accept.reason.css({
          'background-color': 'rgba(255, 0, 0, 0.5)',
          'color': '#fff'
        })
        reasonCount.css({
          'color': 'red',
          'font-weight': 'bold'
        })
      } else {
        reasonCount.css({
          'color': '',
          'font-weight': ''
        })
        injects.accept.reason.css({
          'background-color': '',
          'color': ''
        })
      }
      reasonCount.html(injects.accept.reason.val().length + '/' + reasonMax)
    }

    //check if input beginning is URL or non-alphanumeric
    function checkUrlOrDelimiter(str) {
      if (str.startsWith('http')) return true;
      var code = str.charCodeAt(0);
      if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) return true;// lower alpha (a-z)
      return false;
    }

    injects.accept.reason.keyup(function () {
      checkReasonLength()
    })
  }

  function decline_modal_init() {
    addButtons(injects.decline.comment, construct_buttons('decline'))

    injects.decline.form.on('submit', function (event) {
      var comment_check = injects.decline.comment.val()
      var error_style = {
        'border-color': '#a94442',
        '-webkit-box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)',
        'box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075)'
      }
      var normal_style = {
        'border-color': '',
        '-webkit-box-shadow': '',
        'box-shadow': ''
      }
      if (!comment_check) {
        injects.decline.comment.css(error_style)
        event.preventDefault()
      } else {
        injects.decline.comment.css(normal_style)
      }
    })
    $('.plusdecline').on('click', function (event) {
      event.preventDefault()
      setReason(injects.decline.comment, decodeURI(String($(this).data('text'))))

      switch ($(this).data('action')) {
        case 'negative':
          $("input[id='decline.rating.negative']").prop('checked', true)
          break;

        case 'positive':
          $("input[id='decline.rating.positive']").prop('checked', true)
          break;
      }
      injects.decline.comment.focus()
    })

    $('button#decline_clear').on('click', function (event) {
      event.preventDefault()
      injects.decline.comment.val('')
    })
  }

  var lastinsertpos;

  function setReason(reason, reason_val) {
    reason_val = updateMessageWithCannedVariables(reason_val);
    if ($(reason).val() == "") {
      $(reason).val(reason_val);
    } else {
      var pos = $(reason).prop('selectionStart');
      $(reason)[0].setRangeText((lastinsertpos === pos ? "\n\n" : "") + reason_val, pos, pos, 'end');
      lastinsertpos = $(reason).prop('selectionStart');
    }
    $(reason).focus();
  }

  const updateMessageWithCannedVariables = original => {
    let new_msg = original;
    Object.keys(cannedVariables).forEach(k => {
      new_msg = new_msg.replace(`%${k}%`, cannedVariables[k]);
    });
    return new_msg;
  }

  $('body').append("<div class='modal fade ets2mp-modal' id='videoModal' tabindex='-1' role='dialog''TMP Improved (inject/reports)',  aria-labelledby='videoModalLabel' aria-hidden='true'><div class='modal-dialog 'TMP Improved (inject/reports)', modal-lg' role='document'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button><h4 class='modal-title' id='videoModalLabel'>Video preview</h4></div><div class='modal-body' style='padding:0;'></div></div></div></div>")

  /*function copyToClipboard(text) {
    const input = document.createElement('input')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('Copy')
    document.body.removeChild(input)
  }*/

  function comment_language() {
    var report_language = injects.report_language.text().trim()
    var comment

    if (!settings.own_comment) {
      switch (report_language) {
        case 'German':
          comment = 'Wir bedanken uns für deinen Report :) Es ist zu bedenken, dass die zur Verfügung gestellten Beweise sowohl für die gesamte Dauer des Banns als auch einen Monat darüber hinaus verfügbar sein müssen.'
          break;
        case 'Turkish':
          comment = 'Raporunuz için teşekkürler :) Lütfen sunduğunuz kanıtın, yasağın uygulandığı ve takiben gelen bir(1) aylık süreç boyunca kullanılabilir olması gerektiğini lütfen unutmayın.'
          break;
        case 'Norwegian':
          comment = 'Takk for rapporten :) Vennligst husk at bevis må være tilgjengelig for hele bannlysningspreioden pluss 1 måned'
          break;
        case 'Spanish':
          comment = 'Muchas gracias por tu reporte :) Recuerda que las pruebas/evidencias deben estar disponibles durante toda la vigencia de la prohibicion y más 1 mes.'
          break;
        case 'Dutch':
          comment = 'Bedankt voor je rapport :) Onthoud alsjeblieft dat het bewijs beschikbaar moet zijn voor de volledige lengte van de ban PLUS 1 maand.'
          break;
        case 'Polish':
          comment = 'Dziękuję za report :) Proszę pamiętać o tym że dowód musi być dostępny przez cały okres bana, plus jeden miesiąc. '
          break;
        case 'Russian':
          comment = 'Спасибо за репорт :) Помните, что доказательства должны быть доступны весь период бана ПЛЮС 1 месяц.'
          break;
        case 'French':
          comment = 'Merci pour votre rapport :) Notez que la preuve doit être disponible durant toute la durée du ban PLUS 1 mois.'
          break;
        case 'Lithuanian':
          comment = 'Thank you for your report :) Please, remember that evidence must be available for the full duration of the ban PLUS 1 month.'
          break;
        case 'Portuguese':
          comment = 'Obrigado por seu relatório :) Por favor, lembre-se que as provas devem estar disponíveis para a duração total da proibição MAIS 1 mês.'
          break;
        default:
          comment = 'Thank you for your report :) Please, remember that evidence must be available for the full duration of the ban PLUS 1 month.'
      }
    } else {
      comment = updateMessageWithCannedVariables(settings.own_comment);
    }
    injects.accept.comment.val(comment)
  }

  function bans_count_fetch() {
    function getUnbanTime(unban_time_td, banned_reason_td) {
      var content = unban_time_td.split(/:\d\d/)
      unban_time_td = unban_time_td.replace(content[1], "")
      var unban_time
      now = moment.utc()
      if (unban_time_td.indexOf('Today') !== -1) {
        unban_time = now
      } else if (unban_time_td.indexOf('Tomorrow') !== -1) {
        unban_time = now.add(1, 'd')
      } else if (unban_time_td.indexOf('Yesterday') !== -1) {
        unban_time = now.add(1, 'd')
      } else {
        nb_parts = unban_time_td.split(' ').length
        if (nb_parts == 3) {
          unban_time = moment(unban_time_td, 'DD MMM HH:mm')
        } else if (nb_parts == 4) {
          unban_time = moment(unban_time_td, 'DD MMM YYYY HH:mm')
        } else {
          unban_time = moment(unban_time_td)
          console.log('TMP Improved (inject/reports)', [
            unban_time_td,
            nb_parts,
            unban_time
          ])
        }
      }
      if (unban_time.year() == '2001') {
        unban_time.year(now.year())
      }
      if (banned_reason_td == '@BANBYMISTAKE') {
        unban_time.year('1998')
      }

      return unban_time
    }

    var bans_count = 0
    var expired_bans_count = 0
    var nb_parts
    console.log(injects.bans.table)
    injects.bans.table.each(function () {
      var ban_time_td = $(this).find('td:nth-child(1)').text()
      var unban_time_td = $(this).find('td:nth-child(2)').text()
      var banned_reason_td = $(this).find('td:nth-child(3)').text()
      var unban_time
      if (unban_time_td == 'Never') {
        unban_time = getUnbanTime(ban_time_td, banned_reason_td)
      } else {
        unban_time = getUnbanTime(unban_time_td, banned_reason_td)
      }
      if (unban_time.isValid()) {
        if (Math.abs(unban_time.diff(now, 'd')) >= 365) {
          $(this).hide()
          $(this).addClass('expired_bans')
          $(this).find('td').css('color', '#555')
          expired_bans_count++
        } else {
          bans_count++
        }
      }
    })

    injects.bans.header.html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small>')
    if (bans_count >= 3) {
      injects.bans.header.css('color', '#d43f3a')
    }
    if (expired_bans_count > 0) {
      injects.bans.header.html(bans_count + ' counted bans<small>, including deleted. This is a website issue.</small> <a href="#" id="expired_bans_toggler"><i class="fas fa-toggle-off data-toggle="tooltip" title="Show/hide bans further than 12 months and @BANBYMISTAKE"></i></a>')
      $('#expired_bans_toggler').on('click', function (event) {
        event.preventDefault()
        $('.expired_bans').fadeToggle('slow')
        if (injects.bans.ban_toggler.hasClass('fa-toggle-off')) {
          injects.bans.ban_toggler.removeClass('fa-toggle-off')
          injects.bans.ban_toggler.addClass('fa-toggle-on')
        } else {
          injects.bans.ban_toggler.removeClass('fa-toggle-on')
          injects.bans.ban_toggler.addClass('fa-toggle-off')
        }
      })
    }

    if ($('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2) > td:nth-child(5) > i').hasClass('fa-check')) {
      $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2) > table.table.table-responsive > tbody > tr:nth-child(2)').find('td').css({
        'color': '#d43f3a'
      })
    }
  }

  function ban_history_table_improving() {
    // Make the table with other reports better
    $('#report > table > tbody > tr').each(function () {
      // Skip it when no reports have been found
      if ($(this).find('td:nth-child(1)').text().trim() === 'No reports found') {
        return
      }

      // View button
      $(this).find('td:nth-child(6) > a').addClass('btn btn-default btn-block btn-sm').text('View')

      // Claim button
      let claimButton = $(this).find('td:nth-child(5) > a')
      console.log('TMP Improved (inject/reports)', "Thing:", claimButton)
      claimButton.addClass('btn btn-primary btn-block btn-sm claim')

      let text = claimButton.text().replace('Report', '').trim()
      if (text === 'Claim') {
        claimButton.html(text + " <i class='fas fa-external-link-alt'></i>")
        if (settings.viewreportblank) {
          claimButton.attr('target', '_blank')
        }
      } else {
        claimButton.html(text)
      }

      // Already claimed
      if ($(this).find('td:nth-child(5)').text().trim() === 'Already claimed') {
        $(this).find('td').css('color', '#555')
      }

      // Date
      let dateColumn = $(this).find('td:nth-child(1)')
      text = dateColumn.text()
      if (text.split(' ').length !== 4) {
        text = text.replace('Today,', moment().format('DD MMM'))
        text = moment(text, 'DD MMM HH:mm').format('DD MMM YYYY HH:mm')
        dateColumn.text(text)
      }

      // Switch claim button
      $(this).children(':eq(5)').after($(this).children(':eq(4)'))
    })

    // Claim link click
    $('a.claim').click(function (event) {
      $(this).addClass('clicked')
      $(this).text('Claimed!')
      if (settings.viewreportblank) {
        event.preventDefault()
        if (event.ctrlKey) {
          window.open($(this).attr('href'), '_top')
        } else {
          window.open($(this).attr('href'), '_blank')
        }
      }
    })
  }

  function dropdown_enchancements() {
    $('ul.dropdown-menu').css('top', '95%')
    $('.dropdown').hover(function () {
      $('.dropdown-menu', this).stop(true, true).fadeIn('fast')
      $(this).toggleClass('open')
      $('b', this).toggleClass('caret caret-up')
    }, function () {
      $('.dropdown-menu', this).stop(true, true).fadeOut('fast')
      $(this).toggleClass('open')
      $('b', this).toggleClass('caret caret-up')
    })
    $('a.hovery').hover(function (e) {
      $(this).css('background', e.type === 'mouseenter' ? '#303030' : 'transparent')
      $(this).css('color', e.type === 'mouseenter' ? '#999!important' : '')
    })
  }

  function bannedInit() {
    var isBanned = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(2) > table').find('i.fa-check')
    if (isBanned.length > 0) {
      var perpetrator = $('body > div.wrapper > div.container.content > div > div > div.col-md-6:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)')
      $(perpetrator).append('<span class="badge badge-red badge-banned">Banned</span>')
    }
  }

  function viewReportBlankInit() {
    if (settings.viewreportblank) {
      $('#reports > #report > div:nth-child(1) > table').find('a:contains("View")').prop('target', '_blank');
    } else {
      $('#reports > #report > div:nth-child(1) > table').find('a:contains("View")').prop('target', '');
    }
  }

  function construct_buttons(type) {
    var html = ''
    switch (type) {
      case 'comments':
        html += each_type_new('Comments', OwnReasons.comments)
        html += '<button type="button" class="btn btn-link" id="comments_clear">Clear</button>'
        break;

      case 'accept':
        html += each_type_new('Reasons', OwnReasons.reasons)
        html += ' ' + each_type_new('Prefixes', OwnReasons.prefixes)
        html += ' ' + each_type_new('Postfixes', OwnReasons.postfixes)
        html += '<button type="button" class="btn btn-link" id="reason_clear">Clear</button>'
        break;

      case 'decline':
        html += each_type_new('Declines', OwnReasons.declines)
        html += ' ' + each_type_new('Declines (Positive)', OwnReasons.declinesPositive)
        html += ' ' + each_type_new('Declines (Negative)', OwnReasons.declinesNegative)
        html += '<button type="button" class="btn btn-link" id="decline_clear">Clear</button>'
        break;
    }

    return html

    function each_type_new(type, buttons) {
      var place, color, change, action
      switch (type) {
        case 'Prefixes':
          place = 'before'
          color = 'warning'
          change = 'reason'
          action = ''
          break;

        case 'Reasons':
          place = 'after'
          color = 'default'
          change = 'reason'
          action = ''
          break;

        case 'Postfixes':
          place = 'after-wo'
          color = 'danger'
          change = 'reason'
          action = ''
          break;

        case 'Declines':
          place = 'after'
          color = 'info'
          change = 'decline'
          action = ''
          break;

        case 'Declines (Positive)':
          place = 'after'
          color = 'warning'
          change = 'decline'
          action = 'positive'
          break;

        case 'Declines (Negative)':
          place = 'after'
          color = 'danger'
          change = 'decline'
          action = 'negative'
          break;

        case 'Comments':
          place = 'after'
          color = 'u'
          change = 'comment'
          action = ''
          break;
      }
      var snippet = '<div class="btn-group dropdown mega-menu-fullwidth"><a class="btn btn-' + color + ' dropdown-toggle" data-toggle="dropdown" href="#">' + type + ' <span class="caret"></span></a><ul class="dropdown-menu"><li><div class="mega-menu-content disable-icons" style="padding: 4px 15px;"><div class="container" style="width: 800px !important;"><div class="row equal-height" style="display: flex;">'
      var md = 12 / (Math.max(buttons.length, 1))
      $.each(buttons, function (key, val) {
        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">'
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="' + encodeURI(item.trim()) + '">' + item.trim() + '</a></li>'
          })
        } else {
          $.each(val, function (title, item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-action="' + action + '" data-text="' + encodeURI(item.trim()) + '">' + title.trim() + '</a></li>'
          })
        }
        snippet += '</ul></div>'
      })
      snippet += '</div></div></div></li></ul></div>     '
      return snippet
    }
  }

  // function supportInit() {
  //   if (injects.claim_report.length == 0) {
  //     var select = $('select[name=visibility]')
  //     $(select).find('option:selected').removeProp('selected')
  //     $(select).find('option[value=Private]').prop('selected', 'selected')
  //   }
  // }

  function evidencePasteInit() {
    injects.accept.reason.bind('paste', function (e) {
      var self = this,
        data = e.originalEvent.clipboardData.getData('Text').trim(),
        dataLower = data.toLowerCase()
      if ((dataLower.indexOf('http://') == 0 || dataLower.indexOf('https://') == 0) && !checkDoubleSlash(this) && settings.autoinsertsep) {
        e.preventDefault()
        insertAtCaret($(self)[0], '- ' + data, true)
      }
    })
  }

  function fixModals() {
    var path = 'div.modal-body > div.form-group:last-child'

    var rateAccept = injects.accept.form.find(path)
    rateAccept.find("input[id='rating.positive']").attr('id', 'accept.rating.positive')
    rateAccept.find("input[id='rating.negative']").attr('id', 'accept.rating.negative')
    rateAccept.find("label[for='rating.positive']").attr('for', 'accept.rating.positive')
    rateAccept.find("label[for='rating.negative']").attr('for', 'accept.rating.negative')

    if (settings.defaultratings) rateAccept.find("input[id='accept.rating.positive']").prop("checked", true);

    var rateDecline = injects.decline.form.find(path)
    rateDecline.find("input[id='rating.positive']").attr('id', 'decline.rating.positive')
    rateDecline.find("input[id='rating.negative']").attr('id', 'decline.rating.negative')
    rateDecline.find("label[for='rating.positive']").attr('for', 'decline.rating.positive')
    rateDecline.find("label[for='rating.negative']").attr('for', 'decline.rating.negative')

    if (settings.defaultratings) rateDecline.find("input[id='decline.rating.negative']").prop("checked", true);

    $('#loading-spinner').hide()
  }

  function addButtons(textArea, html) {
    if (typeof textArea !== 'undefined' && html.length > 0) {
      $(textArea).css('margin-bottom', '10px')
      $(html).insertAfter(textArea)
    }
  }

  /*
      INIT SCRIPT
   */

  function init() {
    content_links()
    fetchPerpetratorProfile()
    if (settings.localisedcomment) comment_language()
    //bans_count_fetch()
    ban_history_table_improving()
    accept_modal_init()
    decline_modal_init()
    dropdown_enchancements()
    // supportInit()
    bannedInit()
    viewReportBlankInit()
    evidencePasteInit()
    fixModals()
    if (users.admin.text()) setTimeout(fetchAdminGroupName, 500)
  }

  var now = moment.utc() // Moment.js init
  $(document).ready(function () {
    if (settings.wide !== false) {
      $('div.container.content').css('width', '85%')
    }

    injects.summary.perpetrator_label.next().append('<br><kbd id="registerdate" style="margin-left: 2px;">Registered: ...</kbd>');
    injects.summary.perpetrator_label.next().find('kbd:nth-child(1)').after('<a style="margin-left: 1px;" id="copyname"><i class="fas fa-copy fa-fw" data-toggle="tooltip" title="" data-original-title="Copy username"></i></a>');
    injects.summary.perpetrator_label.next().find('span').after('<a style="margin-left: 1px;" id="copyid"><i class="fas fa-copy fa-fw" data-toggle="tooltip" title="" data-original-title="Copy TMP ID"></i></a>');
    tbody.find('tr:nth-child(3) > td > a').append('<a id="copysteamid"><i class="fas fa-copy fa-fw" data-toggle="tooltip" title="" data-original-title="Copy SteamID"></i></a>');
    
    $('#copyname').on('click', function (event) {
      event.preventDefault()
      copyToClipboard(cannedVariables["perpetrator.username"])
      $(this).children().first().removeClass("fa-copy").addClass("fa-check");
      setTimeout(() => {
        $(this).children().first().removeClass("fa-check").addClass("fa-copy");
      },2000);
    })
    $('#copyid').on('click', function (event) {
      event.preventDefault()
      copyToClipboard(cannedVariables["perpetrator.id"])
      $(this).children().first().removeClass("fa-copy").addClass("fa-check");
      setTimeout(() => {
        $(this).children().first().removeClass("fa-check").addClass("fa-copy");
      },2000);
    })
    $('#copysteamid').on('click', function (event) {
      event.preventDefault()
      copyToClipboard(cannedVariables["perpetrator.steam_id"])
      $(this).children().first().removeClass("fa-copy").addClass("fa-check");
      setTimeout(() => {
        $(this).children().first().removeClass("fa-check").addClass("fa-copy");
      },2000);
    })

    $('.youtube').YouTubeModal({
      autoplay: 0,
      width: 640,
      height: 480
    })
    var videoBtns = $('.video')
    var videoModal = $('#videoModal')
    videoBtns.click(function (e) {
      e.preventDefault()
      videoModal.find('.modal-body').html("<div class='embed-responsive-16by9 embed-responsive'><iframe src='" + $(this).attr('href') + "' width='640' height='480' frameborder='0' scrolling='no' allowfullscreen='true' style='padding:0; box-sizing:border-box; border:0; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; margin:0.5%; width: 99%; height: 98.5%;'></iframe></div>")
      videoModal.modal('show')
    })
    videoModal.on('hidden.bs.modal', function () {
      videoModal.find('.modal-body').html('')
    })

    var occurred = tbody.find('tr:nth-child(5) > td:nth-child(2)');
    var occurdate = Date.parse(fixDate(occurred.text()));
    var now = (new Date()).getTime();
    if (now - occurdate >= day * 32) occurred.css('color', 'red');
    else if (now - occurdate >= day * 27) occurred.css('color', 'orange');
    else occurred.css('color', 'green');

    if (settings.enablebanlength === true) {
      $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2)').append('<hr class="small" /><h4>Recommended Ban length</h4><div style="display: flex"><div class="col-md-12"><div class="text-center"><div class="loading-for-bans" style="display: none;">Loading...</div>' + /*<a class="btn btn-block btn-success" href="#" id="check-ban-length">Check the recommended length of the next ban</a> + */'</div></div>');
    }
    /*$('#check-ban-length').click(function (e) {
      e.preventDefault()
      checkBanLength()
    })*/
  })

  function checkBanLength () {
    $('#loading-spinner').show()
    //$('#check-ban-length').remove()
    $('div.loading-for-bans').show()

    // Gets all bans
    var bans = $(perpetratorProfile).find('.profile-body .panel-profile:last-child .timeline-v2 > li')
    var activeBans = 0,
      bans1m = 0,
      bans3m = 0,
      totalBans = 0
    var active1m = false,
      two_active_hist_bans = false,
      active3m = false
    // If the user is banned
    var banned = false
    if ($(perpetratorProfile).find('.profile-body .panel-profile .profile-bio .label-red').text().toLowerCase().includes('banned')) {
      banned = true
    }

    $.each(bans, function (index, ban) {
      // @BANBYMISTAKE is not counted
      var reason = $(ban).find('.autolink').text().replaceAll(/(\s)+/g," ").replace("Reason: ","").trim()
      if (reason === '@BANBYMISTAKE' || $(ban).find('.cbp_tmicon').css('background-color') === 'rgb(255, 0, 38)') {
        return
      }

      var date = $($(ban).next().find('div.modal-body > div').children()[$(ban).next().find('div.modal-body > div').children().length - 1]).text().split(/:\s/)[0].trim() //$(ban).find('.cbp_tmtime span:last-of-type').text()
      var issuedOn = Date.parse(fixDate(date))
      
      var dateExp = $(ban).find('.autolink').next().text().replaceAll(/(\s)+/g," ").replace("Expires ","").trim() //getKeyValueByNameFromBanRows($(ban).find('.cbp_tmlabel > p'), "Expires", ': ')[1]
      if (dateExp === 'Never' || dateExp === 'Permanent') {
        dateExp = date
      }
      var expires = Date.parse(fixDate(dateExp))

      totalBans++;
      if (expires - issuedOn >= day * 85) {
        bans3m++
      } else if (expires - issuedOn >= day * 27) {
        bans1m++
      }
      if ((new Date()).getTime() - day * 365 <= expires) {
        activeBans++
        if (expires - issuedOn >= day * 85) {
          if (active3m || active1m) two_active_hist_bans = true;
          active3m = true
        } else if (expires - issuedOn >= day * 27) {
          if (active1m || active3m) two_active_hist_bans = true;
          active1m = true
        }
      }
    })

    var html = '<div class="col-md-6 text-center" style="align-self: center"><kbd'
    if (banned) {
      html += ' style="color: rgb(212, 63, 58)">The user is already banned!</kbd><br />Length of the next ban: <kbd'
    }
    // Length checks
    if (two_active_hist_bans || (activeBans >= 4 && active1m)) {
      html += ' style="color: rgb(212, 63, 58)">Permanent'
    } else if (activeBans >= 3) {
      html += ' style="color: rgb(212, 63, 58)">1 month'
    } else {
      html += '>You can choose :)'
    }
    html += '</kbd><br /><br /><em>This tool is very accurate, but please check the profile to avoid mistakes.</em></div>'
    // Information
    html += '<div class="col-md-6 text-center">'
    //html += 'Banned: <kbd' + (banned ? ' style="color: rgb(212, 63, 58)">yes' : '>no') + '</kbd><br />'
    html += 'Active bans: ' + activeBans + '<br />'
    html += 'Total bans: ' + totalBans + '<br />'
    html += '1 month bans: ' + bans1m + '<br />'
    html += '3 month bans: ' + bans3m + '<br />'
    html += 'Active 1 month ban: ' + (active1m || active3m)/* + '<br />'
    html += 'Active 3 month ban: ' + active3m*/
    //html += '<br/><br/></div><div class="text-center"><em>This tool is very accurate, but please check the profile to avoid mistakes.</em></div></div>'
    html += '</div>'
    $('body > div.wrapper > div.container.content > div > div.clearfix > div:nth-child(2)').append(html)

    $('#loading-spinner').hide()
    $('div.loading-for-bans').hide()
  }

  init()

  $('.pluscomment').on('click', function (event) {
    event.preventDefault()
    setReason($('form').find('textarea').not($('.modal-body').find('textarea')), decodeURI(String($(this).data('text'))))
  })

  $('button#comments_clear').on('click', function (event) {
    event.preventDefault()
    $('form').find('textarea[name=comment]').val('')
  })

}