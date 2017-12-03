var settings, storage, steamapi, OwnReasons, OwnDates, last_version, date_buttons;
var version = chrome.runtime.getManifest().version;
var syncAllowed = false;

if (chrome.storage.sync) {
  syncAllowed = true;
  storage = chrome.storage.sync;
} else {
  storage = chrome.storage.local;
}

var default_OwnReasons = {
  prefixes: "Intentional",
  reasons: "Ramming; Blocking; Incorrect Way; Insulting Users; Insulting Administration; |; Change your TruckersMP name and make a ban appeal; |; Horn Spamming; Inappropriate License/Interior Plates; Impressionating Administration; Racing; Inappropriate Overtaking; Profanity; Chat Spamming; Hacking; Speedhacking; Bug Abusing; Inappropriate Parking; Unsupported Mods; Ban Evading; Driving w/o lights; Exiting Map Boundaries; Inappropriate Convoy Management; Bullying/Harrassment; Trolling; CB Abuse; Car w/ trailer; Excessive Save Editing; Reckless Driving",
  postfixes: "// 1 m due to history; // 3 m due to history; |; // Perma due to history",
  declines: "Only a kickable offence; Wrong ID; Already banned for this evidence",
  declinesNegative: "Insufficient Evidence; No evidence; No offence",
  declinesPositive: "Proof added to existing ban",
  comments: "Passed to the right admin",
  declinesAppeals: "This time I will give you a chance but don't do this again in the feauture!; The ban will be marked with \"@BANBYMISTAKE\" and will be removed; You were banned for reckless driving.\n\nHere is a copy of the rules you broke:\n\n§2.18 Reckless Driving\nDriving in such a way that is considered unsafe, driving backwards, wrong way, failing to yield, ignoring other players and rules.\n\nYou can find these rules here: https://truckersmp.com/rules \n\nDeclined.",
  acceptsAppeals: "This time I will give you a chance, however be careful in the future!",
  commentsAppeals: "Change your tag and prove with a screenshot that it was changed",
  modifyAppeals: "Due to the lack of violations in your history I shorten your ban period. However be careful in the future and follow the rules of MP.; Due to newly emerged circumstances the period of the ban increased."
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
  var ret = {};
  $.each(object, function (key, val) {
    var arr = val.split("|");

    arr.forEach(function (val) {
      var tab = [];
      val.split(";").forEach(function (v) {
        tab.push(v.trim());
      });
      ret[key] = tab;
    });
  });
  return ret;
}

function loadSettings(callBack) {
  if (callBack) {
    storage.get({
      steamapi: 'none',
      OwnReasons: default_OwnReasons,
      OwnDates: default_OwnDates,
      last_version: version,
      settings: {
        local_storage: false,
        img_previews: true,
        wide: true,
        autoinsertsep: true,
        viewreportblank: true,
        separator: ','
      }
    }, function (items) {
      items.OwnReasons = parseItems(items['OwnReasons']);
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

function saveSettings(storage, data, with_message) {
  storage.set(data, function () {
    if (chrome.runtime.lastError) {
      alert('Save settings ERROR!\n\t\n\t' + chrome.runtime.lastError.message + '\n\t\n\tFor save large data you can use "Local Storage".');
    } else {
      if (with_message) {
        alert('Settings are saved! Please reload all TruckersMP tabs in order to fetch new settings.');
        window.close();
      }
    }
  });
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
    buttons.forEach(function(item) {
      item = item.split(',');
      var number = item[0].trim();
      var key = (item[1]) ? item[1].trim() : undefined;
      var title = (item[2]) ? item[2].trim() : ('+'+number);

      if (type == 'other') {
        if (number == 'current_utc') {
            snippet += '<button type="button" class="btn btn-link plusdate" data-number="clear" data-plus="clear">Current UTC time</button>'
        }
      } else {
        snippet += '<button type="button" class="btn btn-'+ type+' plusdate" data-number="'+ number +'" data-key="'+ key +'">'+ title +'</button>';
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
val_init().then(function(v) {
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
      chrome.runtime.sendMessage({}, function() {
        var readyStateCheckInterval = setInterval(function() {
          if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            if (chrome.storage.sync) {
              storage = chrome.storage.sync;
            } else {
              storage = chrome.storage.local;
            }
            if (typeof inject_init() === "function") {
              inject_init();
            }
          }
        }, 10);
      });
    }
  }
}).catch(function(v) {
  console.error(v);
});