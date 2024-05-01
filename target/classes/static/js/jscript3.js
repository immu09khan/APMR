/* @license GNU-GPL-2.0-or-later https://www.drupal.org/licensing/faq */
(function($, Drupal, drupalSettings, once) {
    if ($("div.featured-view-video header").length < 1) $("#sidebar-grid").css("top", "190px");
    $(document).ready(function() {
        const context = $(".path-webform");
        const attrForValidation = {
            required: "required",
            "aria-required": true
        };
        if (context.length > 0) {
            const fileInput = context.find('input[type="file"]');
            context.find('.webform-address option[value="United States"]').first().prop("selected", true);
            const isRequiredfileInput = fileInput.parents().find("#ajax-wrapper").first().find("label").hasClass("form-required");
            if (isRequiredfileInput) fileInput.attr(attrForValidation);
            $("form.webform-submission-form").submit(function(event) {
                const btn = $(this).find("input[type=submit]:focus");
                if (btn.attr("id") === "edit-actions-submit" && !grecaptcha.getResponse()) {
                    event.preventDefault();
                    $('<span class="red recaptcha">reCAPTCHA is invalid</span>').insertAfter(".g-recaptcha");
                }
            });
        }
        if ($(".sec-videos-view #edit-reset").length > 0) {
            $(".sec-videos-view #edit-submit-sec-videos").hide();
            $(".sec-videos-view .views-exposed-form").show();
        } else {
            $(".sec-videos-view .views-exposed-form").show();
            $(".sec-videos-view #edit-submit-sec-videos").show();
        }
    });
    $("ul#user-menu").superfish();

    function shortenPageTitle() {
        if ($(window).width() > 1024) {
            if ($("#page-title h1").innerWidth() > 600)
                if ($("#page-title h1").children("span").length) return;
            if ($("#content-wrapper #page-title").children("div #addthis-icons").length) $("body:not(.node--type-release) #page-title h1").wrapInner('<span class="shorten-header clearfix"></span>');
        } else $("span.shorten-header").contents().unwrap();
    }
    $(window).on("load", function() {
        shortenPageTitle();
    });

    function setTabSize() {
        $("li.ui-tabs-tab").css("height", "");
        $("li.ui-tabs-tab").children().removeAttr("style");
        let tabSets;
        let tabsLength;
        let tabGroupName;
        let tabWidth;
        const tabHeights = [];
        const tabWidths = [];
        const contentHeights = [];
        let tabHeight;
        let currentHeight;
        let maxHeight;
        let minHeight;
        let newPadding;
        if ($(".ui-tabs").length > 0) tabSets = $(".ui-tabs").length;
        $(".ui-tabs").each(function(i) {
            if ($(this).attr("id")) tabGroupName = `#${$(this).attr("id")}`;
            else {
                $(this).attr("id", `tabs-ui-tabs-${i}`);
                tabGroupName = `#${$(this).attr("id")}`;
            }
            if ($(tabGroupName).has("li.ui-tabs-tab")) {
                tabsLength = $(`${tabGroupName} ul li.ui-tabs-tab`).length;
                $(`${tabGroupName} ul li.ui-tabs-tab`).each(function(tab) {
                    tabWidth = 100 / tabsLength;
                    $(this).css("width", `${tabWidth}%`);
                });
                Array.max = function(array) {
                    return Math.max.apply(Math, array);
                };
                Array.min = function(array) {
                    return Math.min.apply(Math, array);
                };
                $(`${tabGroupName} ul li.ui-tabs-tab`).each(function(tab) {
                    tabHeights.push($(this).height());
                    contentHeights.push($(this).has("a").contents().height());
                });
                tabHeight = Array.max(tabHeights);
                tabWidth = Array.max(tabWidths);
                maxHeight = Array.max(contentHeights);
                minHeight = Array.min(contentHeights);
                if (tabHeight < 32) $(`${tabGroupName} ul li.ui-tabs-tab`).css("height", "32px");
                else $(`${tabGroupName} ul li.ui-tabs-tab`).css("height", `${Array.max(tabHeights)}px`);
                $(`${tabGroupName} a.ui-tabs-anchor`).each(function(j) {
                    const h = contentHeights[j];
                    const p = (tabHeight - h) / 2;
                    $(this).css({
                        "padding-top": `${Math.round((tabHeight-h)/2)}px`,
                        height: "inherit"
                    });
                });
            }
        });
        if ($(window).width() < 476) {
            if ($('div[id^="tabs-"] ul.ui-tabs-nav li').length > 4) $('div[id^="tabs-"]').addClass("vertical-tabs");
            if ($(tabGroupName).hasClass("vertical-tabs")) {
                $("div.vertical-tabs ul.ui-tabs-nav li").removeAttr("style");
                $("div.vertical-tabs ul.ui-tabs-nav li a").removeAttr("style");
            }
        }
    }
    window.onresize = function(event) {
        shortenPageTitle();
        if ($('div[id^="tabs-"]').length > 0) setTabSize();
        if ($("div.tabs").length > 0) setTabSize();
    };
    if ($("meta[name='id']").length === 0 && $(".node-preview-form-select select").length > 0) $(".node-preview-form-select select").attr("disabled", true);
    if ($(".newsroom-list-page").length > 0 || $(".article-list").length > 0) $(`#local-nav li a[href='${window.location.pathname}']`).addClass("is-active");
    if ($("body.path-node").length > 0) {
        let navPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
        switch (navPath) {
            case "/news/press-release":
                navPath = "/news/pressreleases";
                break;
            case "/news/public-statement":
                navPath = "/news/statements";
                break;
            default:
                break;
        }
        $(`body.node--type-news #local-nav li a[href^='${navPath}']`).addClass("is-active");
    }
    $(".sf-menu li a").focusin(function() {
        $(this).parent().addClass("focus");
    }).focusout(function() {
        $(this).parent().removeAttr("class");
    });
    if ($("#home").length > 0) $("ul.slides > li").each(function(i) {
        $(this).attr("id", `slide-${i+1}`);
    });
    $("tr").focusin(function() {
        $(this).addClass("current");
    }).focusout(function() {
        $(this).removeClass("current");
    });
    if ($(".article-content").length > 0) {
        const leftNavHeight = $(".local-nav").height();
        const articleContent = $(".article-content").height();
        if (leftNavHeight > articleContent) $(".article-content").css("min-height", leftNavHeight);
    }
    $(".left-nav-menu").click(function() {
        const $leftNav = $(this).children("span.fa");
        if ($leftNav.hasClass("fa-navicon")) {
            $leftNav.removeClass("fa-navicon").addClass("fa-close");
            $(".local-nav").show("slide", {
                direction: "left"
            });
        } else {
            $leftNav.removeClass("fa-close").addClass("fa-navicon");
            $(".local-nav").hide("slide", {
                direction: "left"
            }, "fast");
        }
    });
    $(".local-nav li a").click(function() {
        if ($(window).width() < 768 && !$(this).parent().hasClass("slider-key")) $(this).css({
            "background-color": "#FFC057​",
            color: "#273a56"
        });
    });
    const mobileSliders = $("#sidebar-first ul.mobile-nav li ul").parent();
    mobileSliders.wrapAll('<div class="mobile-nav-sliders"> </div>');
    $(".mobile-nav-sliders").find("> li").addClass("slider-key");
    $(".mobile-nav-sliders").find("> li > ul").addClass("slider-children");
    $(".mobile-nav-sliders").accordion({
        active: false,
        collapsible: true,
        heightStyle: "content"
    });
    $(".mobile-nav-sliders .slider-key > a").attr("tabindex", "0");
    $("#mobile-search-box").click(function() {
        $("#mobile-search label.overlabel").hide();
    }).focusin(function() {
        $("#mobile-search label.overlabel").hide();
    }).focusout(function() {
        if ($("#mobile-search-box").val().length > 0) $("#mobile-search label.overlabel").hide();
        else $("#mobile-search label.overlabel").show();
    });
    const sliders = $("#sidebar-first nav ul li ul").parent();
    sliders.wrapAll('<div class="left-nav-sliders"> </div>');
    $(".left-nav-sliders").find("> li").addClass("slider-key");
    $(".left-nav-sliders").find("> li > ul").addClass("slider-children");
    $(".left-nav-sliders").accordion({
        active: false,
        collapsible: true,
        heightStyle: "content"
    });
    $(".left-nav-sliders .slider-key > a").attr("tabindex", "1");
    $("#block-newsroomleftnav .slider-key > a").first().attr("id", "rss-feed-subheader");
    $("#block-newsroomleftnav .slider-key > a").last().attr("id", "social-media-subheader");
    let isShiftDown = false;
    const observer = new MutationObserver(function(mutationsList) {
        mutationsList.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(addedNode) {
                if (addedNode.id === "at20mc") {
                    console.log("#child has been added");
                    $(document).on("keydown", function(e) {
                        if (e.which === 16) {
                            console.log("shift key down");
                            isShiftDown = true;
                        }
                    }).keyup(function(e) {
                        if (e.which === 16) {
                            console.log("shift key up");
                            isShiftDown = false;
                        }
                    });
                    $("#at20mc a.at-branding-logo").on("keydown", function(e) {
                        if (e.which === 9 && isShiftDown === false) {
                            console.log("tab key down");
                            document.querySelector(".addthis_button_compact").focus();
                            $("#at15s").css("display", "none");
                        }
                    });
                    $("#at20mc #at_hover a:first-child").on("keydown", function(e) {
                        if (e.which === 9 && isShiftDown === true) {
                            console.log("shift tab down");
                            document.querySelector(".addthis_button_compact").focus();
                            $("#at15s").css("display", "none");
                        }
                    });
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(document.querySelector("body"), {
        subtree: false,
        childList: true
    });
    let checkAddThisLoadedInterval = null;

    function checkAddThisLoaded() {
        if ($(".addthis_button_compact")) {
            $(".appIconsDetail").css("visibility", "visible");
            clearInterval(checkAddThisLoadedInterval);
        }
    }
    if (typeof addthis !== "undefined") {
        addthis.init();
        checkAddThisLoadedInterval = setInterval(checkAddThisLoaded, 100);
    }
    if ($("body.path-news #block-secgov-content .newsroom-list-page").length > 0) {
        const firstMonthBar = $(".newsroom-list-page .grouped").first();
        $(firstMonthBar).insertAfter($("thead tr.header").first());
        $(firstMonthBar).replaceWith(`<th colspan='3' class='grouped'>${$(firstMonthBar).text()}</th>`);
        if ($("#view-field-display-title-table-column").hasClass("is-active") || $("#view-field-release-number-table-column").hasClass("is-active") || $("#view-field-person-table-column").hasClass("is-active")) $(".newsroom-list-page .grouped").hide();
        else $(".newsroom-list-page .grouped").show();
    }
    if ($("body.path-divisions #block-secgov-content .topical-reference-guide").length > 0) {
        $(".topical-reference-guide h1.grouped").each(function() {
            const topicGroupBar = $(".topical-reference-guide h1.grouped").first();
            $(topicGroupBar).insertAfter($(this).next(".list").find("thead").first());
            $(topicGroupBar).replaceWith(`<tbody class='tablesorter-no-sort'><tr class='topic-labels bkg-navy text-white-sand padding-top-10 padding-bottom-10' scope='col'><th colspan='4' class='padding-top-5 padding-bottom-5'><strong>${$(topicGroupBar).text()}</strong></th></tr></tbody>`);
        });
        const firstTopicBodyGroup = $(".topical-reference-guide .list").first();
        const topicBodyGroupings = $(".topical-reference-guide .list").not(":first").find("tbody");
        $($(topicBodyGroupings)).each(function() {
            const clone = $(this).detach();
            clone.appendTo($(firstTopicBodyGroup));
            $(".topical-reference-guide .list").not(":first").remove();
        });
    }
    if ($(".view-topical-reference-guide").length) $(".view-topical-reference-guide").ready(function() {
        $('input#listSearch, input[name="field_url_title"], select').keyup(function() {
            $(".view--below-footer > .view--below-footer--count > .record_start").text(Number($(".trg-list-page-row").filter(":visible").length > 0));
            $(".view--below-footer > .view--below-footer--count > .record_end").text($(".trg-list-page-row").filter(":visible").length);
            $(".view--below-footer > .view--below-footer--count > .record_total").text($(".trg-list-page-row").filter(":visible").length);
        });
    });
    $(".trg-list-page form.views-exposed-form").ready(function() {
        $('input[name="field_url_title"]').trigger("keyup");
    });
    if ($(".view-pause-list-page").length) $(".view-pause-list-page").ready(function() {
        $(".view--below-footer > .view--below-footer--count > .record_end").text($(".pause-list-page-row").filter(":visible").length);
        $(".view--below-footer > .view--below-footer--count > .record_total").text($(".pause-list-page-row").filter(":visible").length);
        $('input#listSearch, input[name="field_url_title"], select').keyup(function() {
            $(".view--below-footer > .view--below-footer--count > .record_end").text($(".pause-list-page-row").filter(":visible").length);
            $(".view--below-footer > .view--below-footer--count > .record_total").text($(".pause-list-page-row").filter(":visible").length);
        });
    });
    if ($("body.node--type-secperson").length > 0) {
        $(".more-link a").each(function() {
            $(this).html(`${$(this).text()} by ${jQuery("span.title").html()}`);
        });
        jQuery(".block-region-right > div").each(function() {
            if ($(this).find(".views-row").length === 0) $(this).hide();
            const moreLinkHref = $(this).find(".more-link a").attr("href");
            $(this).find(".block-title-more-link a").attr("href", moreLinkHref);
        });
        jQuery(".field_photo_person a").append("<br>Download High Resolution Image");
    }
    if ($(".article-list, .im-disclosure, .trg-list-page, .noca-table table.list").length > 0) {
        const $rows = $(".list tbody tr").not(".topic-labels");
        $('#listSearch, input[name="field_url_title"]').keyup(function() {
            const val = $.trim($(this).val()).replace(/ +/g, " ").toLowerCase();
            $rows.show().filter(function() {
                const text = $(this).children("td").not(".noFilter").text().replace(/\s+/g, " ").toLowerCase();
                return !~text.indexOf(val);
            }).hide();
            $(".tablesorter-no-sort").each(function() {
                if (!$(this).next().children().filter(":visible").length) $(this).hide();
                else $(this).show();
            });
        });
        const monthNames = {};
        monthNames["Jan."] = 0;
        monthNames["Feb."] = 1;
        monthNames.March = 2;
        monthNames.April = 3;
        monthNames.May = 4;
        monthNames.June = 5;
        monthNames.July = 6;
        monthNames["Aug."] = 7;
        monthNames["Sept."] = 8;
        monthNames["Oct."] = 9;
        monthNames["Nov."] = 10;
        monthNames["Dec."] = 11;
        $.tablesorter.addParser({
            id: "monthYear",
            is(s) {
                return false;
            },
            format(s, table, cell, cellIndex) {
                const date = $(cell).children("span.show-for-small").remove().end().text().trim().match(/^(Jan\.|Feb\.|March|April|May|June|July|Aug\.|Sept\.|Oct\.|Nov\.|Dec\.)[ ](\d{4})$/);
                if (date && date.length === 3) {
                    const m = monthNames[date[1]];
                    const y = date[2];
                    const d = new Date(`${date[1].replace(".","")} 1, ${date[2]}`);
                    return d.getTime();
                }
                return "";
            },
            type: "numeric"
        });
        $.tablesorter.addParser({
            id: "monthDayYear",
            is() {
                return false;
            },
            format(s, table, cell, cellIndex) {
                const date = $(cell).children("span.show-for-small").remove().end().text().trim().match(/^(Jan\.|Feb\.|March|April|May|June|July|Aug\.|Sept\.|Oct\.|Nov\.|Dec\.)[ ](\d{1,2}),[ ](\d{4})$/);
                if (date && date.length === 4) {
                    const m = monthNames[date[1]];
                    const dt = date[2];
                    const y = date[3];
                    const d = new Date(`${date[1].replace(".","")} ${date[2]}, ${date[3]}`);
                    return d.getTime();
                }
                return "";
            },
            type: "numeric"
        });
        $.tablesorter.addParser({
            id: "mmddyyyy",
            is() {
                return false;
            },
            format(s, table, cell, cellIndex) {
                const date = $(cell).children("span.show-for-small").remove().end().text().trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (date && date.length === 4) {
                    const m = date[1];
                    const dt = date[2];
                    const y = date[3];
                    const d = new Date(`${y}/${m}/${dt}`);
                    return d.getTime();
                }
                return "";
            },
            type: "numeric"
        });
        $.tablesorter.addParser({
            id: "replaceNA",
            is() {
                return false;
            },
            format(s) {
                return s.trim().replace(/\bn\/a\b/i, String.fromCharCode(127));
            },
            type: "text"
        });
        $.tablesorter.addParser({
            id: "datetime",
            is() {
                return false;
            },
            format(s, table, cell) {
                const t = $(cell).find("time").attr("datetime");
                return new Date(t).getTime();
            },
            type: "numeric"
        });
        $.tablesorter.addParser({
            id: "strippedString",
            is() {
                return false;
            },
            format(s, table, cell, cellIndex) {
                return s.trim().replace(/"/g, "").toLowerCase();
            },
            type: "text"
        });
        $(".foia-freq-doc-list .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [1, 1]
            ],
            textExtraction(node) {
                return $(node).clone().children("span.show-for-small").remove().end().text().replace(/["'“”]/g, "");
            },
            textSorter: "naturalSort",
            headers: {
                0: {
                    sorter: "strippedString",
                    sortInitialOrder: "asc"
                },
                1: {
                    sorter: "monthDayYear",
                    sortInitialOrder: "desc"
                }
            },
            debug: false
        });
        $(".data-list .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [2, 1]
            ],
            textExtraction(node) {
                return $(node).clone().children("span.show-for-small").remove().end().text().replace(/["'“”]/g, "");
            },
            textSorter: "naturalSort",
            headers: {
                0: {
                    sorter: "text"
                },
                1: {
                    sorter: "text"
                },
                2: {
                    sorter: "monthYear",
                    sortInitialOrder: "desc"
                }
            },
            debug: false
        });
        $(".im-disclosure .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [2, 1]
            ],
            textExtraction(node, table, cellIndex) {
                return $(node).clone().children("span.show-for-small").remove().end().text().replace(/["'“”]/g, "");
            },
            textSorter: "naturalSort",
            headers: {
                0: {
                    sorter: "text"
                },
                1: {
                    sorter: "text"
                },
                2: {
                    sorter: "datetime",
                    sortInitialOrder: "desc"
                }
            }
        });
        $(".topical-reference-guide .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [3, 1]
            ],
            textSorter: "naturalSort",
            headers: {
                3: {
                    sorter: "monthDayYear",
                    sortInitialOrder: "desc"
                }
            },
            cssInfoBlock: "tablesorter-no-sort",
            debug: false
        });
        $(".noca-table table.list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [0, 1]
            ],
            textSorter: "naturalSort",
            textExtraction(node) {
                return $(node).clone().children("span.show-for-small").remove().end().text().replace(/["'“”]/g, "");
            },
            headers: {
                0: {
                    sorter: "text",
                    sortInitialOrder: "desc"
                },
                1: {
                    sorter: "strippedString"
                },
                2: {
                    sorter: "mmddyyyy"
                },
                3: {
                    sorter: "mmddyyyy"
                }
            },
            cssInfoBlock: "tablesorter-no-sort",
            debug: false
        });
        if (window.innerWidth <= 767) {
            $(".forms-list tr").each(function() {
                $(this).children("td.views-field-field-list-page-det-secarticle, td.views-field-term-node-tid").wrapAll($("<div>").addClass("section"));
            });
            $(".forms-list tr div.section").prepend($("<div>").addClass("section-label").html("Show Details"));
            $(".forms-list tr .section-label").click(function() {
                $(this).parent("div.section").toggleClass("active", function() {
                    if ($(this).hasClass("active")) $(this).children(".section-label").html("Hide Details");
                    else $(this).children(".section-label").html("Show Details");
                });
            });
        }
        $(".marketstructure-data .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [2, 1]
            ],
            textSorter: "naturalSort",
            headers: {
                2: {
                    sorter: "monthYear"
                }
            },
            debug: false
        });
        $(".staff-papers-list .list").tablesorter({
            emptyTo: "emptyMax",
            ignoreCase: true,
            sortRestart: true,
            sortList: [
                [0, 1]
            ],
            textExtraction(node, table, cellIndex) {
                return $(node).clone().children("span.show-for-small").remove().end().text().replace(/["'“”]/g, "").replace(/[^\x00-\x7F]/g, "");
            },
            textSorter: "naturalSort",
            headers: {
                0: {
                    sorter: "monthYear"
                }
            },
            debug: false
        });
    }
    if ($(".sec-videos-view,.im-disclosure").length > 0 || $(".article-list").length > 0) Drupal.behaviors.contentSearchPage = {
        attach(context, settings) {
            $(".form-select").change(function() {
                $("input[name='aId']", this.form).val($(this).attr("id"));
                $(this).closest("form").trigger("submit");
            });
        }
    };
    if ($("form[action='/investor/alerts']").length === 0) {
        $("#viewall").css("visibility", "visible");
        $(`.button-box a[href='${window.location.pathname}']`).addClass("active");
    }
    if ($(".list-accordion").length > 0) {
        const icons = {
            header: "ui-icon-circlesmall-plus",
            activeHeader: "ui-icon-circlesmall-minus"
        };
        $(".list-accordion").accordion({
            active: false,
            collapsible: true
        });
    }
    $(".accordion-statistics-guide").accordion({
        active: false,
        collapsible: true
    });
    if ($('div[id^="tabs-"]').length > 0) Drupal.behaviors.contentTabBox = {
        attach(context, settings) {
            $('div[id^="tabs-"]').tabs();
            $.fn.resetTabs = function() {
                $("li.ui-tabs-tab").css("height", "");
                $("li.ui-tabs-tab").children().removeAttr("style");
            };
            setTabSize();
        }
    };
    if ($("div.tabs").length > 0) Drupal.behaviors.contentTabBox = {
        attach(context, settings) {
            $("div.tabs").tabs();
            $.fn.resetTabs = function() {
                $("li.ui-tabs-tab").css("height", "");
                $("li.ui-tabs-tab").children().removeAttr("style");
            };
            setTabSize();
        }
    };
    if ($('div[id^="accordion-"]').length > 0) $('div[id^="accordion-"]').accordion({
        active: false,
        collapsible: true,
        heightStyle: "content"
    });
    if ($(".field_transcript").length > 0) $(".field_transcript").accordion({
        active: false,
        collapsible: true
    });
    if ($(".field_media_transcript").length > 0) $(".field_media_transcript").accordion({
        active: false,
        collapsible: true
    });
    Drupal.behaviors.govDeliveryBox = {
        attach(context, settings) {
            $("#gov-delivery-box").focus(function() {
                $("#subscribe-form .overlabel").hide();
            });
            $("#gov-delivery-box").click(function() {
                $("#subscribe-form .overlabel").hide();
            });
            $("#gov-delivery-box").blur(function() {
                if ($(this).val().length > 0) $("#subscribe-form .overlabel").hide();
                else $("#subscribe-form .overlabel").show();
            });
        }
    };
    $.fn.getQueryVariable = function() {
        const query = window.location.search.substring(1);
        const vars = query.split("&");
        let pair;
        const i = 0;
        let elem;
        if (vars.length > 0) {
            pair = vars[i].split("=");
            if (pair[0] === "aId") elem = pair[1];
        }
        return elem;
    };
    $(window).on("load", function() {
        const q = $.fn.getQueryVariable();
        if (q) $(`#${q}`).focus();
    });
    const initBackTotop = function() {
        if ($(".back-to-top").length === 0) return;
        const amountScrolled = 500;
        const backTotop = $("a.back-to-top");
        const footerHeight = $('section[role="footer"]').height() + 10;
        backTotop.hide();
        $(window).scroll(function() {
            if ($(window).scrollTop() > amountScrolled) backTotop.fadeIn("slow");
            else backTotop.fadeOut("slow");
            const howFarScrolled = $(window).scrollTop() + $(window).height();
            const pxTillHitBottom = $(document).height() - howFarScrolled;
            if (howFarScrolled > $(document).height() - footerHeight) backTotop.css("bottom", footerHeight - pxTillHitBottom);
            else backTotop.css("bottom", "15px");
        });
        $("a.back-to-top").click(function() {
            $("html, body").animate({
                scrollTop: 0
            }, 700);
            return false;
        });
    };
    window.onresize = function(event) {
        initBackTotop();
    };
    $(document).ready(function() {
        initBackTotop();
        $("#datatable_length select").change(function() {
            initBackTotop();
        });
        $("#edit-items-per-page").change(function() {
            window.location.search = `${window.location.search}&items_per_page=${this.value}`;
        });
        if ($("body.node--type-link").length > 0) {
            const redirectTo = $(".field-link-title-url a").attr("href");
            window.location.replace(redirectTo);
        }
        const displayHelpBlocks = !!($("#videoplayer").length > 0 || $(".sample-player").length > 0);
        if (displayHelpBlocks) $("#block-webcast-trouble,#block-flashsoftware").show();
    });
    (function(selector) {
        $(".associated-data-distribution table tbody tr").each(function() {
            const href = $(selector, this).attr("href");
            const height = $(this).find("td").height();
            if (href) {
                const link = $(`<a href="${$(selector,this).attr("href")}" download></a>`).css({
                    "text-decoration": "none",
                    display: "block",
                    color: $(this).css("color")
                });
                $(this).children().wrapInner(link);
            }
        });
    })("a:first");
    let hashTagActive = "";
    $("#sec-mission .hp-content a").on("click", function(e) {
        if ($(this).get(0).hash)
            if (hashTagActive !== this.hash) {
                e.preventDefault();
                let dest = 0;
                if ($(this.hash).offset().top > $(document).height() - $(window).height()) dest = $(document).height() - $(window).height();
                else dest = $(this.hash).offset().top;
                $("html,body").animate({
                    scrollTop: dest
                }, 1000, "swing");
                hashTagActive = this.hash;
            }
    });
    $(document.body).on("change", "#edit-field-meeting-category-value", function() {
        $(this).closest("form").submit();
    });
    $('#edit-submitting-party--wrapper input[value="Proponent"]').change(function() {
        $("#edit-type-of-request .form-item-type-of-request:nth-child(1)").css("display", "none");
        $('input[value="supplemental_correspondence"]').trigger("click");
    });
    $('#edit-submitting-party--wrapper input[value="Company"]').change(function() {
        $("#edit-type-of-request .form-item-type-of-request:nth-child(1").css("display", "inline-flex");
    });
    $('#edit-requesttype input[value="initial_request"]').change(function() {
        const proponentChecked = $('#edit-submitting-party--wrapper input[value="Proponent"]').prop("checked");
        const companyChecked = $('#edit-submitting-party--wrapper input[value="Company"]').prop("checked");
        if (proponentChecked === false && companyChecked === false) $('#edit-submitting-party--wrapper input[value="Company"]').trigger("click");
    });
    $("#accordion li").on("click", function() {
        $(this).find("div").slideToggle(100);
        $(this).find(".expander-icon").toggleClass("minus");
        $(this).find(".expander-icon").text("[+]");
        $(this).find(".expander-icon.minus").text("[-]");
    });
    $(".submitcommentslink").click(function(e) {
        e.preventDefault();
        $(".comment-form").submit();
    });
    $("#email").on("blur", function(e) {
        if ($(this).val() === "") {
            $(this).val("Email address");
            $(this).css({
                color: "#b1b1b1"
            });
        } else {
            if ($(this).val() !== "") $(this).css({
                color: "#000"
            });
        }
    });
    $("#email").on("focus", function(e) {
        if ($(this).val() === "Email address") {
            $(this).val("");
            $(this).css({
                color: "#000"
            });
        }
    });
    if (/Trident/.test(window.navigator.userAgent) || /MSIE/.test(window.navigator.userAgent)) {
        $("a.twitter-timeline").before("<p>Internet Explorer is no longer supported by Twitter. Please use another browser to view SEC tweets.</p>");
        $("a.twitter-timeline").hide();
    }
    $(".atcb-link").click(function() {
        const calID = "var.atc_event";
        var calSingle = LocalICS.ics();
        let contact = "";
        if ($(calID).find(".atc_organizer").text().length > 0) contact = `<p>Contact: ${$(calID).find(".atc_organizer").text().replace(/\n/g,"\\n")}</p>`;
        calSingle.addEvent($(calID).find(".atc_title").text(), $(calID).find(".atc_description").text().replace(/\n/g, "\\n") + contact, $(calID).find(".atc_description").html().replace(/\n/g, "\\n") + contact, $.trim($(calID).find(".atc_location").text()).replace(/\n/g, ", "), $(calID).find(".atc_date_start").text(), $(calID).find(".atc_date_end").text());
        calSingle.download($(calID).find(".atc_title").text());
    });
    Drupal.behaviors.sec_add_to_calendar = {
        attach() {
            const calItem = drupalSettings.cal_item;
            if (typeof calItem !== "undefined") {
                if (typeof calItem.start !== "undefined" && calItem.start !== null) $(".atc_date_start").text(calItem.start);
                if (typeof calItem.end !== "undefined" && calItem.end !== null) $(".atc_date_end").text(calItem.end);
            }
        }
    };
    if ($(".atcb-link").length > 0) $(".atcb-link").each(function() {
        $(this).attr("tabindex", "0");
    });
    Drupal.behaviors.updateURL = {
        attach() {
            if (window.location.pathname.includes("corp_fin_noaction")) {
                const params = new URLSearchParams(window.location.search);
                params.delete("msg");
                window.history.replaceState(null, "", `?${params}${window.location.hash}`);
            }
            if (window.location.pathname.includes("corp_fin_interpretive") || window.location.pathname.includes("shareholder-proposal")) {
                const params = new URLSearchParams(window.location.search);
                params.delete("token");
                window.history.replaceState(null, "", `?${params}${window.location.hash}`);
            }
        }
    };
    Drupal.behaviors.webformValidation = {
        attach() {
            const $allWebformInputs = $(".webform-submission-form :input");
            $allWebformInputs.attr("aria-invalid", "false");
        }
    };
    Drupal.behaviors.enforcementIndexTableCombineAndSort = {
        attach() {
            $(document).ready(function() {
                $(once("enforcementIndexTableCombineAndSort", ".rulemaking-table-nodes")).each(function() {
                    const rowsArray = [];
                    let enforcementTableHead;
                    $(once("enforcementIndexTableCombineAndSort", ".rulemaking-table-nodes thead")).each(function() {
                        const $this = $(this);
                        enforcementTableHead = $this.prop("outerHTML");
                    });
                    let uniqueUrls = new Set();
                    $(once("enforcementIndexTableCombineAndSort", ".rulemaking-row")).each(function(index) {
                        const $this = $(this);
                        $this.addClass("enforcement-row__processed").removeClass("enforcement-row");
                        const obj = {
                            datetime: $this.find("time").attr("datetime"),
                            index,
                            row: $this.prop("outerHTML").replaceAll("<br>", "").replaceAll("<br/>", "")
                        };
                        const itemHref = /href=".*"/.exec(obj.row);
                        if (!uniqueUrls.has(itemHref[0])) {
                            uniqueUrls.add(itemHref[0]);
                            rowsArray.push(obj);
                        }
                    });
                    if (rowsArray.length !== 0) {
                        const rowsSorted = rowsArray.sort((a, b) => {
                            const checkBgreater = b.datetime > a.datetime ? -1 : 0;
                            return a.datetime > b.datetime ? 1 : checkBgreater;
                        });
                        let rowsMarkup = "";
                        rowsSorted.forEach((item) => {
                            rowsMarkup += item.row;
                        });
                        $(".processed-table").append(`<table class="list processed-table">${enforcementTableHead}${rowsMarkup}</table>`);
                        $(".rulemaking-table-nodes > footer").show();
                    } else {
                        $(".processed-table").append("<p>There are no documents associated with this file number.</p>");
                        $(".rulemaking-table-nodes > footer").addClass("rulemaking_index-no_records").show();
                    }
                });
            });
        }
    };
    Drupal.behaviors.ruleAccordionDeeplink = {
        attach() {
            if ($("body.node--type-rule").length > 0) {
                const deeplink = window.location.hash;
                if (deeplink !== "") $(document).ready(function() {
                    $(deeplink).parent().addClass("ui-accordion-header-active ui-state-active");
                    $(deeplink).parent().next(".ui-accordion-content").css("display", "block");
                });
            }
        }
    };
    Drupal.behaviors.ruleMakingHideEmptyRows = {
        attach() {
            if ($(".view-display-id-rulemaking_activity_page .views-field-nothing-1").length > 0) {
                let updateCount = false;
                $(".view-display-id-rulemaking_activity_page .views-field-nothing-1").each(function() {
                    const rules = $(this).text().trim();
                    if (rules && rules.indexOf(" Rule") < 0 && rules.indexOf("View Related Activity") >= 0) {
                        $(this).parent().remove();
                        updateCount = true;
                    }
                });
                if (updateCount) {
                    const totalCounter = $(".view-display-id-rulemaking_activity_page .views-field-nothing-1").length - 1;
                    $(".view--below-footer--count").text(`Displaying 1 - ${totalCounter} of ${totalCounter}`);
                }
            }
        }
    };
    Drupal.behaviors.updateCounter = {
        attach() {
            if ($(".view-other-rules .views-field-nothing, .view-regulatory-releases .views-field-nothing").length > 0) {
                const currentTotal = $(".view--below-footer--count").text().split(" of ")[1];
                if (currentTotal < 100) {
                    const totalCounter = $(".view-other-rules .views-field-nothing, .view-regulatory-releases .views-field-nothing").length - 1;
                    $(".view--below-footer--count").text(`Displaying 1 - ${totalCounter} of ${totalCounter}`);
                }
            }
        }
    };
})(jQuery, Drupal, drupalSettings, once);
var addthis_config = {
    ui_click: true,
    ui_508_compliant: true
};;
"use strict";
(function() {
    if (document.readyState != 'loading') enableSmartSearchEntitySuggestions();
    else window.addEventListener('load', enableSmartSearchEntitySuggestions);

    function enableSmartSearchEntitySuggestions() {
        var UP_ARROW = 38,
            DOWN_ARROW = 40,
            CARRIAGE_RETURN = 13,
            TAB = 9,
            ESCAPE = 27;
        var globalSearchBox = document.getElementById('global-search-box');
        var globalSearchBoxMobile = document.getElementById('global-search-box-mobile');
        var companyPersonLookup = document.getElementById('edgar-company-person');
        if (!globalSearchBoxMobile) globalSearchBoxMobile = document.getElementById('mobile-search-box');
        if (!globalSearchBoxMobile) globalSearchBoxMobile = document.getElementById('search-box');
        var activeHintsKeys, activeInputBoxID, autoselectFirstHint = false,
            waitingForHintsOnKeySubmit = false;
        var hintsContainer = document.createElement('div');
        hintsContainer.className = "smart-search-container";
        hintsContainer.innerHTML = '<div class="smart-search-entity-hints">' + '<span class="smart-search-EDGAR">EDGAR</span><span class="smart-search-resources">| Filings</span><br />' + '<table class="smart-search-entity-hints" width="450"></table>' + '<br /><a class="smart-search-edgar-full-text" href="#">Search for &quot;<span class="smart-search-search-text"></span>&quot; in EDGAR filings</a><br />' + '<span class="smart-search-SEC-gov">SEC.gov</span><span class="smart-search-resources">| Webpages &amp; Documents</span><br />' + '<div class="smart-search-sec-gov-website">Search for &quot;<span class="smart-search-search-text"></span>&quot; on SEC.gov</div>' + '</div>';
        hintsContainer.querySelector('div.smart-search-sec-gov-website').addEventListener('click', function searchSecGov() {
            var searchContainer = hintsContainer.parentElement;
            searchContainer.querySelector('input').form.submit();
        });

        function searchBoxFocus(event) {
            var label = this.parentElement.querySelector('label');
            if (label && label.style) label.style.display = 'none';
        }

        function searchBoxKeyDown(event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode == TAB || keyCode == CARRIAGE_RETURN)
                if (activeHintsKeys == event.target.value) {
                    var selectedHint = hintsContainer.querySelector('.smart-search-selected-hint');
                    if (selectedHint) {
                        event.stopPropagation();
                        event.preventDefault();
                        selectedHint.click(this);
                    }
                } else {
                    if (autoselectFirstHint) {
                        event.stopPropagation();
                        event.preventDefault();
                        waitingForHintsOnKeySubmit = true;
                        window.setTimeout(function() {
                            if (waitingForHintsOnKeySubmit) event.target.form.submit();
                        }, 700);
                    }
                }
        }

        function searchBoxKeyUp(event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode == ESCAPE) hideCompanyHints();
            else {
                if (keyCode != TAB && keyCode != CARRIAGE_RETURN && keyCode != UP_ARROW && keyCode != DOWN_ARROW) getCompanyHints(this, this.value);
            }
            var hintCount = hintsContainer.querySelectorAll('table.smart-search-entity-hints tr.smart-search-hint').length;
            if (hintCount && (keyCode == UP_ARROW || keyCode == DOWN_ARROW)) {
                var oldSelected = hintsContainer.querySelector('.smart-search-selected-hint'),
                    oldSelectedIndex;
                if (oldSelected) {
                    oldSelected.className = oldSelected.className.replace('smart-search-selected-hint', '').trim();
                    if (!isNaN(oldSelected.rowIndex)) oldSelectedIndex = oldSelected.rowIndex;
                    else {
                        var className = oldSelected.className;
                        if (className.indexOf('smart-search-edgar-full-text') !== -1) oldSelectedIndex = hintCount;
                        if (className.indexOf('smart-search-sec-gov-website') !== -1) oldSelectedIndex = hintCount + 1;
                    }
                }
                var newSelectedIndex = Math.min(Math.max((oldSelected ? oldSelectedIndex : -1) + (keyCode == UP_ARROW ? -1 : 1), 0), hintCount + 1);
                if (newSelectedIndex < hintCount) hintsContainer.querySelectorAll('table.smart-search-entity-hints tr.smart-search-hint').item(newSelectedIndex).className = 'smart-search-hint smart-search-selected-hint';
                if (newSelectedIndex == hintCount) hintsContainer.querySelector('.smart-search-edgar-full-text').className = 'smart-search-edgar-full-text smart-search-selected-hint';
                if (newSelectedIndex == hintCount + 1) hintsContainer.querySelector('.smart-search-sec-gov-website').className = 'smart-search-sec-gov-website smart-search-selected-hint';
            }
        }

        function searchBoxBlur() {
            if (!window.smartSearchStay) setTimeout(hideCompanyHints, 200);
        }
        var id;
        if (globalSearchBox) {
            globalSearchBox.className = '';
            id = globalSearchBox.id;
            globalSearchBox = document.getElementById(id);
            globalSearchBox.addEventListener('keydown', searchBoxKeyDown);
            globalSearchBox.addEventListener('keyup', searchBoxKeyUp);
            globalSearchBox.addEventListener('blur', searchBoxBlur);
            globalSearchBox.addEventListener('focus', searchBoxFocus);
            var searchContainer = globalSearchBox.parentElement;
        }
        if (globalSearchBoxMobile) {
            id = globalSearchBoxMobile.id;
            globalSearchBoxMobile = document.getElementById(id);
            globalSearchBoxMobile.addEventListener('keydown', searchBoxKeyDown);
            globalSearchBoxMobile.addEventListener('keyup', searchBoxKeyUp);
            globalSearchBoxMobile.addEventListener('blur', searchBoxBlur);
            globalSearchBoxMobile.addEventListener('focus', searchBoxFocus);
        }
        if (companyPersonLookup) {
            id = companyPersonLookup.id;
            autoselectFirstHint = true;
            companyPersonLookup = document.getElementById(id);
            companyPersonLookup.addEventListener('keydown', searchBoxKeyDown);
            companyPersonLookup.addEventListener('keyup', searchBoxKeyUp);
            companyPersonLookup.addEventListener('blur', searchBoxBlur);
            companyPersonLookup.addEventListener('focus', searchBoxFocus);
        }

        function getCompanyHints(control, keysTyped) {
            if (keysTyped && keysTyped.trim()) {
                var overlay = control.parentNode.querySelector('label.overlabel');
                if (overlay && overlay.style) overlay.style.display = 'none';
                var hintsURL = 'https://efts.sec.gov/LATEST/search-index';
                var start = new Date();
                var request = new XMLHttpRequest();
                request.open('POST', hintsURL, true);
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                request.onload = function() {
                    if (this.status >= 200 && this.status < 400 && keysTyped == control.value) {
                        if (activeInputBoxID != control.id) {
                            searchContainer = control.parentElement;
                            var bbInput = control.getBoundingClientRect(),
                                bbForm = searchContainer.getBoundingClientRect();
                            var rightOffset = bbForm.right - bbInput.right;
                            searchContainer.appendChild(hintsContainer);
                            var bbHints = hintsContainer.getBoundingClientRect();
                            var hintsDivStyle = hintsContainer.querySelector('.smart-search-entity-hints').style;
                            if (bbInput.left < window.innerWidth - bbInput.right) {
                                hintsDivStyle.left = '0px';
                                hintsDivStyle.right = 'auto';
                                hintsDivStyle.top = (bbInput.top + control.offsetHeight - bbHints.top) + 'px';
                            } else {
                                hintsDivStyle.left = 'auto';
                                hintsDivStyle.right = rightOffset + 'px';
                                hintsDivStyle.top = control.offsetHeight + 'px';
                            }
                            activeInputBoxID = control.id;
                        }
                        autoselectFirstHint = false;
                        if (companyPersonLookup && control.id === companyPersonLookup.id) autoselectFirstHint = true;
                        activeHintsKeys = keysTyped;
                        var data = JSON.parse(this.response);
                        console.log('round-trip execution time to ' + hintsURL + ' for "' + keysTyped + '" = ' + ((new Date()).getTime() - start.getTime()) + ' ms');
                        var hints = data.hits.hits;
                        var hintDivs = [];
                        var rgxKeysTyped = new RegExp('(' + keysTyped.trim() + ')', 'gi');
                        if (hints.length) {
                            for (var h = 0; h < hints.length; h++) {
                                var CIK = hints[h]._id,
                                    entityName = hints[h]._source.entity,
                                    href = '/edgar/browse/?CIK=' + CIK + (hints[h]._source.tickers ? '&owner=exclude' : '');
                                hintDivs.push('<tr class="smart-search-hint' + (autoselectFirstHint && h == 0 ? ' smart-search-selected-hint' : '') + '" data="' + entityName + ' (CIK ' + formatCIK(CIK) + ')"><td class="smart-search-hint-entity">' + '<a href="' + href + '">' + (entityName || '').replace(rgxKeysTyped, '<b>$1</b>') + '</a>' + '</td><td class="smart-search-hint-cik"><a href="' + href + '">' + ((' <i>CIK&nbsp;' + formatCIK(CIK) + '</i>') || '') + '</a></td></tr>');
                            }
                            var hintsTable = hintsContainer.querySelector('table.smart-search-entity-hints');
                            hintsTable.innerHTML = hintDivs.join('');
                            for (var r = 0; r < hintsTable.rows.length; r++) hintsTable.rows[r].addEventListener('click', hintClick);
                            var spans = hintsContainer.querySelectorAll('div.smart-search-entity-hints span.smart-search-search-text');
                            for (var i = 0; i < spans.length; i++) spans[i].innerHTML = keysTyped;
                            hintsContainer.querySelector('.smart-search-edgar-full-text').setAttribute('href', '/edgar/search/#/q=' + encodeURIComponent(keysTyped.trim()) + '&dateRange=all&startdt=1995-06-01&enddt=2020-04-21');
                            hintsContainer.querySelector('div.smart-search-entity-hints').style.display = 'block';
                            if (waitingForHintsOnKeySubmit) {
                                var selectedHint = hintsContainer.querySelector('.smart-search-selected-hint');
                                if (selectedHint) {
                                    waitingForHintsOnKeySubmit = false;
                                    selectedHint.click(this);
                                }
                            }
                        } else hideCompanyHints();
                    } else console.log('error fetching from ' + hintsURL + '; status ' + this.status);
                };
                request.onerror = function() {
                    console.log('error connecting to ' + hintsURL);
                };
                request.send(JSON.stringify({
                    keysTyped,
                    narrow: true
                }));
            } else hideCompanyHints();

            function formatCIK(unpaddedCIK) {
                var paddedCik = unpaddedCIK.toString();
                while (paddedCik.length < 10) paddedCik = '0' + paddedCik;
                return paddedCik;
            }

            function hintClick(evt) {
                this.querySelector('a').click();
            }
        }

        function hideCompanyHints() {
            var hintContainer = hintsContainer.querySelector('div.smart-search-entity-hints');
            hintContainer.style.display = 'none';
            hintContainer.querySelector('table.smart-search-entity-hints').innerHTML = '';
        }
    }
})();;
(function($, Drupal, drupalSettings) {
    'use strict';
    Drupal.extlink = Drupal.extlink || {};
    Drupal.extlink.attach = function(context, drupalSettings) {
        if (typeof drupalSettings.data === 'undefined' || !drupalSettings.data.hasOwnProperty('extlink')) return;
        var extIconPlacement = 'append';
        if (drupalSettings.data.extlink.extIconPlacement && drupalSettings.data.extlink.extIconPlacement != '0') extIconPlacement = drupalSettings.data.extlink.extIconPlacement;
        var pattern = /^(([^\/:]+?\.)*)([^\.:]{1,})((\.[a-z0-9]{1,253})*)(:[0-9]{1,5})?$/;
        var host = window.location.host.replace(pattern, '$2$3$6');
        var subdomain = window.location.host.replace(host, '');
        var subdomains;
        if (drupalSettings.data.extlink.extSubdomains) subdomains = '([^/]*\\.)?';
        else if (subdomain === 'www.' || subdomain === '') subdomains = '(www\\.)?';
        else subdomains = subdomain.replace('.', '\\.');
        var whitelistedDomains = false;
        if (drupalSettings.data.extlink.whitelistedDomains) {
            whitelistedDomains = [];
            for (var i = 0; i < drupalSettings.data.extlink.whitelistedDomains.length; i++) whitelistedDomains.push(new RegExp('^https?:\\/\\/' + drupalSettings.data.extlink.whitelistedDomains[i].replace(/(\r\n|\n|\r)/gm, '') + '.*$', 'i'));
        }
        var internal_link = new RegExp('^https?://([^@]*@)?' + subdomains + host, 'i');
        var extInclude = false;
        if (drupalSettings.data.extlink.extInclude) extInclude = new RegExp(drupalSettings.data.extlink.extInclude.replace(/\\/, '\\'), 'i');
        var extExclude = false;
        if (drupalSettings.data.extlink.extExclude) extExclude = new RegExp(drupalSettings.data.extlink.extExclude.replace(/\\/, '\\'), 'i');
        var extCssExclude = false;
        if (drupalSettings.data.extlink.extCssExclude) extCssExclude = drupalSettings.data.extlink.extCssExclude;
        var extCssExplicit = false;
        if (drupalSettings.data.extlink.extCssExplicit) extCssExplicit = drupalSettings.data.extlink.extCssExplicit;
        var external_links = [];
        var mailto_links = [];
        $('a:not([data-extlink]), area:not([data-extlink])', context).each(function(el) {
            try {
                var url = '';
                if (typeof this.href == 'string') url = this.href.toLowerCase();
                else {
                    if (typeof this.href == 'object') url = this.href.baseVal;
                }
                if (url.indexOf('http') === 0 && ((!internal_link.test(url) && !(extExclude && extExclude.test(url))) || (extInclude && extInclude.test(url))) && !(extCssExclude && $(this).is(extCssExclude)) && !(extCssExclude && $(this).parents(extCssExclude).length > 0) && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
                    var match = false;
                    if (whitelistedDomains)
                        for (var i = 0; i < whitelistedDomains.length; i++)
                            if (whitelistedDomains[i].test(url)) {
                                match = true;
                                break;
                            }
                    if (!match) external_links.push(this);
                } else {
                    if (this.tagName !== 'AREA' && url.indexOf('mailto:') === 0 && !(extCssExclude && $(this).parents(extCssExclude).length > 0) && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) mailto_links.push(this);
                }
            } catch (error) {
                return false;
            }
        });
        if (drupalSettings.data.extlink.extClass !== '0' && drupalSettings.data.extlink.extClass !== '') Drupal.extlink.applyClassAndSpan(external_links, drupalSettings.data.extlink.extClass, extIconPlacement);
        if (drupalSettings.data.extlink.mailtoClass !== '0' && drupalSettings.data.extlink.mailtoClass !== '') Drupal.extlink.applyClassAndSpan(mailto_links, drupalSettings.data.extlink.mailtoClass, extIconPlacement);
        if (drupalSettings.data.extlink.extTarget) {
            $(external_links).filter(function() {
                return !(drupalSettings.data.extlink.extTargetNoOverride && $(this).is('a[target]'));
            }).attr({
                target: '_blank'
            });
            $(external_links).attr('rel', function(i, val) {
                if (val === null || typeof val === 'undefined') return 'noopener';
                if (val.indexOf('noopener') > -1)
                    if (val.indexOf('noopener') === -1) return val + ' noopener';
                    else return val;
                else return val + ' noopener';
            });
        }
        if (drupalSettings.data.extlink.extNofollow) $(external_links).attr('rel', function(i, val) {
            if (val === null || typeof val === 'undefined') return 'nofollow';
            var target = 'nofollow';
            if (drupalSettings.data.extlink.extFollowNoOverride) target = 'follow';
            if (val.indexOf(target) === -1) return val + ' nofollow';
            return val;
        });
        if (drupalSettings.data.extlink.extNoreferrer) $(external_links).attr('rel', function(i, val) {
            if (val === null || typeof val === 'undefined') return 'noreferrer';
            if (val.indexOf('noreferrer') === -1) return val + ' noreferrer';
            return val;
        });
        Drupal.extlink = Drupal.extlink || {};
        Drupal.extlink.popupClickHandler = Drupal.extlink.popupClickHandler || function() {
            if (drupalSettings.data.extlink.extAlert) return confirm(drupalSettings.data.extlink.extAlertText);
        };
        $(external_links).off("click.extlink");
        $(external_links).on("click.extlink", function(e) {
            return Drupal.extlink.popupClickHandler(e, this);
        });
    };
    Drupal.extlink.applyClassAndSpan = function(links, class_name, icon_placement) {
        var $links_to_process;
        if (drupalSettings.data.extlink.extImgClass) $links_to_process = $(links);
        else {
            var links_with_images = $(links).find('img, svg').parents('a');
            $links_to_process = $(links).not(links_with_images);
        }
        if (class_name !== '0') $links_to_process.addClass(class_name);
        $links_to_process.attr('data-extlink', '');
        var i;
        var length = $links_to_process.length;
        for (i = 0; i < length; i++) {
            var $link = $($links_to_process[i]);
            if (drupalSettings.data.extlink.extUseFontAwesome)
                if (class_name === drupalSettings.data.extlink.mailtoClass) $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaMailtoClasses + '" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '"></span></span>');
                else $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaLinkClasses + '" aria-label="' + drupalSettings.data.extlink.extLabel + '"></span></span>');
            else if (class_name === drupalSettings.data.extlink.mailtoClass) $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 10 70 20"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.mailtoLabel + '</title><path d="M56 14H8c-1.1 0-2 0.9-2 2v32c0 1.1 0.9 2 2 2h48c1.1 0 2-0.9 2-2V16C58 14.9 57.1 14 56 14zM50.5 18L32 33.4 13.5 18H50.5zM10 46V20.3l20.7 17.3C31.1 37.8 31.5 38 32 38s0.9-0.2 1.3-0.5L54 20.3V46H10z"/></svg>');
            else $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.extLabel + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.extLabel + '</title><path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"/><path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"/></svg>');
        }
    };
    Drupal.behaviors.extlink = Drupal.behaviors.extlink || {};
    Drupal.behaviors.extlink.attach = function(context, drupalSettings) {
        if (typeof extlinkAttach === 'function') extlinkAttach(context);
        else Drupal.extlink.attach(context, drupalSettings);
    };
})(jQuery, Drupal, drupalSettings);;