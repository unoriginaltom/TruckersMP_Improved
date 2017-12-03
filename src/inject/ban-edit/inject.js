function inject_init() {
  var is_add_ban = window.location.pathname.includes('/admin/ban/add/');

  var ban_time;
  var reason = $('input[name=reason]');
  if (is_add_ban) {
    ban_time = moment().utc();
  } else {
    $('<p class="help-block">Only change a Reason? Click <a href="#" id="changedReason" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a><br>Ban is by mistake? Click <a href="#" id="by_mistake" style="color: #72c02c; text-decoration: underline;"><b>--> here <--</b></a> and do not forget to post this ban in <a href="https://forum.truckersmp.com/index.php?/topic/17815-ban-by-mistake/#replyForm" style="color: #72c02c; text-decoration: underline;" target="_blank"><b>Ban by mistake</b></a> forum topic</p>').insertAfter('input[name=reason]');
    ban_time = $('#datetimeselect').val();
  }

  if (ban_time) {
    var now = moment(ban_time);

    $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
    $(date_buttons).insertAfter('#datetimeselect');
    $('<button type="button" class="btn btn-link plusdate" data-plus="back" id="current_ban_time"><b>Current Ban time</b></button>').insertAfter($("#ownreasons_buttons").find("div:last-child > button:last-child"));

    $('.plusdate').on("click", function (event) {
      event.preventDefault();
      switch ($(this).data("plus")) {
        case 'back':
          now = moment(ban_time);
          break;
        case 'clear':
          now = moment().utc();
          break;
        default:
          var key = $(this).data('key');
          now.add($(this).data("number"), key);
          break;
      }
      $('#datetimeselect').val(now.format("YYYY/MM/DD HH:mm"));
    });
    
    $("#changedReason").click(function (event) {
      event.preventDefault();
      if (moment(ban_time).isBefore(moment().utc())) {
        $('#datetimeselect').val(ban_time);
        $('#ownreasons_buttons').remove();
      } else {
        $('input[type=radio][name=perma]').prop("checked",true);
        $('input[name=active]').prop('checked', false);
        perma_perform(this);
      }
    })
  } else {
    $('#datetimeselect').slideUp('fast');
    $('label[for=\'perma.true\']').addClass('text-uppercase');
  }

  $('input[type=radio][name=perma]').change(function () {
    perma_perform(this);
  });
  reason.attr('autocomplete', 'off');
  $('input[name=expire]').attr('autocomplete', 'off');

  $('#by_mistake').on('click', function (event) {
    event.preventDefault();
    reason.val('@BANBYMISTAKE');
    $('input[name=active]').prop('checked', false);
  });

  $(document).prop('title', 'Edit ' + $('body > div.wrapper > div.container.content-md > form > h2').text() + '\'s Ban - TruckersMP');

  $('[data-toggle="tooltip"]').tooltip();
  $("#loading-spinner").remove();

  if (typeof OwnReasons !== 'undefined') {
    function construct_buttons(OwnReasons) {
      var html = '';
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

        var md = 12 / ((buttons.join().match(/\|/g) || []).length + 1);
        buttons.forEach(function (item) {
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
  
    var reasonMax = 190;
    $("<div id='reasonCount'>" + reason.val().length + "/" + reasonMax + "</div>").insertAfter(reason);
    var reasonCount = $("#reasonCount");
    function reasonMaxLength() {
      if (reason.val().length > reasonMax) {
        reason.css({
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
        reason.css({
          'background-color': '',
          'color': ''
        });
      }
      reasonCount.html(reason.val().length + "/" + reasonMax);
    }
    reason.keyup(function () {
      reasonMaxLength();
    });

    function evidencePasteInit() {
      reason.bind('paste', function (e) {
        var self = this,
          data = e.originalEvent.clipboardData.getData('Text').trim(),
          dataLower = data.toLowerCase();
        if ((dataLower.indexOf('http://') == 0 || dataLower.indexOf('https://') == 0) && !checkDoubleSlash(this) && settings.autoinsertsep) {
          e.preventDefault();
          insertAtCaret($(self)[0], '- ' + data, true);
        }
      });
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

    var reason_buttons = construct_buttons(OwnReasons);
    $('<div class="ban-reasons">' + reason_buttons + '</div>').insertAfter('input[name=reason]');

    $('.plusreason').on('click', function (event) {
      event.preventDefault();

      var reason_val = reason.val();
      var sp = (settings.separator) ? settings.separator : ',';

      if ($(this).data('place') == 'before') {
        reason.val($(this).html() + ' ' + reason_val.trim() + ' ');
      } else if (($(this).data('place') == 'after-wo') || (reason_val.trim() == 'Intentional')) {
        reason.val(reason_val.trim() + ' ' + $(this).html() + ' ');
      } else if (reason_val.length) {
        reason.val(reason_val.trim() + sp + ' ' + $(this).html() + ' ');
      } else {
        reason.val($(this).html() + ' ');
      }
      reason.focus();
      reasonMaxLength();
    });
    $('button#reason_clear').on('click', function (event) {
      event.preventDefault();
      reason.val("");
    });
    reasonMaxLength();
    dropdown_enchancements();
    evidencePasteInit();
  }
}