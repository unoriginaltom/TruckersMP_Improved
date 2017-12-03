function inject_init() {
  // Saves options to chrome.storage
  function save_options(with_message = true, data = false) {
    var steamapi_group = $('#steamapi_group');
    steamapi_group.removeClass('has-error');

    if (!data) {
      data = {};
      data.steamapi = $('#steamapi').val();
      data.settings = {
        local_storage: $('#local_storage').is(':checked'),
        img_previews: $('#img_previews').is(':checked'),
        wide: $('#wide').is(':checked'),
        separator: $('#separator').val(),
        own_comment: $('#own_comment').val().trim(),
        autoinsertsep: $('#autoinsertsep').is(':checked'),
        viewreportblank: $('#viewreportblank').is(':checked')
      };

      data.OwnReasons = {
        prefixes: $('#prefixes').val().trim(),
        reasons: $('#reasons').val().trim(),
        postfixes: $('#postfixes').val().trim(),
        declines: $('#declines').val().trim(),
        declinesPositive: $('#declinesPositive').val().trim(),
        declinesNegative: $('#declinesNegative').val().trim(),
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

    var steamapi_error = false;
    if (data.steamapi) {
      if (data.steamapi.length !== 32) {
        steamapi_group.addClass('has-error');
        $('#steamapi_body').addClass('bg-danger');
        setTimeout(function () {
          $('#steamapi_body').removeClass('bg-danger');
        }, 2000);

        steamapi_error = true
      }
    }

    if (steamapi_error) {
      return;
    }

    if (data.settings.local_storage || !syncAllowed) {
      if (data.settings.local_storage && syncAllowed) {
        saveSettings(chrome.storage.sync, {
          settings: {
            local_storage: true
          }
        }, false);
      }
      saveSettings(chrome.storage.local, new_data, with_message);
    } else {
      saveSettings(chrome.storage.sync, new_data, with_message);
    }
  }

  function versionCompare(left, right) {
    if (typeof left + typeof right != 'stringstring')
      return false;

    var a = left.split('.'),
      b = right.split('.'),
      i = 0,
      len = Math.max(a.length, b.length);

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
    $('#ext_name').html('<i class="fa fa-truck" aria-hidden="true"></i> <strong>' + chrome.runtime.getManifest().name + '</strong> ' + chrome.runtime.getManifest().version);

    function set_options(items) {
      console.log(items);
      $('#steamapi').val(items.steamapi);

      items.OwnReasons.prefixes.forEach(function (val) {
        createSection($('#prefixes'),val);
      });
      items.OwnReasons.reasons.forEach(function (val) {
        createSection($('#reasons'),val);
      });
      items.OwnReasons.postfixes.forEach(function (val) {
        createSection($('#postfixes'), val)
      });

      items.OwnReasons.declines.forEach(function (val) {
        createSection($('#declines'),"",val);
      });
      items.OwnReasons.declinesPositive.forEach(function (val) {
        createSection($('#declinesPositive'),"",val);
      });
      items.OwnReasons.declinesNegative.forEach(function (val) {
        createSection($('#declinesNegative'),"",val);
      });
      items.OwnReasons.comments.forEach(function (val) {
        createSection($('#comments'),"",val);
      });

      items.OwnReasons.declinesAppeals.forEach(function (val) {
        createSection($('#declinesAppeals'),"",val);
      });
      items.OwnReasons.acceptsAppeals.forEach(function (val) {
        createSection($('#acceptsAppeals'),"",val);
      });
      items.OwnReasons.modifyAppeals.forEach(function (val) {
        createSection($('#modifyAppeals'),"",val);
      });
      items.OwnReasons.commentsAppeals.forEach(function (val) {
        createSection($('#commentsAppeals'),"",val);
      });

      $('#white').val(items.OwnDates.white);
      $('#yellow').val(items.OwnDates.yellow);
      $('#red').val(items.OwnDates.red);
      $('#other').val(items.OwnDates.other);

      $('#separator').val(items.settings.separator);
      $('#own_comment').val(items.settings.own_comment);

      var local_storage = $('#local_storage');
      local_storage.prop("checked", items.settings.local_storage);
      if (!syncAllowed) {
        local_storage.prop("disabled", true);
        $('.storage-settings').addClass('panel-default').removeClass('panel-success');
      }

      $('#img_previews').prop("checked", items.settings.img_previews);
      $('#wide').prop("checked", items.settings.wide);
      $('#autoinsertsep').prop("checked", items.settings.autoinsertsep);
      $('#viewreportblank').prop("checked", items.settings.viewreportblank);
    }

    loadSettings(set_options);
  }

  var import_file = $('#import_file');
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

  function createSection(parent, input1 = "", input2 = "") {
    var obj = "<div class='sortable-div'><i class='fa fa-arrows' aria-hidden='true'></i>";
    if (input2 != "") {
      obj += "<input type='text' style='width: 30%' value='"+input1+"'/><input type='text' style='width: 59%' value='"+input2+"'/>";
    } else {
      obj += "<input type='text' style='width: 90%;' value='"+input1+"'/>";
    }
    obj += "<button type='button' class='btn btn-danger'>X</button></div>";
    parent.append(obj);
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

  import_file.on('change', import_data);

  $('textarea').each(function () {
    this.setAttribute('style', 'overflow-y:hidden;');
  }).on('focus', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  }).on('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  $('#save').on('click', function (event) {
    event.preventDefault();
    save_options();
  });

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });

  $('.version_detected').on('click', function (event) {
    event.preventDefault();
    window.open(chrome.runtime.getURL('src/options/new_version.html'), "_blank");
  });

  $('#steamapi').on('focus', function () {
    if ($(this).val() === 'null') {
      $(this).val('');
    }
    $(this).select();
  }).on('keydown', function () {
    if ($(this).val().length === 32 || $(this).val().length === 0) {
      $(this).parent().removeClass('has-error')
    } else {
      $(this).parent().addClass('has-error')
    }
  });

  $('#export').on('click', function (event) {
    event.preventDefault();
    save_options(false);
    loadSettings(function (items) {
      var data = JSON.stringify(items, null, 4);
      var vLink = document.createElement('a');
      var vBlob = new Blob([data], {
        type: 'octet/stream'
      });
      var vName = 'truckersmp_improved_' + Date.now() + '.json';
      var vUrl = window.URL.createObjectURL(vBlob);

      vLink.setAttribute('href', vUrl);
      vLink.setAttribute('download', vName);
      vLink.click();
    });
  });

  $('#import').on('click', function (event) {
    event.preventDefault();
    import_file.click();
  });

  restore_options();
}