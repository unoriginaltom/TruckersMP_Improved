function inject_init() {
  try {
    var table = $('table.table');

    // ===== Init bootstrapping =====
    table.addClass('table-condensed table-hover');

    $('table.table > tbody > :first(tr)').wrap('<thead class="TEMP"></thead>');
    $('table.table > tbody > thead').clone().prependTo('table.table').removeClass('TEMP');
    $('.TEMP').remove();

    var colsHead = $('table.table th'),
      colsBody = $('table.table > tbody > tr:nth-child(1) > td');

    $(colsHead).each(function (idx, item) {
      if ($(item).text().length == 0)
        $(item).addClass('no-sort');
    });

    var colsHeadTr = $('table.table tr');
    if (colsHead.length < colsBody.length) {
      for (var i = 0; i < colsBody.length - colsHead.length; i++)
        $(colsHeadTr).append('<th class="no-sort"></th>');
    }

    // ===== Transform links =====
    $('table.table > tbody > tr > td:nth-child(5) > a').each(function () {
      $(this).addClass('btn btn-default btn-block btn-sm');
      $(this).text("View");
      if (settings.viewappealblank) {
        $(this).attr('target', '_blank');
      }
    });

    $('table > tbody > tr > td:nth-child(5) > a').each(function () {
      $(this).addClass('btn btn-default btn-block btn-sm');
    });

    // ==== ? =====
    $('.form-control').each(function () {
      $(this).addClass('input-sm');
      $(this).css('width', 'auto').css('max-width', '140px')
    });
    $('form > button').addClass('btn-sm');

    colsHeadTr.each(function () {
      var status = $(this).find('td:nth-child(3)').text().trim();
      console.log('TMP Improved (inject/appeals-table)', status)
      if (status != 'Waiting for admin' && status != 'New') {
        $(this).find('td').css('color', '#555');
      }
    });

    var columns_html = '<br/><div><label style="margin-right: 5px;">Column visibility</label><div class="btn-group btn-group-xs" id="toggle_column">';
    colsHead.each(function (index, el) {
      var text = $.trim($(el).text());
      if (text) {
        columns_html += '<button type="button" class="btn btn-primary toggle-vis" data-column="' + index + '">' + text + '</button>'
      }
    });
    columns_html += '</div></div>';

    table.before(columns_html);
    table.css('width', '100%');

    // ===== Manipulation =====
    $('table.table > tbody > tr > td:nth-child(4)').each(function () {
      var text = $(this).text();
      if (text.split(" ").length != 4) {
        text = text.replace("Today,", moment().format("DD MMM"));
        text = moment(text, "DD MMM HH:mm").format("DD MMM YYYY HH:mm");
        $(this).text(text);
      }
    });
    $.fn.dataTable.moment("DD MMM YYYY HH:mm");
    var datatable = table.DataTable({
      paging: false,
      stateSave: true,
      //TEMP BUGFIX
      /*
      fixedHeader: {
        header: true,
        footer: true
      },
      */
      order: [],
      columnDefs: [{
        "targets": 'no-sort',
        "orderable": false,
      }],
      language: {
        search: "<i class='fas fa-fw fa-search'></i>"
      }
    });
  } catch (e) {
    console.error('TMP Improved (inject/appeals-table)', e);
  }

  $('#toggle_column').find('button').each(function () {
    var column = datatable.column($(this).attr('data-column'));
    if (!column.visible()) {
      $(this).removeClass('btn-primary').addClass('btn-danger')
    }
  });

  $('button.toggle-vis').on('click', function (e) {
    e.preventDefault();
    var column = datatable.column($(this).attr('data-column'));
    column.visible(!column.visible());

    if (!column.visible()) {
      $(this).removeClass('btn-primary').addClass('btn-danger')
    } else {
      $(this).addClass('btn-primary').removeClass('btn-danger')
    }
  });

  // ===== After All =====
  $(function () {
    var page = $('div.row').find('li.active').text();
    if (!page) {
      page = 1
    }

    var admin_id = $("select[name='admin_id'] option:selected").val();
    var status = $("select[name='status'] option:selected").val();
    var order = $("select[name='order'] option:selected").val();
    $(".pagination a").each(function () {
      $(this).attr('href', $(this).attr('href') + "&admin_id=" + admin_id + "&status=" + status + "&order=" + order);
    });

    $(document).prop('title', 'Page ' + page + ' - Appeals | TruckersMP');
    $("#loading-spinner").hide();
  });
}