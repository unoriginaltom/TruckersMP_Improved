var settings, storage, steamapi, OwnReasons, OwnDates, last_version, date_buttons;
var version = chrome.runtime.getManifest().version;
var syncAllowed = false;

console.log()
if (window.location.protocol === 'chrome-extension:' && window.location.pathname !== '/src/bg/background.html') {
  var database = firebase.database();
}

storage = chrome.storage.local;

var default_OwnReasons = {
  prefixes: [
    ["Intentional"]
  ],
  reasons: [
    ["Ramming", "Blocking", "Incorrect Way", "Insulting Users", "Insulting Administration"],
    ["Change your TruckersMP name and make a ban appeal"],
    ["Horn Spamming", "Inappropriate License/Interior Plates", "Impressionating Administration", "Racing", "Inappropriate Overtaking", "Profanity", "Chat Spamming", "Hacking", "Speedhacking", "Bug Abusing", "Inappropriate Parking", "Unsupported Mods", "Ban Evading", "Driving w/o lights", "Exiting Map Boundaries", "Inappropriate Convoy Management", "Bullying/Harrassment", "Trolling", "CB Abuse", "Car w/ trailer", "Excessive Save Editing", "Reckless Driving"]
  ],
  postfixes: [
    ["// 1 m due to history", "// 3 m due to history"],
    ["// Perma due to history"]
  ],
  declines: [{
    "Only a kickable offence": "Only a kickable offence",
    "Wrong ID": "Wrong ID",
    "Already banned for this evidence": "Already banned for this evidence"
  }],
  declinesNegative: [{
    "Insufficient Evidence": "Insufficient Evidence",
    "No evidence": "No evidence",
    "No offence": "No offence"
  }],
  declinesPositive: [{
    "Proof added to existing ban": "Proof added to existing ban"
  }],
  comments: [{
    "Passed to the right admin": "Passed to the right admin"
  }],
  declinesAppeals: [{}],
  acceptsAppeals: [{
    "@BANBYMISTAKE": "The ban will be marked with \"@BANBYMISTAKE\" and will be removed",
    "Be careful in the future": "This time I will give you a chance, however be careful in the future!"
  }],
  commentsAppeals: [{
    "Change your tag": "Change your tag and prove with a screenshot that it was changed"
  }],
  modifyAppeals: [{
    "Ban decreased": "Due to the lack of violations in your history I shorten your ban period. However be careful in the future and follow the rules of MP.",
    "Ban increased": "Due to newly emerged circumstances the period of the ban increased."
  }],
  feedbackComments: [{
    "Closing feedback un user's request.": "Closing feedback un user's request."
  }]
};

var default_OwnDates = {
  white: "3,h,+3 hrs; 1,d,+1 day; 3,d",
  yellow: "1,w,+1 week",
  red: "1,M,+1 month; 3,M",
  other: "current_utc"
};

