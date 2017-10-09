var default_OwnReasons = {
    prefixes: "Intentional",
    reasons: "Ramming; Blocking; Incorrect Way; Insulting Users; Insulting Administration; |; Change your TruckersMP name and make a ban appeal; |; Horn Spamming; Inappropriate License/Interior Plates; Impressionating Administration; Racing; Inappropriate Overtaking; Profanity; Chat Spamming; Hacking; Speedhacking; Bug Abusing; Inappropriate Parking; Unsupported Mods; Ban Evading; Driving w/o lights; Exiting Map Boundaries; Inappropriate Convoy Management; Bullying/Harrassment; Trolling; CB Abuse; Car w/ trailer; Excessive Save Editing; Reckless Driving",
    postfixes: "// 1 m due to history; // 3 m due to history; |; // Perma due to history",
    declines: "Insufficient Evidence; No evidence; Only a kickable offence; Wrong ID; No offence; Already banned for this evidence",
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
var storage;

if (chrome.storage.sync) {
    storage = chrome.storage.sync;
} else {
    storage = chrome.storage.local;
}

// Saves options to chrome.storage
function save_options(with_message = true, data = false) {
    $('#steamapi_group').removeClass('has-error');

    if (!data) {
        data = {};
        data.steamapi = $('#steamapi').val();
        data.settings = {
            img_previews: $('#img_previews').is(':checked'),
            wide: $('#wide').is(':checked'),
            separator: $('#separator').val(),
            own_comment: $('#own_comment').val().trim(),
	        autoinsertsep: $('#autoinsertsep').is(':checked')
        };

        data.OwnReasons = {
            prefixes: $('#prefixes').val().trim(),
            reasons: $('#reasons').val().trim(),
            postfixes: $('#postfixes').val().trim(),
            declines: $('#declines').val().trim(),
            comments: $('#comments').val().trim(),
            declinesAppeals: $('#declinesAppeals').val().trim(),
            commentsAppeals: $('#commentsAppeals').val().trim(),
            acceptsAppeals: $('#acceptsAppeals').val().trim(),
            modifyAppeals: $('#modifyAppeals').val().trim()
        };

        data.OwnDates = {
            white: $('#white').val().trim(),
            yellow: $('#yellow').val().trim(),
            red: $('#red').val().trim(),
            other: $('#other').val().trim()
        }
    }

    var new_data = {
        steamapi: data.steamapi,
        OwnReasons: data.OwnReasons,
        OwnDates: data.OwnDates,
        settings: data.settings
    };

    if (data.steamapi.length == 32) {
        storage.set(new_data, function() {
            if (with_message) {
                alert("Settings are saved! Please reload all TruckersMP tabs in order to fetch new settings.");
                window.close();
            }
        });
    } else {
        $('#steamapi_group').addClass('has-error');
        $('#steamapi_body').addClass('bg-danger');
        setTimeout(function() {
            $('#steamapi_body').removeClass('bg-danger');
        }, 2000);
    }
}

function versionCompare(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;

    var a = left.split('.')
    ,   b = right.split('.')
    ,   i = 0, len = Math.max(a.length, b.length);

    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
        }
    }

    return 0;
}

function restore_options() {
    $('#ext_name').html('<strong>' + chrome.runtime.getManifest().name + '</strong> ' + chrome.runtime.getManifest().version);
  
    storage.get({
        steamapi: 'none',
        OwnReasons: default_OwnReasons,
        OwnDates: default_OwnDates,
        settings: {
            img_previews: true,
            wide: true,
            autoinsertsep: true,
            separator: ','
        }
    }, function(items) {
        $('#steamapi').val(items.steamapi);

        $('#prefixes').val(items.OwnReasons.prefixes);
        $('#reasons').val(items.OwnReasons.reasons);
        $('#postfixes').val(items.OwnReasons.postfixes);
        $('#declines').val(items.OwnReasons.declines);
        $('#comments').val(items.OwnReasons.comments);
        $('#declinesAppeals').val(items.OwnReasons.declinesAppeals);
        $('#acceptsAppeals').val(items.OwnReasons.acceptsAppeals);
        $('#modifyAppeals').val(items.OwnReasons.modifyAppeals);
        $('#commentsAppeals').val(items.OwnReasons.commentsAppeals);

        $('#white').val(items.OwnDates.white);
        $('#yellow').val(items.OwnDates.yellow);
        $('#red').val(items.OwnDates.red);
        $('#other').val(items.OwnDates.other);

        $('#separator').val(items.settings.separator);
        $('#own_comment').val(items.settings.own_comment);

        $('#img_previews').prop("checked", items.settings.img_previews);
        $('#wide').prop("checked", items.settings.wide);
        $('#autoinsertsep').prop("checked", items.settings.autoinsertsep);
    });
}

function import_data(event) {
    if (confirm("BEWARE! All of your data will be lost after importing!\nDo you really want to do that?")) {
        $('#importExportModal').modal('hide');
        var files = event.target.files;
        var reader = new FileReader();
        reader.onload = _imp;
        reader.readAsText(files[0]);
    } else {
        import_file.value = '';
    }
}

function _imp() {
    var _data = JSON.parse(this.result);

    if (_data.steamapi) {
        if (_data.steamapi.length == 32) {
            var compare = versionCompare(_data.last_version, chrome.runtime.getManifest().version);
            if (compare === 1) {
                alert('Wait a second! JSON file version (' + _data.last_version + ') is newer that extension version (' + chrome.runtime.getManifest().version + ').\nPlease update extension before importing!');
            } else {
                if (compare === -1) {
                    if (!confirm('Wait a second! JSON file version (' + _data.last_version + ') is older that extension version (' + chrome.runtime.getManifest().version + ').\nData can be corrupted.\nDid you really want to import data?')) {
                        import_file.value = '';
                        return null;
                    }
                }
                save_options(false, _data);
                alert("Imported and saved! Nice job!\nYou can review new settings right now.");
                restore_options();
            }
        } else {
            alert("JSON file is invalid!\nSteam API should be 32-symbol, given " + _data.steamapi.length);
        }
    }

    import_file.value = '';
}

document.addEventListener('DOMContentLoaded', restore_options);
import_file.addEventListener('change', import_data, false);

$(document).ready(function(){
    $('textarea').each(function () {
        this.setAttribute('style', 'overflow-y:hidden;');
    }).on('focus', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    $('#save').on('click', function(event) {
        event.preventDefault();
        save_options();
    });

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

    $('.version_detected').on('click', function(event) {
        event.preventDefault();
        window.open(chrome.runtime.getURL('src/options/new_version.html'), "_blank");
    });

    $('#steamapi').on('focus', function () {
        if ($(this).val() === 'null') {
            $(this).val('');
        }
        $(this).select();
    });

    $('#export').on('click', function(event) {
        event.preventDefault();
        save_options(false);

        storage.get(null, function (items) {
            var data = JSON.stringify(items, null, 4);
            var vLink = document.createElement('a');
            var vBlob = new Blob([data], {type: 'octet/stream'});
            var vName = 'truckersmp_improved_' + Date.now() + '.json';
            var vUrl = window.URL.createObjectURL(vBlob);

            vLink.setAttribute('href', vUrl);
            vLink.setAttribute('download', vName);
            vLink.click();
        });
    });

    $('#import').on('click', function(event) {
        event.preventDefault();

        import_file.click();
    });
});
