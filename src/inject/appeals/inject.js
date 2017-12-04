function inject_init() {
  var steam_id = $('input[name="steam_id"]').val();
  var summary = $('#summary');
  var injects = {
    header: $('body > div.wrapper > div.breadcrumbs > div > h1'),
    spinner: $("#loading-spinner"),
    accept: $('#confirm-accept'),
    decline: $('#confirm-decline'),
    modify: $('#confirm-modify')
  };

  function construct_buttons(OwnReasons, type) {
    var html = '';
    console.log(type);
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
      var count = 0;
      var md = 12 / ((buttons.join().match(/\|/g) || []).length + 1);
      $.each(buttons, function (key,val) {
        snippet += '<div class="col-md-' + md + ' equal-height-in" style="border-left: 1px solid #333; padding: 5px 0;"><ul class="list-unstyled equal-height-list">';
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-text="'+ encodeURI(item.trim())+'">' + item.trim() + '</a></li>';
          });
        } else {
          $.each(val, function (title, item) {
            snippet += '<li><a style="display: block; margin-bottom: 1px; position: relative; border-bottom: none; padding: 6px 12px; text-decoration: none" href="#" class="hovery plus' + change + '" data-place="' + place + '" data-text="'+encodeURI(item.trim())+'">' + title.trim() + '</a></li>';
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

  function escapeHTML(s) {
    return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function table_impoving() {
    $('table').addClass('table-condensed table-hover');

    if (steamapi !== null) {
      $.ajax({
        url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + steamapi + "&format=json&steamids=" + steam_id,
        type: 'GET',
        success: function (val) {
          if (val === undefined) {
            $("#loading-error").show();
            injects.spinner.hide();
            return;
          }
          var player_data = val;
          var tmpname = summary.find('table > tbody > tr:nth-child(2) > td:nth-child(2)');
          var steam_name = escapeHTML(player_data.response.players[0].personaname);
          summary.find('table > tbody > tr:nth-child(2) > td:nth-child(1)').text('TruckersMP');
          tmpname.html('<kbd>' + tmpname.text() + '</kbd>');

          var steam_link = '<tr><td>Steam</td><td> <a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank"><kbd>' + steam_name + '</kbd></a> <img src="' + player_data.response.players[0].avatar + '" class="img-rounded"></td></tr>';
          $(steam_link).insertAfter('#summary > table > tbody > tr:nth-child(2)');
        }
      });
    }

    $('input[type=radio][name=perma]').change(function () {
      permcheck()
    });
    $('input[name=reason]').attr('autocomplete', 'off');
    $('input[name=expire]').attr('autocomplete', 'off');
  }

  function aftermath() {
    $(document).prop('title', $('table.table > tbody > tr:nth-child(1) > td:nth-child(2) > a').text() + '\'s Ban Appeal - TruckersMP');

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

  String.prototype.contains = function (needle) {
    for (var i = needle.length - 1; i >= 0; i--) {
      if (this.includes(needle[i])) {
        return true;
      }
    }
  };

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
      injects.spinner.show();
      var link = encodeURIComponent($(this).data("link"));
      var length = ($(this).data("link")).length;
      if (length < 30) {
        copyToClipboard($(this).data("link"));
        chrome.runtime.sendMessage({
          msg: "This URL is short enough. Check your clipboard!"
        });
        injects.spinner.hide();
      } else {

        $.ajax({
          url: "https://www.jmdev.ca/url/algo.php?method=insert&url=" + link,
          type: 'GET',
          success: function (val) {
            if (val.result.url_short == "undefined") {
              alert('Looks like we have a problem with URL shortener... Try again!');
            } else {
              copyToClipboard('https://jmdev.ca/url/?l=' + val.result.url_short);

              chrome.runtime.sendMessage({
                msg: "URL just being shorted! Check your clipboard!"
              });
            }
          },
          error: function () {
            alert('Looks like we have a problem with URL shortener... Try again!');
          },
          complete: function () {
            injects.spinner.hide();
          }
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
    var bans_template = `<div class="col-md-6 col-xs-12">
          <h2>Latest 5 bans</h2>
          <h1 id="loading" class="text-center">Loading...</h1>
              <div class="table-responsive">
                  <table class="table table-condensed table-hover" id="bans-table">
                      <tbody>
                      </tbody>
                  </table>
              </div>
          </div>`;
    var table_wrap = '<div id="bans" class="row"><div class="col-md-6 col-xs-12" id="summary"></div></div>';

    $('body > div.wrapper > div.container.content > div > table').addClass('table-condensed table-hover');
    $('body > div.wrapper > div.container.content > div > table > tbody > tr:nth-child(1) > td:nth-child(1)').removeAttr('style');
    $('body > div.wrapper > div.container.content > div > table > tbody > tr > td:nth-child(1)').each(function () {
      $(this).css('font-weight', 'bold');
    });
    $('body > div.wrapper > div.container.content > div > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('In-game Nick');

    $('body > div.wrapper > div.container.content > div > h2').remove();
    $('.table').wrap(table_wrap);
    $(bans_template).insertAfter('#summary');
    $("<h2>Ban details</h2>").insertBefore('table.table[id!="bans-table"]');

    var steam_id = injects.modify.find('div > div > form > div.modal-body > div:nth-child(3) > input').val();

    $.ajax({
      url: "https://api.truckersmp.com/v2/bans/" + steam_id,
      type: 'GET',
      success: function (val) {
        $('#bans-table').find('tbody:last-child').append("<tr style=\"font-weight: bold;\"><th>Banned</th><th>Expires</th><th>Reason</th><th>By</th><th>Active</th></tr>");
        $(val.response).each(function () {
          var row = '<tr>';

          this.timeAdded = moment(this.timeAdded, "YYYY-MM-DD HH:mm:dd");
          this.timeAdded = this.timeAdded.format("DD MMM YYYY HH:mm");
          row += "<td>" + this.timeAdded + "</td>";

          if (this.expiration === null) {
            this.expiration = "Never"
          } else {
            this.expiration = moment(this.expiration, "YYYY-MM-DD HH:mm:dd");
            this.expiration = this.expiration.format("DD MMM YYYY HH:mm");
          }
          row += "<td>" + this.expiration + "</td>";

          row += "<td class='autolink'>" + this.reason + "</td>";
          row += "<td><a href='/user/" + this.adminID + "' target='_blank'>" + this.adminName + "</a></td>";

          if (this.active == false) {
            this.active = 'times';
          } else if (this.active == true) {
            this.active = 'check';
          }
          row += "<td><i class='fa fa-" + this.active + "'></i></td>";

          row += '</tr>';
          $('#bans-table').find('tbody:last-child').append(row);
        });
        $('#loading').remove();
        content_links();
        table_impoving();
        aftermath();
      }
    });

    function addButtons(textArea, html) {
      if (typeof textArea !== 'undefined' && html.length > 0) {
        $(textArea).css('margin-bottom', '10px');
        $(textArea).parent().append(html);
      }
    }

    addButtons(injects.accept.find('textarea[name=comment]'), construct_buttons(OwnReasons, "accepts"));
    addButtons(injects.modify.find('textarea[name=comment]'), construct_buttons(OwnReasons, "modify"));
    addButtons(injects.decline.find('textarea[name=comment]'), construct_buttons(OwnReasons, "declines"));
    addButtons($('div.container.content').find('textarea[name=comment]'), construct_buttons(OwnReasons, "comments"));

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
    dropdown_enchancements();
    permcheck();
  }

  init();
}
