if (!chrome.extension.sendMessage) {
    inject_init('firefox');
    // alert("Firefox");
} else {
    chrome.extension.sendMessage({}, function(response) {
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                inject_init('chrome');
                // alert("Chrome");
            }
        }, 10);
    });
}

function inject_init(browser) {
    // console.log(browser);

    var storage;
    if (chrome.storage.sync) {
        storage = chrome.storage.sync;
    } else {
        storage = chrome.storage.local;
    }
    var steam_id = $('input[name="steam_id"]').val();

    val_init().then(function(v) {
            if (v.OwnReasons == null) {
                alert("Hello! Looks like this is your first try in Reports Improved! I'll open the settings for you...");
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('src/options/index.html'), "_blank");
                }
            } else {
                OwnReasons = v.OwnReasons;
                last_version = v.last_version;
                steamapi = v.steamapi;
                settings = v.settings;
                init();
            }
        }).catch(function(v) {
        console.error(v);
    });

    function val_init() {
        var steamapi, OwnReasons, last_version;
        return new Promise(function(resolve, reject) {
            storage.get({
                steamapi: null,
                OwnReasons: null,
                last_version: chrome.runtime.getManifest().version,
                settings: {}
            }, function(items) {
                resolve(items);
            });
        });
    }

    function init() {
        var version = chrome.runtime.getManifest().version;

        $('body > div.wrapper > div.breadcrumbs > div > h1').append(' Improved <span class="badge" data-toggle="tooltip" title="by @cjmaxik">' + version + '</span> <a href="#" id="go_to_options"><i class="fa fa-cog" data-toggle="tooltip" title="Script settings"></i></a> <a href="#" id="version_detected"><i class="fa fa-question" data-toggle="tooltip" title="Changelog"></i></a>  <i class="fa fa-spinner fa-spin" id="loading-spinner" data-toggle="tooltip" title="Loading..."></i>');

        var bans_template = `<div class="col-md-6 col-xs-12">
            <h2>Lastest 5 bans</h2>
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
        $('body > div.wrapper > div.container.content > div > table > tbody > tr > td:nth-child(1)').each(function(index, el) {
            $(this).css('font-weight', 'bold');
        });
        $('body > div.wrapper > div.container.content > div > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('In-game Nick');

        $('body > div.wrapper > div.container.content > div > h2').remove();
        $('.table').wrap(table_wrap);
        $(bans_template).insertAfter('#summary');
        $("<h2>Ban details</h2>").insertBefore('table.table[id!="bans-table"]');

        var steam_id = $('#confirm-modify > div > div > form > div.modal-body > div:nth-child(3) > input').val();

        $.ajax({
            url: "https://api.truckersmp.com/v2/bans/" + steam_id,
            type: 'GET',
            success: function(val) {
                $('#bans-table > tbody:last-child').append("<tr style=\"font-weight: bold;\"><th>Banned</th><th>Expires</th><th>Reason</th><th>By</th><th>Active</th></tr>");
                $(val.response).each(function() {
                    var row;
                    row += '<tr>';

                    this.timeAdded = new moment(this.timeAdded);
                    this.timeAdded = this.timeAdded.format("DD MMM YYYY HH:mm");
                    row += "<td>" + this.timeAdded +"</td>";

                    if (this.expiration === null) {
                        this.expiration = "Never"
                    } else {
                        this.expiration = new moment(this.expiration);
                        this.expiration = this.expiration.format("DD MMM YYYY HH:mm");
                    };
                    row += "<td>" + this.expiration +"</td>";

                    row += "<td class='autolink'>" + this.reason +"</td>";
                    row += "<td><a href='/user/" + this.adminID + "' target='_blank'>" + this.adminName +"</a></td>";

                    if (this.active == false) {
                        this.active = 'times';
                    } else if (this.active == true) {
                        this.active = 'check';
                    };
                    row += "<td><i class='fa fa-" + this.active +"'></i></td>";

                    row += '</tr>';
                    $('#bans-table > tbody:last-child').append(row);
                });
                $('#loading').remove();
                content_links();
                table_impoving();
                aftermath();
            },
            error: function(val) {
                // console.log(val);
            }
        });
    };

    function escapeHTML(s) {
        return s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function table_impoving() {
        $('table').addClass('table-condensed table-hover');

        if (steamapi !== null) {
            $.ajax({
                url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + steamapi + "&format=json&steamids=" + steam_id,
                type: 'GET',
                success: function(val) {
                    // console.log(val);
                    if (val === undefined) {
                        // console.error('No Response by Steam');
                        $("#loading-error").show();
                        $("#loading-spinner").hide();
                        blink('#loading-error');
                        return;
                    }
                    var player_data = val;
                    var steam_name = escapeHTML(player_data.response.players[0].personaname);
                    $('#summary > table > tbody > tr:nth-child(2) > td:nth-child(1)').text('TruckersMP');
                    $('#summary > table > tbody > tr:nth-child(2) > td:nth-child(2)').html('<kbd>' + $('#summary > table > tbody > tr:nth-child(2) > td:nth-child(2)').text() + '</kbd>');

                    var steam_link = '<tr><td>Steam</td><td> <a href="https://steamcommunity.com/profiles/' + steam_id + '" target="_blank"><kbd>' + steam_name + '</kbd></a> <img src="' + player_data.response.players[0].avatar + '" class="img-rounded"></td></tr>';
                    $(steam_link).insertAfter('#summary > table > tbody > tr:nth-child(2)');
                    $.ajax({
                        url: "https://steamcommunity.com/profiles/" + steam_id + "/ajaxaliases",
                        type: 'GET',
                        success: function(val) {
                            var steam_aliases = val;
                            var aliases = "";
                            if (!$.isEmptyObject(steam_aliases)) {
                                for (var key in steam_aliases) {
                                    var alias = steam_aliases[key].newname.trim();
                                    var timechanged = steam_aliases[key].timechanged;
                                    if (alias) {
                                        if (alias != steam_name) {
                                            aliases += '<kbd  data-toggle="tooltip" title="' + timechanged + '">' + escapeHTML(alias) + '</kbd>   ';
                                        }
                                    };
                                }
                                if (aliases.length) {
                                    aliases = '<tr><td>Aliases</td><td>' + aliases + '</td></tr>';
                                    $(aliases).insertAfter('#summary > table > tbody > tr:nth-child(3)');
                                };
                            }
                            $('[data-toggle="tooltip"]').tooltip();

                            $("#loading-spinner").hide();
                        },
                        error: function(val) {
                            console.log(val);
                        }
                    });
                }
            });
        };

        $('input[type=radio][name=perma]').change(function() {
            if (this.id == 'perma.true') {
                $('#ownreasons_buttons').slideUp('fast');
                $('#datetimeselect').slideUp('fast');
                $('label[for=\'perma.true\']').addClass('text-danger').addClass('lead').addClass('text-uppercase');
            } else if (this.id == 'perma.false') {
                $('#ownreasons_buttons').slideDown('fast');
                $('#datetimeselect').slideDown('fast');
                $('label[for=\'perma.true\']').removeClass('text-danger').removeClass('lead').removeClass('text-uppercase');
            }
        });
        $('input[name=reason]').attr('autocomplete', 'off');
        $('input[name=expire]').attr('autocomplete', 'off');
    };

    function aftermath() {
        $(function () {
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

        $(document).prop('title', $('table.table > tbody > tr:nth-child(1) > td:nth-child(2) > a').text() + '\'s Ban Appeal - TruckersMP');

        $(".comment > p").each(function(index, el) {
            $('<hr style="margin: 10px 0 !important;">').insertAfter(this);
            $(this).wrap("<blockquote></blockquote>");
            if (!$(this).text().length) {
                $(this).html('<i>Empty comment</i>');
            };
        });

        if (settings.wide !== false) {
            $('div.container.content').css('width', '85%');
        };

        $(function() {
            $(".youtube").YouTubeModal({autoplay:0, width:640, height:480});
        });

        $("#loading-spinner").remove();
    }

    String.prototype.contains = function (needle) {
        for (var i = needle.length - 1; i >= 0; i--) {
            if (this.includes(needle[i])) {
                return true;
            };
        };
    };

    function content_links() {
        $('.autolink > a').each(function() {
            var sub = $(this).attr('href');
            var copy_link = '   <a href="#" class="jmdev_ca" data-link="' + sub + '"><i class="fa fa-copy fa-fw" data-toggle="tooltip" title="Shorted + to clipboard"></i></a> ';

            $(this).after(copy_link);

            if (sub.contains(["youtube.com", "youtu.be"])) {
                $('<a href="' + sub + '" class="youtube">  <i class="fa fa-youtube-play fa-fw" data-toggle="tooltip" title="Watch this video in modal"></i></a>').insertAfter($(this));
            };

            if (sub.length > 60) {
                $(this).text(sub.substring(0, 40) + '...');
            }
        });

        if (settings.img_previews !== false) {
            $('div.comment .autolink > a').each(function () {
                var sub = $(this).attr('href');
                // console.log(sub);
                if (sub.contains(['.png', '.jpg', ".gif", "images.akamai."])) {
                    $('<img src="' + sub + '" class="img-responsive img-thumbnail" alt="' + sub + '"><br>').insertBefore($(this));
                };
            });
        }

        $('a.jmdev_ca').on('click', function(event) {
            event.preventDefault();
            $("#loading-spinner").show();
            var link = encodeURIComponent($(this).data("link"));
            var length = ($(this).data("link")).length;
            // console.log(chrome);
            if (length < 30) {
                copyToClipboard($(this).data("link"));
                chrome.runtime.sendMessage({
                    msg: "This URL is short enough. Check your clipboard!"
                });
                $("#loading-spinner").hide();
            } else {
                $.ajax({
                    url: "https://www.jmdev.ca/url/algo.php?method=insert&url=" + link,
                    type: 'GET',
                    success: function(val) {
                        copyToClipboard('https://jmdev.ca/url/?l=' + val.result.url_short);
                        chrome.runtime.sendMessage({
                            msg: "URL just being shorted! Check your clipboard!"
                        });
                    },
                    error: function() {
                        alert('Looks like we have a problem with URL shortener... Try again!');
                    },
                    complete: function() {
                        $("#loading-spinner").hide();
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
    };
}