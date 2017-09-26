if (!chrome.extension.sendMessage) {
    init();
} else {
    chrome.extension.sendMessage({}, function(response) {
    	var readyStateCheckInterval = setInterval(function() {
        	if (document.readyState === "complete") {
        		clearInterval(readyStateCheckInterval);
                init();
        	}
    	}, 10);
    });
}


function init() {
    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    // ----------------------------------------------------------

    // INIT
    var version = chrome.runtime.getManifest().version;
	
    $('body > div.wrapper > div.breadcrumbs > div > h1').append(' Table Improved <span class="badge" data-toggle="tooltip" title="by @cjmaxik">' + version + '</span> <a href="#" id="go_to_options"><i class="fa fa-cog" data-toggle="tooltip" title="Script settings"></i></a> <a href="#" id="version_detected"><i class="fa fa-question" data-toggle="tooltip" title="Changelog"></i></a>  <i class="fa fa-spinner fa-spin" id="loading-spinner" data-toggle="tooltip" title="Loading..."></i>');

    // ===== Bootstrapping =====
    $('table.table').addClass('table-condensed table-hover');

    $('table.table > tbody > :first(tr)').wrap('<thead class="TEMP"></thead>');
    $('table.table > tbody > thead').clone().prependTo('table.table').removeClass('TEMP');
    $('.TEMP').remove();

    var colsHead = $('body > div.wrapper > div.container.content > div > table > thead > tr > th'),
    	colsBody = $('body > div.wrapper > div.container.content > div > table > tbody > tr:nth-child(1) > td');

    if(colsHead.length < colsBody.length){
    	var colsHeadTr = $('body > div.wrapper > div.container.content > div > table > thead > tr');
    	for (i = 0; i < colsBody.length - colsHead.length; i++)
		    $(colsHeadTr).append('<th class="no-sort"></th>');
    };
    $(colsHead).each(function(idx, item){
    	if($(item).text().length == 0)
    		$(item).addClass('no-sort');
    });
    $('body > div.wrapper > div.container.content > div > table > thead > tr > th:nth-child(9)').addClass('no-sort');

    $('body > div.wrapper > div.container.content > div > table > tbody > tr > td:nth-child(9) > a').each(function(index, el) {
        $(this).addClass('btn btn-default btn-block btn-sm');
        $(this).text($(this).text().replace("report","").trim());
    });

    $('body > div.wrapper > div.container.content > div > table > tbody > tr > td:nth-child(10) > a').each(function(index, el) {
        $(this).addClass('btn btn-primary btn-block btn-sm claim');

        var text = $(this).text().replace("report"," ").trim();

        if (text == "Claim") {
            $(this).html(text + " <i class=\"fa fa-external-link\"></i>");
            $(this).attr('target', '_blank');
        } else {
            $(this).html(text);
        };
    });

    $('a.claim').click(function(event) {
        event.preventDefault();
        if (event.which == 1 || event.which == 2) {
            $(this).addClass('clicked');
            $(this).text('Claimed!');
        };

        if (event.ctrlKey) {
            window.open($(this).attr('href'), "_top");
        } else {
            window.open($(this).attr('href'), "_blank");
        }
    });

    // ==== ? =====
    $('.form-control').each(function(index, el) {
        $(this).addClass('input-sm')
        $(this).css('width', 'auto').css('max-width', '140px')
    });
    $('body > div.wrapper > div.container.content > div > form > button').addClass('btn-sm')

    $('body > div.wrapper > div.container.content > div > table > tbody > tr').each(function(index, el) {
        if ($(this).children('td:nth-child(7)').text() == 'Waiting for player') {
            $(this).find('td').css('color', '#555');
        }
    });

    $('table.table').before(`<div id="toggle_column">
                    <label>Toggle column</label>
                    <kbd><a class="toggle-vis" data-column="0">Reported by</a></kbd>
                    <kbd><a class="toggle-vis" data-column="1">Perpetrator</a></kbd>
                    <kbd><a class="toggle-vis" data-column="2">Server</a></kbd>
                    <kbd><a class="toggle-vis" data-column="3">Reason</a></kbd>
                    <kbd><a class="toggle-vis" data-column="4">Language</a></kbd>
                    <kbd><a class="toggle-vis" data-column="5">Claimed by</a></kbd>
                    <kbd><a class="toggle-vis" data-column="6">Status</a></kbd>
                    <kbd><a class="toggle-vis" data-column="7">Updated at</a></kbd>
                </div>`)
    $('table.table').css('width', '100%');

    // ===== Manipulation =====
    var datatable = $('table.table').DataTable({
        paging: false,
        stateSave: true,
        fixedHeader: true,
		order: [[ 7, "desc" ]],
		columnDefs: [{
			"targets": 'no-sort',
			"orderable": false,
		}]
        // responsive: true
    });

    $('div#toggle_column > kbd > a').each(function(index, el) {
//        console.log(el)
        var column = datatable.column($(this).attr('data-column'))
        if (!column.visible()) {
            $(this).addClass('hiddenToggle')
        }
    });

    $('a.toggle-vis').on('click', function (e) {
        e.preventDefault();
        var column = datatable.column($(this).attr('data-column'));
        column.visible(!column.visible());

        if (!column.visible()) {
            $(this).addClass('hiddenToggle')
        } else {
            $(this).removeClass('hiddenToggle')
        }
    });

    // ===== After All =====
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
        $('.claim').tooltip({
            title: "Press Ctrl to open report in the same tab",
        });

        var page = $('div.row').find('li.active').text();
        if (!page) {page = 1};
        $(document).prop('title', 'Page ' + page + ' - Reports | TruckersMP');

        $('#go_to_options').on('click', function(event) {
            event.preventDefault();
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
            }
        });

        $('#version_detected').on('click', function(event) {
            event.preventDefault();
            window.open(chrome.runtime.getURL('src/options/new_version.html'), "_blank");
        });
    });
    $("#loading-spinner").remove();
}