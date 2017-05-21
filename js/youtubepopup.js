/*!
 * Bootstrap YouTube Popup Player Plugin
 * http://lab.abhinayrathore.com/bootstrap-youtube/
 * https://github.com/abhinayrathore/Bootstrap-Youtube-Popup-Player-Plugin
 */

(function ($) {
    var $YouTubeModal = null,
        $YouTubeModalDialog = null,
        $YouTubeModalTitle = null,
        $YouTubeModalBody = null,
        margin = 5,
        methods;

    //Plugin methods
    methods = {
        //initialize plugin
        init: function (options) {
            options = $.extend({}, $.fn.YouTubeModal.defaults, options);

        // initialize YouTube Player Modal
        if ($YouTubeModal == null) {
            $YouTubeModal = $('<div class="modal fade ' + options.cssClass + '" id="YouTubeModal" role="dialog" aria-hidden="true">');
            var modalContent = '<div class="modal-dialog modal-lg" id="YouTubeModalDialog">' +
                                '<div class="modal-content" id="YouTubeModalContent">' +
                                  '<div class="modal-header">' +
                                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                    '<h4 class="modal-title" id="YouTubeModalTitle"></h4>' +
                                  '</div>' +
                                  '<div class="modal-body" id="YouTubeModalBody" style="padding:0;"></div>' +
                                '</div>' +
                              '</div>';
            $YouTubeModal.html(modalContent).hide().appendTo('body');
            $YouTubeModalDialog = $("#YouTubeModalDialog");
            $YouTubeModalTitle = $("#YouTubeModalTitle");
            $YouTubeModalBody = $("#YouTubeModalBody");
            $YouTubeModal.modal({
                show: false
            }).on('hide.bs.modal', resetModalBody);
        }

        return this.each(function () {
            var obj = $(this);
            var data = obj.data('YouTube');
            if (!data) { //check if event is already assigned
                obj.data('YouTube', {
                    target: obj
                });
                $(obj).bind('click.YouTubeModal', function (event) {
                    var youtubeId = options.youtubeId;
                    var start = options.start;

                    if ($.trim(youtubeId) == '' && obj.is("a")) {
                        youtubeId = getYouTubeIdFromUrl(obj.attr("href"));
                        var params = parseURLParams(obj.attr("href"));

                        if (params) {
                            if (params.t) {
                                console.log('t');
                                start = params.t[0];
                                console.log(start);
                                if (start.includes('s')) {
                                    var hrs, min, sec;

                                    spl = start.split('h');
                                    if (spl.length == 2) {
                                        hrs = Number(spl[0]);
                                        spl = spl[1];
                                    } else {
                                        hrs = 0;
                                        spl = spl[0];
                                    };

                                    spl = spl.split('m');
                                    if (spl.length == 2) {
                                        min = Number(spl[0]);
                                        spl = spl[1];
                                    } else {
                                        min = 0;
                                        spl = spl[0];
                                    };

                                    spl = spl.split('s');
                                    sec = Number(spl[0]);

                                    hrs = hrs * 3600;
                                    min = min * 60;
                                    start = hrs + min + sec;
                                };
                            } else if (params.time_continue) {
                                console.log('time_continue');
                                start = params.time_continue[0];
                            } else {
                                console.log('out');
                                start = params[0];
                            }
                        };
                    }

                    if ($.trim(youtubeId) == '' || youtubeId === false) {
                        youtubeId = obj.attr(options.idAttribute);
                    }

                    var videoTitle = $.trim(options.title);

                    if (videoTitle == '') {
                        videoTitle = obj.attr('title');
                    }

                    if (videoTitle) {
                        setModalTitle(videoTitle);
                    }

                    resizeModal(options.width);

                    //Setup YouTube Modal
                    var YouTubeURL = getYouTubeUrl(youtubeId, start, options);
                    var YouTubePlayerIframe = getYouTubePlayer(YouTubeURL, options.width, options.height);
                    setModalBody(YouTubePlayerIframe);
                    $YouTubeModal.modal('show');

                    event.preventDefault();
                });
            }
        });
    },

        destroy: function () {
            return this.each(function () {
                $(this).unbind(".YouTubeModal").removeData('YouTube');
            });
        }
    };

    function setModalTitle(title) {
        $YouTubeModalTitle.html($.trim(title));
    }

    function setModalBody(content) {
        $YouTubeModalBody.html(content);
    }

    function resetModalBody() {
        setModalTitle('');
        setModalBody('');
    }

    function resizeModal(w) {
      // $YouTubeModalDialog.css({
      //     width: w + (margin * 1.5)
      // });
    }

    function getYouTubeUrl(youtubeId, start, options) {
        return "//www.youtube.com/embed/" + youtubeId + "?rel=0& + showsearch=0&autohide=" + options.autohide +
        "&autoplay=" + options.autoplay + "&start=" + start + "&controls=" + options.controls + "&fs=" + options.fs + "&loop=" + options.loop +
        "&showinfo=" + options.showinfo + "&color=" + options.color + "&theme=" + options.theme + "&wmode=transparent";
    }

    function getYouTubePlayer(URL, width, height) {
        return '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" title="YouTube video player" width="' + width + '" height="' + height + '" style="margin:0; padding:0; box-sizing:border-box; border:0; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; margin:' + (margin - 1) + 'px;" src="' + URL + '" frameborder="0" allowfullscreen seamless></iframe></div>';
    }

    function getYouTubeIdFromUrl(youtubeUrl) {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = youtubeUrl.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return false;
        }
    }

    function parseURLParams(url) {
        var queryStart = url.indexOf("?") + 1,
            queryEnd   = url.indexOf("#") + 1 || url.length + 1,
            query = url.slice(queryStart, queryEnd - 1),
            pairs = query.replace(/\+/g, " ").split("&"),
            parms = {}, i, n, v, nv;

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

    $.fn.YouTubeModal = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on Bootstrap.YouTubeModal');
        }
    };

    //default configuration
    $.fn.YouTubeModal.defaults = {
        youtubeId: '',
        title: 'YouTube Preview',
        useYouTubeTitle: false,
        idAttribute: 'rel',
        cssClass: 'YouTubeModal ets2mp-modal',
        width: 1024,
        height: 768,
        autohide: 2,
        autoplay: 1,
        color: 'red',
        controls: 1,
        fs: 1,
        loop: 0,
        showinfo: 0,
        theme: 'light',
        start: 0
    };
})(jQuery);