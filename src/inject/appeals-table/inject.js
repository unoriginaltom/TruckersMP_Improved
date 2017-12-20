function inject_init() {
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

  if (colsHead.length < colsBody.length) {
    var colsHeadTr = $('table.table tr');
    for (var i = 0; i < colsBody.length - colsHead.length; i++)
      $(colsHeadTr).append('<th class="no-sort"></th>');
  }

  // ===== Transform links =====
  $('table.table > tbody > tr > td:nth-child(5) > a').each(function () {
    $(this).addClass('btn btn-default btn-block btn-sm');
    $(this).text("View");
    if (settings.viewreportblank) {
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

  $('table.table tr').each(function () {
    if ($(this).find('td:nth-child(3)').text() == 'Waiting for player') {
      $(this).find('td').css('color', '#555');
    }
  });

  var columns_html = '<br/><div><label style="margin-right: 5px;">Column visibility</label><div class="btn-group btn-group-xs" id="toggle_column">';
  $('table.table th').each(function (index, el) {
    var text = $.trim($(el).text());
    if (text) {
      columns_html += '<button type="button" class="btn btn-primary toggle-vis" data-column="' + index + '">' + text + '</button>'
    }
  });
  columns_html += '</div></div>';

  table.before(columns_html);
  table.css('width', '100%');

  // ===== Manipulation =====
  var datatable = table.DataTable({
    paging: false,
    stateSave: true,
    fixedHeader: true,
    order: [
      [3, "desc"]
    ],
    columnDefs: [{
      "targets": 'no-sort',
      "orderable": false,
    }],
    language: {
      search: "<i class='fa fa-fw fa-search'></i>"
    }
  });

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
      $(this).attr('href', $(this).attr('href')+"&admin_id="+admin_id+"&status="+status+"&order="+order);
    });
    
    $(document).prop('title', 'Page ' + page + ' - Appeals | TruckersMP');
    $("#loading-spinner").hide();
  });
}