function checkDoubleSlash(input) {
  if (!input) {
    return;
  }
  var val = input.value,
    valLength = val.length;
  if (valLength > 1) {
    var strPos = 0;
    var br = ((input.selectionStart || input.selectionStart == '0') ?
      "ff" : (document.selection ? "ie" : false));
    if (br == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart('character', -input.value.length);
      strPos = range.text.length;
    } else if (br == "ff") {
      strPos = input.selectionStart;
    }
    if (strPos > 1) {
      var result = false;
      if (strPos > 2)
        result = val.substring(strPos - 3, strPos) == '// ';
      if (!result)
        result = val.substring(strPos - 2, strPos) == '//';
      return result;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function insertAtCaret(input, text, firstSpace) {
  if (!input) {
    return;
  }

  var strPos = 0;
  var br = ((input.selectionStart || input.selectionStart == '0') ?
    "ff" : (document.selection ? "ie" : false));
  if (br == "ie") {
    input.focus();
    var range = document.selection.createRange();
    range.moveStart('character', -input.value.length);
    strPos = range.text.length;
  } else if (br == "ff") {
    strPos = input.selectionStart;
  }

  var front = (input.value).substring(0, strPos),
    back = (input.value).substring(strPos, input.value.length),
    textVal = text;

  if (firstSpace) {
    if (front.length > 0) {
      var flOld = front.length;
      front = front.replace(/\s+$/, '');
      strPos = strPos - (flOld - front.length);
    }
    textVal = ' ' + text;
  }

  input.value = front + textVal + back;
  strPos = strPos + textVal.length;
  if (br == "ie") {
    input.focus();
    var ieRange = document.selection.createRange();
    ieRange.moveStart('character', -input.value.length);
    ieRange.moveStart('character', strPos);
    ieRange.moveEnd('character', 0);
    ieRange.select();
  } else if (br == "ff") {
    input.selectionStart = strPos;
    input.selectionEnd = strPos;
    input.focus();
  }
}

$('body > div.wrapper > div.breadcrumbs > div > h1').append(' Improved <span class="badge" data-toggle="tooltip" title="by @cjmaxik">' + version + '</span> <a href="#" id="go_to_options"><i class="fa fa-cog" data-toggle="tooltip" title="Script settings"></i></a> <a href="#" id="version_detected"><i class="fa fa-question" data-toggle="tooltip" title="Changelog"></i></a>  <i class="fa fa-spinner fa-spin" id="loading-spinner" data-toggle="tooltip" title="Loading...">');

$(function () {
  $('#go_to_options').on('click', function (event) {
    event.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
    }
  });

  $('#version_detected').on('click', function (event) {
    event.preventDefault();
    window.open(chrome.runtime.getURL('src/options/new_version.html'), "_blank");
  });
});

function parseItems(object) {
  var toObjects = ["declines", "declinesPositive", "declinesNegative", "comments", "declinesAppeals", "commentsAppeals", "acceptsAppeals", "modifyAppeals", "feedbackComments"];
  var ret = {};
  $.each(object, function (key, val) {
    if (typeof val == "string") {
      var arr = val.split("|");
      var global_tab = [];
      arr.forEach(function (val) {
        var tab;

        if (toObjects.indexOf(key) == -1) {
          tab = [];
          val.split(";").forEach(function (v) {
            tab.push(v.trim());
          });
        } else {
          tab = {};
          val.split(";").forEach(function (v) {
            tab[v.trim()] = v.trim();
          });
        }

        global_tab.push(tab);
      });
      ret[key] = global_tab;
    } else {
      ret[key] = val;
    }
  });
  return ret;
}

function loadSettings(callBack) {
  if (callBack) {
    storage.get({
      steamapi: null,
      OwnReasons: default_OwnReasons,
      OwnDates: default_OwnDates,
      last_version: version,
      settings: {
        local_storage: true,
        img_previews: true,
        wide: true,
        autoinsertsep: true,
        viewreportblank: true,
        enablebanlength: true,
        enablefeedbackimprovement: true,
        viewfeedbackblank: true,
        separator: ','
      }
    }, function (items) {
      items.OwnReasons = parseItems(items.OwnReasons);
      if (syncAllowed && items.settings.local_storage) {
        chrome.storage.local.get(items, function (items) {
          callBack(items);
        });
      } else {
        callBack(items);
      }
    });
  }
}

function loadSettingsFromFirebase() {
  if (isSignedIn) {
    database.ref('data/' + firebase.auth().currentUser.uid).once('value')
      .then(function (snapshot) {
        var json = JSON.parse(snapshot.val());
        console.log(json);

        if (json === null) {
          alert('Online storage is empty for your account :(')
          return
        }

        storage.set(json, function () {
          if (chrome.runtime.lastError) {
            alert('Save settings ERROR!\n\t\n\t' + chrome.runtime.lastError.message + '\n\t\n\tFor save large data you can use "Local Storage".');
          } else {
            window.location.reload()
          }
        });
      })
  } else {
    alert('Stop! You are not logged in!')
  }
}

function saveSettings(storage, data, with_message) {
  data.OwnReasons = parseItems(data.OwnReasons);
  storage.set(data, function () {
    if (chrome.runtime.lastError) {
      alert('Save settings ERROR!\n\t\n\t' + chrome.runtime.lastError.message + '\n\t\n\tFor save large data you can use "Local Storage".');
    } else {
      if (with_message) {
        alert('Settings are saved! Please reload all TruckersMP tabs in order to fetch new settings.');
      }
    }
  });

  if (isSignedIn) {
    database.ref('data/' + firebase.auth().currentUser.uid).set(JSON.stringify(data));
  }
}

function val_init() {
  return new Promise(function (resolve) {
    loadSettings(resolve);
  });
}

function construct_dates(OwnDates) {
  var html = '<div id="ownreasons_buttons">';

  html += each_type('default', OwnDates.white.split(';'));
  html += each_type('warning', OwnDates.yellow.split(';'));
  html += each_type('danger', OwnDates.red.split(';'));
  html += each_type('other', OwnDates.other.split(';'));

  html += '</div>';
  return html;

  function each_type(type, buttons) {
    var snippet = '<div class="btn-group" role="group">';
    buttons.forEach(function (item) {
      item = item.split(',');
      var number = item[0].trim();
      var key = (item[1]) ? item[1].trim() : undefined;
      var title = (item[2]) ? item[2].trim() : ('+' + number);

      if (type == 'other') {
        if (number == 'current_utc') {
          snippet += '<button type="button" class="btn btn-link plusdate" data-number="clear" data-plus="clear">Current UTC time</button>'
        }
      } else {
        snippet += '<button type="button" class="btn btn-' + type + ' plusdate" data-number="' + number + '" data-key="' + key + '">' + title + '</button>';
      }
    });
    snippet += '</div>   ';
    return snippet;
  }
}

function version_checker(last_version) {
  if (last_version != chrome.runtime.getManifest().version) {
    window.open(chrome.runtime.getURL('src/options/new_version.html'));
    storage.set({
      last_version: chrome.runtime.getManifest().version
    });
    return false;
  } else {
    return true;
  }
}

String.prototype.contains = function (needle) {
  for (var i = needle.length - 1; i >= 0; i--) {
    if (this.includes(needle[i])) {
      return true;
    }
  }
};

function urlShorter(link, paste = false) {
  var msg;
  var spinner = $("#loading-spinner");
  var error = false;
  spinner.show();
  $.ajax({
    url: "https://www.jmdev.ca/url/algo.php?method=insert&url=" + encodeURIComponent(link),
    type: 'GET',
    success: function (val) {
      if (val.result['error'] !== true) {
        if (val.result['url_short'] === undefined || val.result['url_short'] === null) {
          alert('Looks like we have a problem with URL shortener... Try again!');
          console.error('Received from server: ' + JSON.stringify(val));
          console.error('Sent to server: ' + encodeURIComponent(link));
          error = true;
        } else {
          copyToClipboard('https://jmdev.ca/url/?l=' + val.result['url_short']);

          if (paste) {
            msg = "Steam info just saved! Check your clipboard for the link!"
          } else {
            msg = "URL just being shorted! Check your clipboard!";
          }
        }
      } else {
        alert('Looks like we have a problem with URL shortener... Try again!');
        console.error('Received from server: ' + JSON.stringify(val));
        console.error('Sent to server: ' + encodeURIComponent(link));
        error = true;
      }
    },
    error: function () {
      if (paste) {
        copyToClipboard(link);
        alert('Steam info just saved! Check your clipboard for the link!');
      } else {
        error = true;
        alert('Looks like we have a problem with URL shortener... Try again!');
      }
    },
    complete: function () {
      if (!error) {
        chrome.runtime.sendMessage({
          msg: msg,
          contextMessage: moment().format("YYYY-MM-DD HH:mm:ss")
        });
      }
    }
  });
  spinner.hide();
}

$('.autolink').removeClass('autolink').addClass('autolinkage')

$(".autolinkage").each(function () {
  $(this).html($(this).html().replace(/((http|https):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank" rel="noopener" class="newlinks">$1</a> '));
});


function content_links() {
  $('a.newlinks').each(function () {
    var sub = $(this).text();

    if (sub.length > 60) {
      $(this).text(sub.substring(0, 40) + '...');
    }

    if (sub.contains(["prnt.sc"])) {

    }

    if (sub.contains(["youtube.com", "youtu.be"]) && !sub.contains(["img.youtube.com"])) {
      $(this).append('<a data-link="' + sub + '" href="#" class="youtube">  <i class="fa fa-youtube-play fa-fw" data-toggle="tooltip" title="Watch this video in modal"></i></a>');
    } else if (sub.contains(["clips.twitch.tv", "plays.tv/video", "dailymotion.com", "vimeo.com", "twitch.tv/videos"])) {
      var clipid, embedlink;
      if (sub.contains(["clips.twitch.tv"])) {
        clipid = sub.match(/^.*clips\.twitch\.tv\/(.*)/)[1];
        embedlink = "https://clips.twitch.tv/embed?clip=" + clipid + "&autoplay=false";
      } else if (sub.contains(["plays.tv/video"])) {
        clipid = sub.match(/^.*plays\.tv\/video\/(.*)/)[1];
        embedlink = "https://plays.tv/embeds/" + clipid;
      } else if (sub.contains(["dailymotion.com"])) {
        clipid = sub.match(/^.*dailymotion\.com\/video\/(.*)/)[1];
        embedlink = "https://www.dailymotion.com/embed/video/" + clipid;
      } else if (sub.contains(["vimeo.com"])) {
        clipid = sub.match(/^.*vimeo\.com\/(.*)/)[1];
        embedlink = "https://player.vimeo.com/video/" + clipid;
      } else if (sub.contains(["twitch.tv/videos"])) {
        var result = sub.match(/^.*twitch.tv\/videos\/(.*)/)[1];
        var vidinfos = result.split("?t=");
        embedlink = "https://player.twitch.tv/?autoplay=false&video=" + vidinfos[0];
        if (vidinfos.length == 2) {
          embedlink += "&t=" + vidinfos[1]
        }
      }
      $(this).append('<a href="' + embedlink + '" class="video">  <i class="fa fa-play-circle fa-fw" data-toggle="tooltip" title="Watch this video in modal"></i></a>');
    }

    $(this).append(`    <a href="#" class="jmdev_ca" data-link="${sub}"><i class="fa fa-copy fa-fw" data-toggle="tooltip" title="Shorted + to clipboard"></i></a>`);
  });

  if (settings.img_previews !== false) {
    $('div.comment .autolinkage > a').each(function () {
      var sub = $(this).attr('href');

      sub = sub.replace(/prnt.sc/gi, 'prntscr.com')

      if ((sub.match(/\.(jpeg|jpg|gif|png)$/) !== null || sub.contains(['images.akamai.', 'prntscr.com', 'img.youtube.com']))) {
        $('<img src="' + sub + '" class="img-responsive img-thumbnail" alt="' + sub + '"><br>').insertBefore($(this));
      }
    });
  }


  $('a.jmdev_ca').on('click', function (event) {
    event.preventDefault();
    var spinner = $("#loading-spinner");
    spinner.show();
    var link = String($(this).data("link"));
    var length = link.length;

    if (length < 30) {
      copyToClipboard($(this).data("link"));
      chrome.runtime.sendMessage({
        msg: "This URL is short enough. Check your clipboard!",
        contextMessage: moment().format("YYYY-MM-DD HH:mm:ss")
      });
      spinner.hide();
    } else {
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        copyToClipboard('https://youtu.be/' + getYouTubeIdFromUrl(link) + checkTimestamps(link));
        chrome.runtime.sendMessage({
          msg: "URL just being shorted! Check your clipboard!",
          contextMessage: moment().format("YYYY-MM-DD HH:mm:ss")
        });
      } else {
        urlShorter(link);
      }
    }
  });
}


function getYouTubeIdFromUrl(youtubeUrl) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = youtubeUrl.match(regExp);
  console.log(youtubeUrl);
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

$("#favicon").attr("href", chrome.extension.getURL("/icons/icon48.png"));

val_init().then(function (v) {
  if (v.OwnReasons == null || v.OwnDates == null) {
    alert("Hello! Looks like this is your first try in TruckersMP Improved! I'll open the settings for you...");
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
    }
  } else {
    OwnReasons = v.OwnReasons;
    OwnDates = v.OwnDates;
    last_version = v.last_version;
    steamapi = v.steamapi;
    settings = v.settings;
    date_buttons = construct_dates(OwnDates);
    if (version_checker(last_version)) {
      chrome.runtime.sendMessage({}, function () {
        var readyStateCheckInterval = setInterval(function () {
          if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            storage = chrome.storage.local;
            if (typeof inject_init() === "function") {
              inject_init();
            }
          }
        }, 10);
      });
    }
  }
}).catch(function (v) {
  console.error(v);
});