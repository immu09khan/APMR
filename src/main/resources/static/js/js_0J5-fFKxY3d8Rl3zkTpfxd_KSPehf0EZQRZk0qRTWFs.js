/* @license GNU-GPL-2.0-or-later https://www.drupal.org/licensing/faq */
(function() {
    const settingsElement = document.querySelector('head > script[type="application/json"][data-drupal-selector="drupal-settings-json"], body > script[type="application/json"][data-drupal-selector="drupal-settings-json"]');
    window.drupalSettings = {};
    if (settingsElement !== null) window.drupalSettings = JSON.parse(settingsElement.textContent);
})();;
window.Drupal = {
    behaviors: {},
    locale: {}
};
(function(Drupal, drupalSettings, drupalTranslations, console, Proxy, Reflect) {
    Drupal.throwError = function(error) {
        setTimeout(() => {
            throw error;
        }, 0);
    };
    Drupal.attachBehaviors = function(context, settings) {
        context = context || document;
        settings = settings || drupalSettings;
        const behaviors = Drupal.behaviors;
        Object.keys(behaviors || {}).forEach((i) => {
            if (typeof behaviors[i].attach === 'function') try {
                behaviors[i].attach(context, settings);
            } catch (e) {
                Drupal.throwError(e);
            }
        });
    };
    Drupal.detachBehaviors = function(context, settings, trigger) {
        context = context || document;
        settings = settings || drupalSettings;
        trigger = trigger || 'unload';
        const behaviors = Drupal.behaviors;
        Object.keys(behaviors || {}).forEach((i) => {
            if (typeof behaviors[i].detach === 'function') try {
                behaviors[i].detach(context, settings, trigger);
            } catch (e) {
                Drupal.throwError(e);
            }
        });
    };
    Drupal.checkPlain = function(str) {
        str = str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return str;
    };
    Drupal.formatString = function(str, args) {
        const processedArgs = {};
        Object.keys(args || {}).forEach((key) => {
            switch (key.charAt(0)) {
                case '@':
                    processedArgs[key] = Drupal.checkPlain(args[key]);
                    break;
                case '!':
                    processedArgs[key] = args[key];
                    break;
                default:
                    processedArgs[key] = Drupal.theme('placeholder', args[key]);
                    break;
            }
        });
        return Drupal.stringReplace(str, processedArgs, null);
    };
    Drupal.stringReplace = function(str, args, keys) {
        if (str.length === 0) return str;
        if (!Array.isArray(keys)) {
            keys = Object.keys(args || {});
            keys.sort((a, b) => a.length - b.length);
        }
        if (keys.length === 0) return str;
        const key = keys.pop();
        const fragments = str.split(key);
        if (keys.length) {
            for (let i = 0; i < fragments.length; i++) fragments[i] = Drupal.stringReplace(fragments[i], args, keys.slice(0));
        }
        return fragments.join(args[key]);
    };
    Drupal.t = function(str, args, options) {
        options = options || {};
        options.context = options.context || '';
        if (typeof drupalTranslations !== 'undefined' && drupalTranslations.strings && drupalTranslations.strings[options.context] && drupalTranslations.strings[options.context][str]) str = drupalTranslations.strings[options.context][str];
        if (args) str = Drupal.formatString(str, args);
        return str;
    };
    Drupal.url = function(path) {
        return drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + path;
    };
    Drupal.url.toAbsolute = function(url) {
        const urlParsingNode = document.createElement('a');
        try {
            url = decodeURIComponent(url);
        } catch (e) {}
        urlParsingNode.setAttribute('href', url);
        return urlParsingNode.cloneNode(false).href;
    };
    Drupal.url.isLocal = function(url) {
        let absoluteUrl = Drupal.url.toAbsolute(url);
        let {
            protocol
        } = window.location;
        if (protocol === 'http:' && absoluteUrl.indexOf('https:') === 0) protocol = 'https:';
        let baseUrl = `${protocol}//${window.location.host}${drupalSettings.path.baseUrl.slice(0,-1)}`;
        try {
            absoluteUrl = decodeURIComponent(absoluteUrl);
        } catch (e) {}
        try {
            baseUrl = decodeURIComponent(baseUrl);
        } catch (e) {}
        return absoluteUrl === baseUrl || absoluteUrl.indexOf(`${baseUrl}/`) === 0;
    };
    Drupal.formatPlural = function(count, singular, plural, args, options) {
        args = args || {};
        args['@count'] = count;
        const pluralDelimiter = drupalSettings.pluralDelimiter;
        const translations = Drupal.t(singular + pluralDelimiter + plural, args, options).split(pluralDelimiter);
        let index = 0;
        if (typeof drupalTranslations !== 'undefined' && drupalTranslations.pluralFormula) index = count in drupalTranslations.pluralFormula ? drupalTranslations.pluralFormula[count] : drupalTranslations.pluralFormula.default;
        else {
            if (args['@count'] !== 1) index = 1;
        }
        return translations[index];
    };
    Drupal.encodePath = function(item) {
        return window.encodeURIComponent(item).replace(/%2F/g, '/');
    };
    Drupal.deprecationError = ({
        message
    }) => {
        if (drupalSettings.suppressDeprecationErrors === false && typeof console !== 'undefined' && console.warn) console.warn(`[Deprecation] ${message}`);
    };
    Drupal.deprecatedProperty = ({
        target,
        deprecatedProperty,
        message
    }) => {
        if (!Proxy || !Reflect) return target;
        return new Proxy(target, {
            get: (target, key, ...rest) => {
                if (key === deprecatedProperty) Drupal.deprecationError({
                    message
                });
                return Reflect.get(target, key, ...rest);
            }
        });
    };
    Drupal.theme = function(func, ...args) {
        if (func in Drupal.theme) return Drupal.theme[func](...args);
    };
    Drupal.theme.placeholder = function(str) {
        return `<em class="placeholder">${Drupal.checkPlain(str)}</em>`;
    };
})(Drupal, window.drupalSettings, window.drupalTranslations, window.console, window.Proxy, window.Reflect);;
if (window.jQuery) jQuery.noConflict();
document.documentElement.className += ' js';
(function(Drupal, drupalSettings) {
    const domReady = (callback) => {
        const listener = () => {
            callback();
            document.removeEventListener('DOMContentLoaded', listener);
        };
        if (document.readyState !== 'loading') setTimeout(callback, 0);
        else document.addEventListener('DOMContentLoaded', listener);
    };
    domReady(() => {
        Drupal.attachBehaviors(document, drupalSettings);
    });
})(Drupal, window.drupalSettings);;
(function($, Drupal) {
    Drupal.behaviors.LayoutBuilderCustomizer = {
        attach: function attach(context) {
            $(once("layout-builder-customizer", "#layout-builder .js-layout-builder-block", context)).hover(function() {
                $(this).toggleClass("layout-builder-customizer--links");
            });
        }
    };
})(jQuery, Drupal);;

function naturalSort(a, b) {
    var re = /(^([+\-]?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,
        snre = /\s+/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) {
            return (naturalSort.insensitive && ('' + s).toLowerCase() || '' + s).replace(sre, '');
        },
        x = i(a),
        y = i(b),
        xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
        xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
        yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
        normChunk = function(s, l) {
            return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
        },
        oFxNcL, oFyNcL;
    if (yD)
        if (xD < yD) return -1;
        else {
            if (xD > yD) return 1;
        }
    for (var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
        oFxNcL = normChunk(xN[cLoc] || '', xNl);
        oFyNcL = normChunk(yN[cLoc] || '', yNl);
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) return isNaN(oFxNcL) ? 1 : -1;
        if (/[^\x00-\x80]/.test(oFxNcL + oFyNcL) && oFxNcL.localeCompare) {
            var comp = oFxNcL.localeCompare(oFyNcL);
            return comp / Math.abs(comp);
        }
        if (oFxNcL < oFyNcL) return -1;
        else {
            if (oFxNcL > oFyNcL) return 1;
        }
    }
};;
(function($) {
    'use strict';
    var ts = $.tablesorter = {
        version: '2.31.1',
        parsers: [],
        widgets: [],
        defaults: {
            theme: 'default',
            widthFixed: false,
            showProcessing: false,
            headerTemplate: '{content}',
            onRenderTemplate: null,
            onRenderHeader: null,
            cancelSelection: true,
            tabIndex: true,
            dateFormat: 'mmddyyyy',
            sortMultiSortKey: 'shiftKey',
            sortResetKey: 'ctrlKey',
            usNumberFormat: true,
            delayInit: false,
            serverSideSorting: false,
            resort: true,
            headers: {},
            ignoreCase: true,
            sortForce: null,
            sortList: [],
            sortAppend: null,
            sortStable: false,
            sortInitialOrder: 'asc',
            sortLocaleCompare: false,
            sortReset: false,
            sortRestart: false,
            emptyTo: 'bottom',
            stringTo: 'max',
            duplicateSpan: true,
            textExtraction: 'basic',
            textAttribute: 'data-text',
            textSorter: null,
            numberSorter: null,
            initWidgets: true,
            widgetClass: 'widget-{name}',
            widgets: [],
            widgetOptions: {
                zebra: ['even', 'odd']
            },
            initialized: null,
            tableClass: '',
            cssAsc: '',
            cssDesc: '',
            cssNone: '',
            cssHeader: '',
            cssHeaderRow: '',
            cssProcessing: '',
            cssChildRow: 'tablesorter-childRow',
            cssInfoBlock: 'tablesorter-infoOnly',
            cssNoSort: 'tablesorter-noSort',
            cssIgnoreRow: 'tablesorter-ignoreRow',
            cssIcon: 'tablesorter-icon',
            cssIconNone: '',
            cssIconAsc: '',
            cssIconDesc: '',
            cssIconDisabled: '',
            pointerClick: 'click',
            pointerDown: 'mousedown',
            pointerUp: 'mouseup',
            selectorHeaders: '> thead th, > thead td',
            selectorSort: 'th, td',
            selectorRemove: '.remove-me',
            debug: false,
            headerList: [],
            empties: {},
            strings: {},
            parsers: [],
            globalize: 0,
            imgAttr: 0
        },
        css: {
            table: 'tablesorter',
            cssHasChild: 'tablesorter-hasChildRow',
            childRow: 'tablesorter-childRow',
            colgroup: 'tablesorter-colgroup',
            header: 'tablesorter-header',
            headerRow: 'tablesorter-headerRow',
            headerIn: 'tablesorter-header-inner',
            icon: 'tablesorter-icon',
            processing: 'tablesorter-processing',
            sortAsc: 'tablesorter-headerAsc',
            sortDesc: 'tablesorter-headerDesc',
            sortNone: 'tablesorter-headerUnSorted'
        },
        language: {
            sortAsc: 'Ascending sort applied, ',
            sortDesc: 'Descending sort applied, ',
            sortNone: 'No sort applied, ',
            sortDisabled: 'sorting is disabled',
            nextAsc: 'activate to apply an ascending sort',
            nextDesc: 'activate to apply a descending sort',
            nextNone: 'activate to remove the sort'
        },
        regex: {
            templateContent: /\{content\}/g,
            templateIcon: /\{icon\}/g,
            templateName: /\{name\}/i,
            spaces: /\s+/g,
            nonWord: /\W/g,
            formElements: /(input|select|button|textarea)/i,
            chunk: /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi,
            chunks: /(^\\0|\\0$)/,
            hex: /^0x[0-9a-f]+$/i,
            comma: /,/g,
            digitNonUS: /[\s|\.]/g,
            digitNegativeTest: /^\s*\([.\d]+\)/,
            digitNegativeReplace: /^\s*\(([.\d]+)\)/,
            digitTest: /^[\-+(]?\d+[)]?$/,
            digitReplace: /[,.'"\s]/g
        },
        string: {
            max: 1,
            min: -1,
            emptymin: 1,
            emptymax: -1,
            zero: 0,
            none: 0,
            'null': 0,
            top: true,
            bottom: false
        },
        keyCodes: {
            enter: 13
        },
        dates: {},
        instanceMethods: {},
        setup: function(table, c) {
            if (!table || !table.tHead || table.tBodies.length === 0 || table.hasInitialized === true) {
                if (ts.debug(c, 'core'))
                    if (table.hasInitialized) console.warn('Stopping initialization. Tablesorter has already been initialized');
                    else console.error('Stopping initialization! No table, thead or tbody', table);
                return;
            }
            var tmp = '',
                $table = $(table),
                meta = $.metadata;
            table.hasInitialized = false;
            table.isProcessing = true;
            table.config = c;
            $.data(table, 'tablesorter', c);
            if (ts.debug(c, 'core')) {
                console[console.group ? 'group' : 'log']('Initializing tablesorter v' + ts.version);
                $.data(table, 'startoveralltimer', new Date());
            }
            c.supportsDataObject = (function(version) {
                version[0] = parseInt(version[0], 10);
                return (version[0] > 1) || (version[0] === 1 && parseInt(version[1], 10) >= 4);
            })($.fn.jquery.split('.'));
            c.emptyTo = c.emptyTo.toLowerCase();
            c.stringTo = c.stringTo.toLowerCase();
            c.last = {
                sortList: [],
                clickedIndex: -1
            };
            if (!/tablesorter\-/.test($table.attr('class'))) tmp = (c.theme !== '' ? ' tablesorter-' + c.theme : '');
            if (!c.namespace) c.namespace = '.tablesorter' + Math.random().toString(16).slice(2);
            else c.namespace = '.' + c.namespace.replace(ts.regex.nonWord, '');
            c.table = table;
            c.$table = $table.addClass(ts.css.table + ' ' + c.tableClass + tmp + ' ' + c.namespace.slice(1)).attr('role', 'grid');
            c.$headers = $table.find(c.selectorHeaders);
            c.$table.children().children('tr').attr('role', 'row');
            c.$tbodies = $table.children('tbody:not(.' + c.cssInfoBlock + ')').attr({
                'aria-live': 'polite',
                'aria-relevant': 'all'
            });
            if (c.$table.children('caption').length) {
                tmp = c.$table.children('caption')[0];
                if (!tmp.id) tmp.id = c.namespace.slice(1) + 'caption';
                c.$table.attr('aria-labelledby', tmp.id);
            }
            c.widgetInit = {};
            c.textExtraction = c.$table.attr('data-text-extraction') || c.textExtraction || 'basic';
            ts.buildHeaders(c);
            ts.fixColumnWidth(table);
            ts.addWidgetFromClass(table);
            ts.applyWidgetOptions(table);
            ts.setupParsers(c);
            c.totalRows = 0;
            if (c.debug) ts.validateOptions(c);
            if (!c.delayInit) ts.buildCache(c);
            ts.bindEvents(table, c.$headers, true);
            ts.bindMethods(c);
            if (c.supportsDataObject && typeof $table.data().sortlist !== 'undefined') c.sortList = $table.data().sortlist;
            else {
                if (meta && ($table.metadata() && $table.metadata().sortlist)) c.sortList = $table.metadata().sortlist;
            }
            ts.applyWidget(table, true);
            if (c.sortList.length > 0) {
                c.last.sortList = c.sortList;
                ts.sortOn(c, c.sortList, {}, !c.initWidgets);
            } else {
                ts.setHeadersCss(c);
                if (c.initWidgets) ts.applyWidget(table, false);
            }
            if (c.showProcessing) $table.unbind('sortBegin' + c.namespace + ' sortEnd' + c.namespace).bind('sortBegin' + c.namespace + ' sortEnd' + c.namespace, function(e) {
                clearTimeout(c.timerProcessing);
                ts.isProcessing(table);
                if (e.type === 'sortBegin') c.timerProcessing = setTimeout(function() {
                    ts.isProcessing(table, true);
                }, 500);
            });
            table.hasInitialized = true;
            table.isProcessing = false;
            if (ts.debug(c, 'core')) {
                console.log('Overall initialization time:' + ts.benchmark($.data(table, 'startoveralltimer')));
                if (ts.debug(c, 'core') && console.groupEnd) console.groupEnd();
            }
            $table.triggerHandler('tablesorter-initialized', table);
            if (typeof c.initialized === 'function') c.initialized(table);
        },
        bindMethods: function(c) {
            var $table = c.$table,
                namespace = c.namespace,
                events = ('sortReset update updateRows updateAll updateHeaders addRows updateCell updateComplete ' + 'sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup ' + 'mouseleave ').split(' ').join(namespace + ' ');
            $table.unbind(events.replace(ts.regex.spaces, ' ')).bind('sortReset' + namespace, function(e, callback) {
                e.stopPropagation();
                ts.sortReset(this.config, function(table) {
                    if (table.isApplyingWidgets) setTimeout(function() {
                        ts.applyWidget(table, '', callback);
                    }, 100);
                    else ts.applyWidget(table, '', callback);
                });
            }).bind('updateAll' + namespace, function(e, resort, callback) {
                e.stopPropagation();
                ts.updateAll(this.config, resort, callback);
            }).bind('update' + namespace + ' updateRows' + namespace, function(e, resort, callback) {
                e.stopPropagation();
                ts.update(this.config, resort, callback);
            }).bind('updateHeaders' + namespace, function(e, callback) {
                e.stopPropagation();
                ts.updateHeaders(this.config, callback);
            }).bind('updateCell' + namespace, function(e, cell, resort, callback) {
                e.stopPropagation();
                ts.updateCell(this.config, cell, resort, callback);
            }).bind('addRows' + namespace, function(e, $row, resort, callback) {
                e.stopPropagation();
                ts.addRows(this.config, $row, resort, callback);
            }).bind('updateComplete' + namespace, function() {
                this.isUpdating = false;
            }).bind('sorton' + namespace, function(e, list, callback, init) {
                e.stopPropagation();
                ts.sortOn(this.config, list, callback, init);
            }).bind('appendCache' + namespace, function(e, callback, init) {
                e.stopPropagation();
                ts.appendCache(this.config, init);
                if ($.isFunction(callback)) callback(this);
            }).bind('updateCache' + namespace, function(e, callback, $tbodies) {
                e.stopPropagation();
                ts.updateCache(this.config, callback, $tbodies);
            }).bind('applyWidgetId' + namespace, function(e, id) {
                e.stopPropagation();
                ts.applyWidgetId(this, id);
            }).bind('applyWidgets' + namespace, function(e, callback) {
                e.stopPropagation();
                ts.applyWidget(this, false, callback);
            }).bind('refreshWidgets' + namespace, function(e, all, dontapply) {
                e.stopPropagation();
                ts.refreshWidgets(this, all, dontapply);
            }).bind('removeWidget' + namespace, function(e, name, refreshing) {
                e.stopPropagation();
                ts.removeWidget(this, name, refreshing);
            }).bind('destroy' + namespace, function(e, removeClasses, callback) {
                e.stopPropagation();
                ts.destroy(this, removeClasses, callback);
            }).bind('resetToLoadState' + namespace, function(e) {
                e.stopPropagation();
                ts.removeWidget(this, true, false);
                var tmp = $.extend(true, {}, c.originalSettings);
                c = $.extend(true, {}, ts.defaults, tmp);
                c.originalSettings = tmp;
                this.hasInitialized = false;
                ts.setup(this, c);
            });
        },
        bindEvents: function(table, $headers, core) {
            table = $(table)[0];
            var tmp, c = table.config,
                namespace = c.namespace,
                downTarget = null;
            if (core !== true) {
                $headers.addClass(namespace.slice(1) + '_extra_headers');
                tmp = ts.getClosest($headers, 'table');
                if (tmp.length && tmp[0].nodeName === 'TABLE' && tmp[0] !== table) $(tmp[0]).addClass(namespace.slice(1) + '_extra_table');
            }
            tmp = (c.pointerDown + ' ' + c.pointerUp + ' ' + c.pointerClick + ' sort keyup ').replace(ts.regex.spaces, ' ').split(' ').join(namespace + ' ');
            $headers.find(c.selectorSort).add($headers.filter(c.selectorSort)).unbind(tmp).bind(tmp, function(e, external) {
                var $cell, cell, temp, $target = $(e.target),
                    type = ' ' + e.type + ' ';
                if (((e.which || e.button) !== 1 && !type.match(' ' + c.pointerClick + ' | sort | keyup ')) || (type === ' keyup ' && e.which !== ts.keyCodes.enter) || (type.match(' ' + c.pointerClick + ' ') && typeof e.which !== 'undefined')) return;
                if (type.match(' ' + c.pointerUp + ' ') && downTarget !== e.target && external !== true) return;
                if (type.match(' ' + c.pointerDown + ' ')) {
                    downTarget = e.target;
                    temp = $target.jquery.split('.');
                    if (temp[0] === '1' && temp[1] < 4) e.preventDefault();
                    return;
                }
                downTarget = null;
                $cell = ts.getClosest($(this), '.' + ts.css.header);
                if (ts.regex.formElements.test(e.target.nodeName) || $target.hasClass(c.cssNoSort) || $target.parents('.' + c.cssNoSort).length > 0 || $cell.hasClass('sorter-false') || $target.parents('button').length > 0) return !c.cancelSelection;
                if (c.delayInit && ts.isEmptyObject(c.cache)) ts.buildCache(c);
                c.last.clickedIndex = $cell.attr('data-column') || $cell.index();
                cell = c.$headerIndexed[c.last.clickedIndex][0];
                if (cell && !cell.sortDisabled) ts.initSort(c, cell, e);
            });
            if (c.cancelSelection) $headers.attr('unselectable', 'on').bind('selectstart', false).css({
                'user-select': 'none',
                'MozUserSelect': 'none'
            });
        },
        buildHeaders: function(c) {
            var $temp, icon, timer, indx;
            c.headerList = [];
            c.headerContent = [];
            c.sortVars = [];
            if (ts.debug(c, 'core')) timer = new Date();
            c.columns = ts.computeColumnIndex(c.$table.children('thead, tfoot').children('tr'));
            icon = c.cssIcon ? '<i class="' + (c.cssIcon === ts.css.icon ? ts.css.icon : c.cssIcon + ' ' + ts.css.icon) + '"></i>' : '';
            c.$headers = $($.map(c.$table.find(c.selectorHeaders), function(elem, index) {
                var configHeaders, header, column, template, tmp, $elem = $(elem);
                if (ts.getClosest($elem, 'tr').hasClass(c.cssIgnoreRow)) return;
                if (!/(th|td)/i.test(elem.nodeName)) {
                    tmp = ts.getClosest($elem, 'th, td');
                    $elem.attr('data-column', tmp.attr('data-column'));
                }
                configHeaders = ts.getColumnData(c.table, c.headers, index, true);
                c.headerContent[index] = $elem.html();
                if (c.headerTemplate !== '' && !$elem.find('.' + ts.css.headerIn).length) {
                    template = c.headerTemplate.replace(ts.regex.templateContent, $elem.html()).replace(ts.regex.templateIcon, $elem.find('.' + ts.css.icon).length ? '' : icon);
                    if (c.onRenderTemplate) {
                        header = c.onRenderTemplate.apply($elem, [index, template]);
                        if (header && typeof header === 'string') template = header;
                    }
                    $elem.html('<div class="' + ts.css.headerIn + '">' + template + '</div>');
                }
                if (c.onRenderHeader) c.onRenderHeader.apply($elem, [index, c, c.$table]);
                column = parseInt($elem.attr('data-column'), 10);
                elem.column = column;
                tmp = ts.getOrder(ts.getData($elem, configHeaders, 'sortInitialOrder') || c.sortInitialOrder);
                c.sortVars[column] = {
                    count: -1,
                    order: tmp ? (c.sortReset ? [1, 0, 2] : [1, 0]) : (c.sortReset ? [0, 1, 2] : [0, 1]),
                    lockedOrder: false,
                    sortedBy: ''
                };
                tmp = ts.getData($elem, configHeaders, 'lockedOrder') || false;
                if (typeof tmp !== 'undefined' && tmp !== false) {
                    c.sortVars[column].lockedOrder = true;
                    c.sortVars[column].order = ts.getOrder(tmp) ? [1, 1] : [0, 0];
                }
                c.headerList[index] = elem;
                $elem.addClass(ts.css.header + ' ' + c.cssHeader);
                ts.getClosest($elem, 'tr').addClass(ts.css.headerRow + ' ' + c.cssHeaderRow).attr('role', 'row');
                if (c.tabIndex) $elem.attr('tabindex', 0);
                return elem;
            }));
            c.$headerIndexed = [];
            for (indx = 0; indx < c.columns; indx++) {
                if (ts.isEmptyObject(c.sortVars[indx])) c.sortVars[indx] = {};
                $temp = c.$headers.filter('[data-column="' + indx + '"]');
                c.$headerIndexed[indx] = $temp.length ? $temp.not('.sorter-false').length ? $temp.not('.sorter-false').filter(':last') : $temp.filter(':last') : $();
            }
            c.$table.find(c.selectorHeaders).attr({
                scope: 'col',
                role: 'columnheader'
            });
            ts.updateHeader(c);
            if (ts.debug(c, 'core')) {
                console.log('Built headers:' + ts.benchmark(timer));
                console.log(c.$headers);
            }
        },
        addInstanceMethods: function(methods) {
            $.extend(ts.instanceMethods, methods);
        },
        setupParsers: function(c, $tbodies) {
            var rows, list, span, max, colIndex, indx, header, configHeaders, noParser, parser, extractor, time, tbody, len, table = c.table,
                tbodyIndex = 0,
                debug = ts.debug(c, 'core'),
                debugOutput = {};
            c.$tbodies = c.$table.children('tbody:not(.' + c.cssInfoBlock + ')');
            tbody = typeof $tbodies === 'undefined' ? c.$tbodies : $tbodies;
            len = tbody.length;
            if (len === 0) return debug ? console.warn('Warning: *Empty table!* Not building a parser cache') : '';
            else {
                if (debug) {
                    time = new Date();
                    console[console.group ? 'group' : 'log']('Detecting parsers for each column');
                }
            }
            list = {
                extractors: [],
                parsers: []
            };
            while (tbodyIndex < len) {
                rows = tbody[tbodyIndex].rows;
                if (rows.length) {
                    colIndex = 0;
                    max = c.columns;
                    for (indx = 0; indx < max; indx++) {
                        header = c.$headerIndexed[colIndex];
                        if (header && header.length) {
                            configHeaders = ts.getColumnData(table, c.headers, colIndex);
                            extractor = ts.getParserById(ts.getData(header, configHeaders, 'extractor'));
                            parser = ts.getParserById(ts.getData(header, configHeaders, 'sorter'));
                            noParser = ts.getData(header, configHeaders, 'parser') === 'false';
                            c.empties[colIndex] = (ts.getData(header, configHeaders, 'empty') || c.emptyTo || (c.emptyToBottom ? 'bottom' : 'top')).toLowerCase();
                            c.strings[colIndex] = (ts.getData(header, configHeaders, 'string') || c.stringTo || 'max').toLowerCase();
                            if (noParser) parser = ts.getParserById('no-parser');
                            if (!extractor) extractor = false;
                            if (!parser) parser = ts.detectParserForColumn(c, rows, -1, colIndex);
                            if (debug) debugOutput['(' + colIndex + ') ' + header.text()] = {
                                parser: parser.id,
                                extractor: extractor ? extractor.id : 'none',
                                string: c.strings[colIndex],
                                empty: c.empties[colIndex]
                            };
                            list.parsers[colIndex] = parser;
                            list.extractors[colIndex] = extractor;
                            span = header[0].colSpan - 1;
                            if (span > 0) {
                                colIndex += span;
                                max += span;
                                while (span + 1 > 0) {
                                    list.parsers[colIndex - span] = parser;
                                    list.extractors[colIndex - span] = extractor;
                                    span--;
                                }
                            }
                        }
                        colIndex++;
                    }
                }
                tbodyIndex += (list.parsers.length) ? len : 1;
            }
            if (debug) {
                if (!ts.isEmptyObject(debugOutput)) console[console.table ? 'table' : 'log'](debugOutput);
                else console.warn('  No parsers detected!');
                console.log('Completed detecting parsers' + ts.benchmark(time));
                if (console.groupEnd) console.groupEnd();
            }
            c.parsers = list.parsers;
            c.extractors = list.extractors;
        },
        addParser: function(parser) {
            var indx, len = ts.parsers.length,
                add = true;
            for (indx = 0; indx < len; indx++)
                if (ts.parsers[indx].id.toLowerCase() === parser.id.toLowerCase()) add = false;
            if (add) ts.parsers[ts.parsers.length] = parser;
        },
        getParserById: function(name) {
            if (name == 'false') return false;
            var indx, len = ts.parsers.length;
            for (indx = 0; indx < len; indx++)
                if (ts.parsers[indx].id.toLowerCase() === (name.toString()).toLowerCase()) return ts.parsers[indx];
            return false;
        },
        detectParserForColumn: function(c, rows, rowIndex, cellIndex) {
            var cur, $node, row, indx = ts.parsers.length,
                node = false,
                nodeValue = '',
                debug = ts.debug(c, 'core'),
                keepLooking = true;
            while (nodeValue === '' && keepLooking) {
                rowIndex++;
                row = rows[rowIndex];
                if (row && rowIndex < 50) {
                    if (row.className.indexOf(ts.cssIgnoreRow) < 0) {
                        node = rows[rowIndex].cells[cellIndex];
                        nodeValue = ts.getElementText(c, node, cellIndex);
                        $node = $(node);
                        if (debug) console.log('Checking if value was empty on row ' + rowIndex + ', column: ' + cellIndex + ': "' + nodeValue + '"');
                    }
                } else keepLooking = false;
            }
            while (--indx >= 0) {
                cur = ts.parsers[indx];
                if (cur && cur.id !== 'text' && cur.is && cur.is(nodeValue, c.table, node, $node)) return cur;
            }
            return ts.getParserById('text');
        },
        getElementText: function(c, node, cellIndex) {
            if (!node) return '';
            var tmp, extract = c.textExtraction || '',
                $node = node.jquery ? node : $(node);
            if (typeof extract === 'string') {
                if (extract === 'basic' && typeof(tmp = $node.attr(c.textAttribute)) !== 'undefined') return $.trim(tmp);
                return $.trim(node.textContent || $node.text());
            } else if (typeof extract === 'function') return $.trim(extract($node[0], c.table, cellIndex));
            else {
                if (typeof(tmp = ts.getColumnData(c.table, extract, cellIndex)) === 'function') return $.trim(tmp($node[0], c.table, cellIndex));
            }
            return $.trim($node[0].textContent || $node.text());
        },
        getParsedText: function(c, cell, colIndex, txt) {
            if (typeof txt === 'undefined') txt = ts.getElementText(c, cell, colIndex);
            var val = '' + txt,
                parser = c.parsers[colIndex],
                extractor = c.extractors[colIndex];
            if (parser) {
                if (extractor && typeof extractor.format === 'function') txt = extractor.format(txt, c.table, cell, colIndex);
                val = parser.id === 'no-parser' ? '' : parser.format('' + txt, c.table, cell, colIndex);
                if (c.ignoreCase && typeof val === 'string') val = val.toLowerCase();
            }
            return val;
        },
        buildCache: function(c, callback, $tbodies) {
            var cache, val, txt, rowIndex, colIndex, tbodyIndex, $tbody, $row, cols, $cells, cell, cacheTime, totalRows, rowData, prevRowData, colMax, span, cacheIndex, hasParser, max, len, index, table = c.table,
                parsers = c.parsers,
                debug = ts.debug(c, 'core');
            c.$tbodies = c.$table.children('tbody:not(.' + c.cssInfoBlock + ')');
            $tbody = typeof $tbodies === 'undefined' ? c.$tbodies : $tbodies, c.cache = {};
            c.totalRows = 0;
            if (!parsers) return debug ? console.warn('Warning: *Empty table!* Not building a cache') : '';
            if (debug) cacheTime = new Date();
            if (c.showProcessing) ts.isProcessing(table, true);
            for (tbodyIndex = 0; tbodyIndex < $tbody.length; tbodyIndex++) {
                colMax = [];
                cache = c.cache[tbodyIndex] = {
                    normalized: []
                };
                totalRows = ($tbody[tbodyIndex] && $tbody[tbodyIndex].rows.length) || 0;
                for (rowIndex = 0; rowIndex < totalRows; ++rowIndex) {
                    rowData = {
                        child: [],
                        raw: []
                    };
                    $row = $($tbody[tbodyIndex].rows[rowIndex]);
                    cols = [];
                    if ($row.hasClass(c.selectorRemove.slice(1))) continue;
                    if ($row.hasClass(c.cssChildRow) && rowIndex !== 0) {
                        len = cache.normalized.length - 1;
                        prevRowData = cache.normalized[len][c.columns];
                        prevRowData.$row = prevRowData.$row.add($row);
                        if (!$row.prev().hasClass(c.cssChildRow)) $row.prev().addClass(ts.css.cssHasChild);
                        $cells = $row.children('th, td');
                        len = prevRowData.child.length;
                        prevRowData.child[len] = [];
                        cacheIndex = 0;
                        max = c.columns;
                        for (colIndex = 0; colIndex < max; colIndex++) {
                            cell = $cells[colIndex];
                            if (cell) {
                                prevRowData.child[len][colIndex] = ts.getParsedText(c, cell, colIndex);
                                span = $cells[colIndex].colSpan - 1;
                                if (span > 0) {
                                    cacheIndex += span;
                                    max += span;
                                }
                            }
                            cacheIndex++;
                        }
                        continue;
                    }
                    rowData.$row = $row;
                    rowData.order = rowIndex;
                    cacheIndex = 0;
                    max = c.columns;
                    for (colIndex = 0; colIndex < max; ++colIndex) {
                        cell = $row[0].cells[colIndex];
                        if (cell && cacheIndex < c.columns) {
                            hasParser = typeof parsers[cacheIndex] !== 'undefined';
                            if (!hasParser && debug) console.warn('No parser found for row: ' + rowIndex + ', column: ' + colIndex + '; cell containing: "' + $(cell).text() + '"; does it have a header?');
                            val = ts.getElementText(c, cell, cacheIndex);
                            rowData.raw[cacheIndex] = val;
                            txt = ts.getParsedText(c, cell, cacheIndex, val);
                            cols[cacheIndex] = txt;
                            if (hasParser && (parsers[cacheIndex].type || '').toLowerCase() === 'numeric') colMax[cacheIndex] = Math.max(Math.abs(txt) || 0, colMax[cacheIndex] || 0);
                            span = cell.colSpan - 1;
                            if (span > 0) {
                                index = 0;
                                while (index <= span) {
                                    txt = c.duplicateSpan || index === 0 ? val : typeof c.textExtraction !== 'string' ? ts.getElementText(c, cell, cacheIndex + index) || '' : '';
                                    rowData.raw[cacheIndex + index] = txt;
                                    cols[cacheIndex + index] = txt;
                                    index++;
                                }
                                cacheIndex += span;
                                max += span;
                            }
                        }
                        cacheIndex++;
                    }
                    cols[c.columns] = rowData;
                    cache.normalized[cache.normalized.length] = cols;
                }
                cache.colMax = colMax;
                c.totalRows += cache.normalized.length;
            }
            if (c.showProcessing) ts.isProcessing(table);
            if (debug) {
                len = Math.min(5, c.cache[0].normalized.length);
                console[console.group ? 'group' : 'log']('Building cache for ' + c.totalRows + ' rows (showing ' + len + ' rows in log) and ' + c.columns + ' columns' + ts.benchmark(cacheTime));
                val = {};
                for (colIndex = 0; colIndex < c.columns; colIndex++)
                    for (cacheIndex = 0; cacheIndex < len; cacheIndex++) {
                        if (!val['row: ' + cacheIndex]) val['row: ' + cacheIndex] = {};
                        val['row: ' + cacheIndex][c.$headerIndexed[colIndex].text()] = c.cache[0].normalized[cacheIndex][colIndex];
                    }
                console[console.table ? 'table' : 'log'](val);
                if (console.groupEnd) console.groupEnd();
            }
            if ($.isFunction(callback)) callback(table);
        },
        getColumnText: function(table, column, callback, rowFilter) {
            table = $(table)[0];
            var tbodyIndex, rowIndex, cache, row, tbodyLen, rowLen, raw, parsed, $cell, result, hasCallback = typeof callback === 'function',
                allColumns = column === 'all',
                data = {
                    raw: [],
                    parsed: [],
                    $cell: []
                },
                c = table.config;
            if (ts.isEmptyObject(c)) {
                if (ts.debug(c, 'core')) console.warn('No cache found - aborting getColumnText function!');
            } else {
                tbodyLen = c.$tbodies.length;
                for (tbodyIndex = 0; tbodyIndex < tbodyLen; tbodyIndex++) {
                    cache = c.cache[tbodyIndex].normalized;
                    rowLen = cache.length;
                    for (rowIndex = 0; rowIndex < rowLen; rowIndex++) {
                        row = cache[rowIndex];
                        if (rowFilter && !row[c.columns].$row.is(rowFilter)) continue;
                        result = true;
                        parsed = (allColumns) ? row.slice(0, c.columns) : row[column];
                        row = row[c.columns];
                        raw = (allColumns) ? row.raw : row.raw[column];
                        $cell = (allColumns) ? row.$row.children() : row.$row.children().eq(column);
                        if (hasCallback) result = callback({
                            tbodyIndex,
                            rowIndex,
                            parsed,
                            raw,
                            $row: row.$row,
                            $cell
                        });
                        if (result !== false) {
                            data.parsed[data.parsed.length] = parsed;
                            data.raw[data.raw.length] = raw;
                            data.$cell[data.$cell.length] = $cell;
                        }
                    }
                }
                return data;
            }
        },
        setHeadersCss: function(c) {
            var indx, column, list = c.sortList,
                len = list.length,
                none = ts.css.sortNone + ' ' + c.cssNone,
                css = [ts.css.sortAsc + ' ' + c.cssAsc, ts.css.sortDesc + ' ' + c.cssDesc],
                cssIcon = [c.cssIconAsc, c.cssIconDesc, c.cssIconNone],
                aria = ['ascending', 'descending'],
                updateColumnSort = function($el, index) {
                    $el.removeClass(none).addClass(css[index]).attr('aria-sort', aria[index]).find('.' + ts.css.icon).removeClass(cssIcon[2]).addClass(cssIcon[index]);
                },
                $extras = c.$table.find('tfoot tr').children('td, th').add($(c.namespace + '_extra_headers')).removeClass(css.join(' ')),
                $sorted = c.$headers.add($('thead ' + c.namespace + '_extra_headers')).removeClass(css.join(' ')).addClass(none).attr('aria-sort', 'none').find('.' + ts.css.icon).removeClass(cssIcon.join(' ')).end();
            $sorted.not('.sorter-false').find('.' + ts.css.icon).addClass(cssIcon[2]);
            if (c.cssIconDisabled) $sorted.filter('.sorter-false').find('.' + ts.css.icon).addClass(c.cssIconDisabled);
            for (indx = 0; indx < len; indx++)
                if (list[indx][1] !== 2) {
                    $sorted = c.$headers.filter(function(i) {
                        var include = true,
                            $el = c.$headers.eq(i),
                            col = parseInt($el.attr('data-column'), 10),
                            end = col + ts.getClosest($el, 'th, td')[0].colSpan;
                        for (; col < end; col++) include = include ? include || ts.isValueInArray(col, c.sortList) > -1 : false;
                        return include;
                    });
                    $sorted = $sorted.not('.sorter-false').filter('[data-column="' + list[indx][0] + '"]' + (len === 1 ? ':last' : ''));
                    if ($sorted.length)
                        for (column = 0; column < $sorted.length; column++)
                            if (!$sorted[column].sortDisabled) updateColumnSort($sorted.eq(column), list[indx][1]);
                    if ($extras.length) updateColumnSort($extras.filter('[data-column="' + list[indx][0] + '"]'), list[indx][1]);
                }
            len = c.$headers.length;
            for (indx = 0; indx < len; indx++) ts.setColumnAriaLabel(c, c.$headers.eq(indx));
        },
        getClosest: function($el, selector) {
            if ($.fn.closest) return $el.closest(selector);
            return $el.is(selector) ? $el : $el.parents(selector).filter(':first');
        },
        setColumnAriaLabel: function(c, $header, nextSort) {
            if ($header.length) {
                var column = parseInt($header.attr('data-column'), 10),
                    vars = c.sortVars[column],
                    tmp = $header.hasClass(ts.css.sortAsc) ? 'sortAsc' : $header.hasClass(ts.css.sortDesc) ? 'sortDesc' : 'sortNone',
                    txt = $.trim($header.text()) + ': ' + ts.language[tmp];
                if ($header.hasClass('sorter-false') || nextSort === false) txt += ts.language.sortDisabled;
                else {
                    tmp = (vars.count + 1) % vars.order.length;
                    nextSort = vars.order[tmp];
                    txt += ts.language[nextSort === 0 ? 'nextAsc' : nextSort === 1 ? 'nextDesc' : 'nextNone'];
                }
                $header.attr('aria-label', txt);
                if (vars.sortedBy) $header.attr('data-sortedBy', vars.sortedBy);
                else $header.removeAttr('data-sortedBy');
            }
        },
        updateHeader: function(c) {
            var index, isDisabled, $header, col, table = c.table,
                len = c.$headers.length;
            for (index = 0; index < len; index++) {
                $header = c.$headers.eq(index);
                col = ts.getColumnData(table, c.headers, index, true);
                isDisabled = ts.getData($header, col, 'sorter') === 'false' || ts.getData($header, col, 'parser') === 'false';
                ts.setColumnSort(c, $header, isDisabled);
            }
        },
        setColumnSort: function(c, $header, isDisabled) {
            var id = c.table.id;
            $header[0].sortDisabled = isDisabled;
            $header[isDisabled ? 'addClass' : 'removeClass']('sorter-false').attr('aria-disabled', '' + isDisabled);
            if (c.tabIndex)
                if (isDisabled) $header.removeAttr('tabindex');
                else $header.attr('tabindex', '0');
            if (id)
                if (isDisabled) $header.removeAttr('aria-controls');
                else $header.attr('aria-controls', id);
        },
        updateHeaderSortCount: function(c, list) {
            var col, dir, group, indx, primary, temp, val, order, sortList = list || c.sortList,
                len = sortList.length;
            c.sortList = [];
            for (indx = 0; indx < len; indx++) {
                val = sortList[indx];
                col = parseInt(val[0], 10);
                if (col < c.columns) {
                    if (!c.sortVars[col].order) {
                        if (ts.getOrder(c.sortInitialOrder)) order = c.sortReset ? [1, 0, 2] : [1, 0];
                        else order = c.sortReset ? [0, 1, 2] : [0, 1];
                        c.sortVars[col].order = order;
                        c.sortVars[col].count = 0;
                    }
                    order = c.sortVars[col].order;
                    dir = ('' + val[1]).match(/^(1|d|s|o|n)/);
                    dir = dir ? dir[0] : '';
                    switch (dir) {
                        case '1':
                        case 'd':
                            dir = 1;
                            break;
                        case 's':
                            dir = primary || 0;
                            break;
                        case 'o':
                            temp = order[(primary || 0) % order.length];
                            dir = temp === 0 ? 1 : temp === 1 ? 0 : 2;
                            break;
                        case 'n':
                            dir = order[(++c.sortVars[col].count) % order.length];
                            break;
                        default:
                            dir = 0;
                            break;
                    }
                    primary = indx === 0 ? dir : primary;
                    group = [col, parseInt(dir, 10) || 0];
                    c.sortList[c.sortList.length] = group;
                    dir = $.inArray(group[1], order);
                    c.sortVars[col].count = dir >= 0 ? dir : group[1] % order.length;
                }
            }
        },
        updateAll: function(c, resort, callback) {
            var table = c.table;
            table.isUpdating = true;
            ts.refreshWidgets(table, true, true);
            ts.buildHeaders(c);
            ts.bindEvents(table, c.$headers, true);
            ts.bindMethods(c);
            ts.commonUpdate(c, resort, callback);
        },
        update: function(c, resort, callback) {
            var table = c.table;
            table.isUpdating = true;
            ts.updateHeader(c);
            ts.commonUpdate(c, resort, callback);
        },
        updateHeaders: function(c, callback) {
            c.table.isUpdating = true;
            ts.buildHeaders(c);
            ts.bindEvents(c.table, c.$headers, true);
            ts.resortComplete(c, callback);
        },
        updateCell: function(c, cell, resort, callback) {
            if ($(cell).closest('tr').hasClass(c.cssChildRow)) {
                console.warn('Tablesorter Warning! "updateCell" for child row content has been disabled, use "update" instead');
                return;
            }
            if (ts.isEmptyObject(c.cache)) {
                ts.updateHeader(c);
                ts.commonUpdate(c, resort, callback);
                return;
            }
            c.table.isUpdating = true;
            c.$table.find(c.selectorRemove).remove();
            var tmp, indx, row, icell, cache, len, $tbodies = c.$tbodies,
                $cell = $(cell),
                tbodyIndex = $tbodies.index(ts.getClosest($cell, 'tbody')),
                tbcache = c.cache[tbodyIndex],
                $row = ts.getClosest($cell, 'tr');
            cell = $cell[0];
            if ($tbodies.length && tbodyIndex >= 0) {
                row = $tbodies.eq(tbodyIndex).find('tr').not('.' + c.cssChildRow).index($row);
                cache = tbcache.normalized[row];
                len = $row[0].cells.length;
                if (len !== c.columns) {
                    icell = 0;
                    tmp = false;
                    for (indx = 0; indx < len; indx++)
                        if (!tmp && $row[0].cells[indx] !== cell) icell += $row[0].cells[indx].colSpan;
                        else tmp = true;
                } else icell = $cell.index();
                tmp = ts.getElementText(c, cell, icell);
                cache[c.columns].raw[icell] = tmp;
                tmp = ts.getParsedText(c, cell, icell, tmp);
                cache[icell] = tmp;
                if ((c.parsers[icell].type || '').toLowerCase() === 'numeric') tbcache.colMax[icell] = Math.max(Math.abs(tmp) || 0, tbcache.colMax[icell] || 0);
                tmp = resort !== 'undefined' ? resort : c.resort;
                if (tmp !== false) ts.checkResort(c, tmp, callback);
                else ts.resortComplete(c, callback);
            } else {
                if (ts.debug(c, 'core')) console.error('updateCell aborted, tbody missing or not within the indicated table');
                c.table.isUpdating = false;
            }
        },
        addRows: function(c, $row, resort, callback) {
            var txt, val, tbodyIndex, rowIndex, rows, cellIndex, len, order, cacheIndex, rowData, cells, cell, span, valid = typeof $row === 'string' && c.$tbodies.length === 1 && /<tr/.test($row || ''),
                table = c.table;
            if (valid) {
                $row = $($row);
                c.$tbodies.append($row);
            } else {
                if (!$row || !($row instanceof $) || (ts.getClosest($row, 'table')[0] !== c.table)) {
                    if (ts.debug(c, 'core')) console.error('addRows method requires (1) a jQuery selector reference to rows that have already ' + 'been added to the table, or (2) row HTML string to be added to a table with only one tbody');
                    return false;
                }
            }
            table.isUpdating = true;
            if (ts.isEmptyObject(c.cache)) {
                ts.updateHeader(c);
                ts.commonUpdate(c, resort, callback);
            } else {
                rows = $row.filter('tr').attr('role', 'row').length;
                tbodyIndex = c.$tbodies.index($row.parents('tbody').filter(':first'));
                if (!(c.parsers && c.parsers.length)) ts.setupParsers(c);
                for (rowIndex = 0; rowIndex < rows; rowIndex++) {
                    cacheIndex = 0;
                    len = $row[rowIndex].cells.length;
                    order = c.cache[tbodyIndex].normalized.length;
                    cells = [];
                    rowData = {
                        child: [],
                        raw: [],
                        $row: $row.eq(rowIndex),
                        order
                    };
                    for (cellIndex = 0; cellIndex < len; cellIndex++) {
                        cell = $row[rowIndex].cells[cellIndex];
                        txt = ts.getElementText(c, cell, cacheIndex);
                        rowData.raw[cacheIndex] = txt;
                        val = ts.getParsedText(c, cell, cacheIndex, txt);
                        cells[cacheIndex] = val;
                        if ((c.parsers[cacheIndex].type || '').toLowerCase() === 'numeric') c.cache[tbodyIndex].colMax[cacheIndex] = Math.max(Math.abs(val) || 0, c.cache[tbodyIndex].colMax[cacheIndex] || 0);
                        span = cell.colSpan - 1;
                        if (span > 0) cacheIndex += span;
                        cacheIndex++;
                    }
                    cells[c.columns] = rowData;
                    c.cache[tbodyIndex].normalized[order] = cells;
                }
                ts.checkResort(c, resort, callback);
            }
        },
        updateCache: function(c, callback, $tbodies) {
            if (!(c.parsers && c.parsers.length)) ts.setupParsers(c, $tbodies);
            ts.buildCache(c, callback, $tbodies);
        },
        appendCache: function(c, init) {
            var parsed, totalRows, $tbody, $curTbody, rowIndex, tbodyIndex, appendTime, table = c.table,
                $tbodies = c.$tbodies,
                rows = [],
                cache = c.cache;
            if (ts.isEmptyObject(cache)) return c.appender ? c.appender(table, rows) : table.isUpdating ? c.$table.triggerHandler('updateComplete', table) : '';
            if (ts.debug(c, 'core')) appendTime = new Date();
            for (tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++) {
                $tbody = $tbodies.eq(tbodyIndex);
                if ($tbody.length) {
                    $curTbody = ts.processTbody(table, $tbody, true);
                    parsed = cache[tbodyIndex].normalized;
                    totalRows = parsed.length;
                    for (rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                        rows[rows.length] = parsed[rowIndex][c.columns].$row;
                        if (!c.appender || (c.pager && !c.pager.removeRows && !c.pager.ajax)) $curTbody.append(parsed[rowIndex][c.columns].$row);
                    }
                    ts.processTbody(table, $curTbody, false);
                }
            }
            if (c.appender) c.appender(table, rows);
            if (ts.debug(c, 'core')) console.log('Rebuilt table' + ts.benchmark(appendTime));
            if (!init && !c.appender) ts.applyWidget(table);
            if (table.isUpdating) c.$table.triggerHandler('updateComplete', table);
        },
        commonUpdate: function(c, resort, callback) {
            c.$table.find(c.selectorRemove).remove();
            ts.setupParsers(c);
            ts.buildCache(c);
            ts.checkResort(c, resort, callback);
        },
        initSort: function(c, cell, event) {
            if (c.table.isUpdating) return setTimeout(function() {
                ts.initSort(c, cell, event);
            }, 50);
            var arry, indx, headerIndx, dir, temp, tmp, $header, notMultiSort = !event[c.sortMultiSortKey],
                table = c.table,
                len = c.$headers.length,
                th = ts.getClosest($(cell), 'th, td'),
                col = parseInt(th.attr('data-column'), 10),
                sortedBy = event.type === 'mouseup' ? 'user' : event.type,
                order = c.sortVars[col].order;
            th = th[0];
            c.$table.triggerHandler('sortStart', table);
            tmp = (c.sortVars[col].count + 1) % order.length;
            c.sortVars[col].count = event[c.sortResetKey] ? 2 : tmp;
            if (c.sortRestart)
                for (headerIndx = 0; headerIndx < len; headerIndx++) {
                    $header = c.$headers.eq(headerIndx);
                    tmp = parseInt($header.attr('data-column'), 10);
                    if (col !== tmp && (notMultiSort || $header.hasClass(ts.css.sortNone))) c.sortVars[tmp].count = -1;
                }
            if (notMultiSort) {
                $.each(c.sortVars, function(i) {
                    c.sortVars[i].sortedBy = '';
                });
                c.sortList = [];
                c.last.sortList = [];
                if (c.sortForce !== null) {
                    arry = c.sortForce;
                    for (indx = 0; indx < arry.length; indx++)
                        if (arry[indx][0] !== col) {
                            c.sortList[c.sortList.length] = arry[indx];
                            c.sortVars[arry[indx][0]].sortedBy = 'sortForce';
                        }
                }
                dir = order[c.sortVars[col].count];
                if (dir < 2) {
                    c.sortList[c.sortList.length] = [col, dir];
                    c.sortVars[col].sortedBy = sortedBy;
                    if (th.colSpan > 1)
                        for (indx = 1; indx < th.colSpan; indx++) {
                            c.sortList[c.sortList.length] = [col + indx, dir];
                            c.sortVars[col + indx].count = $.inArray(dir, order);
                            c.sortVars[col + indx].sortedBy = sortedBy;
                        }
                }
            } else {
                c.sortList = $.extend([], c.last.sortList);
                if (ts.isValueInArray(col, c.sortList) >= 0) {
                    c.sortVars[col].sortedBy = sortedBy;
                    for (indx = 0; indx < c.sortList.length; indx++) {
                        tmp = c.sortList[indx];
                        if (tmp[0] === col) {
                            tmp[1] = order[c.sortVars[col].count];
                            if (tmp[1] === 2) {
                                c.sortList.splice(indx, 1);
                                c.sortVars[col].count = -1;
                            }
                        }
                    }
                } else {
                    dir = order[c.sortVars[col].count];
                    c.sortVars[col].sortedBy = sortedBy;
                    if (dir < 2) {
                        c.sortList[c.sortList.length] = [col, dir];
                        if (th.colSpan > 1)
                            for (indx = 1; indx < th.colSpan; indx++) {
                                c.sortList[c.sortList.length] = [col + indx, dir];
                                c.sortVars[col + indx].count = $.inArray(dir, order);
                                c.sortVars[col + indx].sortedBy = sortedBy;
                            }
                    }
                }
            }
            c.last.sortList = $.extend([], c.sortList);
            if (c.sortList.length && c.sortAppend) {
                arry = $.isArray(c.sortAppend) ? c.sortAppend : c.sortAppend[c.sortList[0][0]];
                if (!ts.isEmptyObject(arry))
                    for (indx = 0; indx < arry.length; indx++)
                        if (arry[indx][0] !== col && ts.isValueInArray(arry[indx][0], c.sortList) < 0) {
                            dir = arry[indx][1];
                            temp = ('' + dir).match(/^(a|d|s|o|n)/);
                            if (temp) {
                                tmp = c.sortList[0][1];
                                switch (temp[0]) {
                                    case 'd':
                                        dir = 1;
                                        break;
                                    case 's':
                                        dir = tmp;
                                        break;
                                    case 'o':
                                        dir = tmp === 0 ? 1 : 0;
                                        break;
                                    case 'n':
                                        dir = (tmp + 1) % order.length;
                                        break;
                                    default:
                                        dir = 0;
                                        break;
                                }
                            }
                            c.sortList[c.sortList.length] = [arry[indx][0], dir];
                            c.sortVars[arry[indx][0]].sortedBy = 'sortAppend';
                        }
            }
            c.$table.triggerHandler('sortBegin', table);
            setTimeout(function() {
                ts.setHeadersCss(c);
                ts.multisort(c);
                ts.appendCache(c);
                c.$table.triggerHandler('sortBeforeEnd', table);
                c.$table.triggerHandler('sortEnd', table);
            }, 1);
        },
        multisort: function(c) {
            var tbodyIndex, sortTime, colMax, rows, tmp, table = c.table,
                sorter = [],
                dir = 0,
                textSorter = c.textSorter || '',
                sortList = c.sortList,
                sortLen = sortList.length,
                len = c.$tbodies.length;
            if (c.serverSideSorting || ts.isEmptyObject(c.cache)) return;
            if (ts.debug(c, 'core')) sortTime = new Date();
            if (typeof textSorter === 'object') {
                colMax = c.columns;
                while (colMax--) {
                    tmp = ts.getColumnData(table, textSorter, colMax);
                    if (typeof tmp === 'function') sorter[colMax] = tmp;
                }
            }
            for (tbodyIndex = 0; tbodyIndex < len; tbodyIndex++) {
                colMax = c.cache[tbodyIndex].colMax;
                rows = c.cache[tbodyIndex].normalized;
                rows.sort(function(a, b) {
                    var sortIndex, num, col, order, sort, x, y;
                    for (sortIndex = 0; sortIndex < sortLen; sortIndex++) {
                        col = sortList[sortIndex][0];
                        order = sortList[sortIndex][1];
                        dir = order === 0;
                        if (c.sortStable && a[col] === b[col] && sortLen === 1) return a[c.columns].order - b[c.columns].order;
                        num = /n/i.test(ts.getSortType(c.parsers, col));
                        if (num && c.strings[col]) {
                            if (typeof(ts.string[c.strings[col]]) === 'boolean') num = (dir ? 1 : -1) * (ts.string[c.strings[col]] ? -1 : 1);
                            else num = (c.strings[col]) ? ts.string[c.strings[col]] || 0 : 0;
                            sort = c.numberSorter ? c.numberSorter(a[col], b[col], dir, colMax[col], table) : ts['sortNumeric' + (dir ? 'Asc' : 'Desc')](a[col], b[col], num, colMax[col], col, c);
                        } else {
                            x = dir ? a : b;
                            y = dir ? b : a;
                            if (typeof textSorter === 'function') sort = textSorter(x[col], y[col], dir, col, table);
                            else if (typeof sorter[col] === 'function') sort = sorter[col](x[col], y[col], dir, col, table);
                            else sort = ts['sortNatural' + (dir ? 'Asc' : 'Desc')](a[col] || '', b[col] || '', col, c);
                        }
                        if (sort) return sort;
                    }
                    return a[c.columns].order - b[c.columns].order;
                });
            }
            if (ts.debug(c, 'core')) console.log('Applying sort ' + sortList.toString() + ts.benchmark(sortTime));
        },
        resortComplete: function(c, callback) {
            if (c.table.isUpdating) c.$table.triggerHandler('updateComplete', c.table);
            if ($.isFunction(callback)) callback(c.table);
        },
        checkResort: function(c, resort, callback) {
            var sortList = $.isArray(resort) ? resort : c.sortList,
                resrt = typeof resort === 'undefined' ? c.resort : resort;
            if (resrt !== false && !c.serverSideSorting && !c.table.isProcessing)
                if (sortList.length) ts.sortOn(c, sortList, function() {
                    ts.resortComplete(c, callback);
                }, true);
                else ts.sortReset(c, function() {
                    ts.resortComplete(c, callback);
                    ts.applyWidget(c.table, false);
                });
            else {
                ts.resortComplete(c, callback);
                ts.applyWidget(c.table, false);
            }
        },
        sortOn: function(c, list, callback, init) {
            var indx, table = c.table;
            c.$table.triggerHandler('sortStart', table);
            for (indx = 0; indx < c.columns; indx++) c.sortVars[indx].sortedBy = ts.isValueInArray(indx, list) > -1 ? 'sorton' : '';
            ts.updateHeaderSortCount(c, list);
            ts.setHeadersCss(c);
            if (c.delayInit && ts.isEmptyObject(c.cache)) ts.buildCache(c);
            c.$table.triggerHandler('sortBegin', table);
            ts.multisort(c);
            ts.appendCache(c, init);
            c.$table.triggerHandler('sortBeforeEnd', table);
            c.$table.triggerHandler('sortEnd', table);
            ts.applyWidget(table);
            if ($.isFunction(callback)) callback(table);
        },
        sortReset: function(c, callback) {
            c.sortList = [];
            var indx;
            for (indx = 0; indx < c.columns; indx++) {
                c.sortVars[indx].count = -1;
                c.sortVars[indx].sortedBy = '';
            }
            ts.setHeadersCss(c);
            ts.multisort(c);
            ts.appendCache(c);
            if ($.isFunction(callback)) callback(c.table);
        },
        getSortType: function(parsers, column) {
            return (parsers && parsers[column]) ? parsers[column].type || '' : '';
        },
        getOrder: function(val) {
            return (/^d/i.test(val) || val === 1);
        },
        sortNatural: function(a, b) {
            if (a === b) return 0;
            a = (a || '').toString();
            b = (b || '').toString();
            var aNum, bNum, aFloat, bFloat, indx, max, regex = ts.regex;
            if (regex.hex.test(b)) {
                aNum = parseInt(a.match(regex.hex), 16);
                bNum = parseInt(b.match(regex.hex), 16);
                if (aNum < bNum) return -1;
                if (aNum > bNum) return 1;
            }
            aNum = a.replace(regex.chunk, '\\0$1\\0').replace(regex.chunks, '').split('\\0');
            bNum = b.replace(regex.chunk, '\\0$1\\0').replace(regex.chunks, '').split('\\0');
            max = Math.max(aNum.length, bNum.length);
            for (indx = 0; indx < max; indx++) {
                aFloat = isNaN(aNum[indx]) ? aNum[indx] || 0 : parseFloat(aNum[indx]) || 0;
                bFloat = isNaN(bNum[indx]) ? bNum[indx] || 0 : parseFloat(bNum[indx]) || 0;
                if (isNaN(aFloat) !== isNaN(bFloat)) return isNaN(aFloat) ? 1 : -1;
                if (typeof aFloat !== typeof bFloat) {
                    aFloat += '';
                    bFloat += '';
                }
                if (aFloat < bFloat) return -1;
                if (aFloat > bFloat) return 1;
            }
            return 0;
        },
        sortNaturalAsc: function(a, b, col, c) {
            if (a === b) return 0;
            var empty = ts.string[(c.empties[col] || c.emptyTo)];
            if (a === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? -1 : 1) : -empty || -1;
            if (b === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? 1 : -1) : empty || 1;
            return ts.sortNatural(a, b);
        },
        sortNaturalDesc: function(a, b, col, c) {
            if (a === b) return 0;
            var empty = ts.string[(c.empties[col] || c.emptyTo)];
            if (a === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? -1 : 1) : empty || 1;
            if (b === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? 1 : -1) : -empty || -1;
            return ts.sortNatural(b, a);
        },
        sortText: function(a, b) {
            return a > b ? 1 : (a < b ? -1 : 0);
        },
        getTextValue: function(val, num, max) {
            if (max) {
                var indx, len = val ? val.length : 0,
                    n = max + num;
                for (indx = 0; indx < len; indx++) n += val.charCodeAt(indx);
                return num * n;
            }
            return 0;
        },
        sortNumericAsc: function(a, b, num, max, col, c) {
            if (a === b) return 0;
            var empty = ts.string[(c.empties[col] || c.emptyTo)];
            if (a === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? -1 : 1) : -empty || -1;
            if (b === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? 1 : -1) : empty || 1;
            if (isNaN(a)) a = ts.getTextValue(a, num, max);
            if (isNaN(b)) b = ts.getTextValue(b, num, max);
            return a - b;
        },
        sortNumericDesc: function(a, b, num, max, col, c) {
            if (a === b) return 0;
            var empty = ts.string[(c.empties[col] || c.emptyTo)];
            if (a === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? -1 : 1) : empty || 1;
            if (b === '' && empty !== 0) return typeof empty === 'boolean' ? (empty ? 1 : -1) : -empty || -1;
            if (isNaN(a)) a = ts.getTextValue(a, num, max);
            if (isNaN(b)) b = ts.getTextValue(b, num, max);
            return b - a;
        },
        sortNumeric: function(a, b) {
            return a - b;
        },
        addWidget: function(widget) {
            if (widget.id && !ts.isEmptyObject(ts.getWidgetById(widget.id))) console.warn('"' + widget.id + '" widget was loaded more than once!');
            ts.widgets[ts.widgets.length] = widget;
        },
        hasWidget: function($table, name) {
            $table = $($table);
            return $table.length && $table[0].config && $table[0].config.widgetInit[name] || false;
        },
        getWidgetById: function(name) {
            var indx, widget, len = ts.widgets.length;
            for (indx = 0; indx < len; indx++) {
                widget = ts.widgets[indx];
                if (widget && widget.id && widget.id.toLowerCase() === name.toLowerCase()) return widget;
            }
        },
        applyWidgetOptions: function(table) {
            var indx, widget, wo, c = table.config,
                len = c.widgets.length;
            if (len)
                for (indx = 0; indx < len; indx++) {
                    widget = ts.getWidgetById(c.widgets[indx]);
                    if (widget && widget.options) {
                        wo = $.extend(true, {}, widget.options);
                        c.widgetOptions = $.extend(true, wo, c.widgetOptions);
                        $.extend(true, ts.defaults.widgetOptions, widget.options);
                    }
                }
        },
        addWidgetFromClass: function(table) {
            var len, indx, c = table.config,
                regex = '^' + c.widgetClass.replace(ts.regex.templateName, '(\\S+)+') + '$',
                widgetClass = new RegExp(regex, 'g'),
                widgets = (table.className || '').split(ts.regex.spaces);
            if (widgets.length) {
                len = widgets.length;
                for (indx = 0; indx < len; indx++)
                    if (widgets[indx].match(widgetClass)) c.widgets[c.widgets.length] = widgets[indx].replace(widgetClass, '$1');
            }
        },
        applyWidgetId: function(table, id, init) {
            table = $(table)[0];
            var applied, time, name, c = table.config,
                wo = c.widgetOptions,
                debug = ts.debug(c, 'core'),
                widget = ts.getWidgetById(id);
            if (widget) {
                name = widget.id;
                applied = false;
                if ($.inArray(name, c.widgets) < 0) c.widgets[c.widgets.length] = name;
                if (debug) time = new Date();
                if (init || !(c.widgetInit[name])) {
                    c.widgetInit[name] = true;
                    if (table.hasInitialized) ts.applyWidgetOptions(table);
                    if (typeof widget.init === 'function') {
                        applied = true;
                        if (debug) console[console.group ? 'group' : 'log']('Initializing ' + name + ' widget');
                        widget.init(table, widget, c, wo);
                    }
                }
                if (!init && typeof widget.format === 'function') {
                    applied = true;
                    if (debug) console[console.group ? 'group' : 'log']('Updating ' + name + ' widget');
                    widget.format(table, c, wo, false);
                }
                if (debug)
                    if (applied) {
                        console.log('Completed ' + (init ? 'initializing ' : 'applying ') + name + ' widget' + ts.benchmark(time));
                        if (console.groupEnd) console.groupEnd();
                    }
            }
        },
        applyWidget: function(table, init, callback) {
            table = $(table)[0];
            var indx, len, names, widget, time, c = table.config,
                debug = ts.debug(c, 'core'),
                widgets = [];
            if (init !== false && table.hasInitialized && (table.isApplyingWidgets || table.isUpdating)) return;
            if (debug) time = new Date();
            ts.addWidgetFromClass(table);
            clearTimeout(c.timerReady);
            if (c.widgets.length) {
                table.isApplyingWidgets = true;
                c.widgets = $.grep(c.widgets, function(val, index) {
                    return $.inArray(val, c.widgets) === index;
                });
                names = c.widgets || [];
                len = names.length;
                for (indx = 0; indx < len; indx++) {
                    widget = ts.getWidgetById(names[indx]);
                    if (widget && widget.id) {
                        if (!widget.priority) widget.priority = 10;
                        widgets[indx] = widget;
                    } else {
                        if (debug) console.warn('"' + names[indx] + '" was enabled, but the widget code has not been loaded!');
                    }
                }
                widgets.sort(function(a, b) {
                    return a.priority < b.priority ? -1 : a.priority === b.priority ? 0 : 1;
                });
                len = widgets.length;
                if (debug) console[console.group ? 'group' : 'log']('Start ' + (init ? 'initializing' : 'applying') + ' widgets');
                for (indx = 0; indx < len; indx++) {
                    widget = widgets[indx];
                    if (widget && widget.id) ts.applyWidgetId(table, widget.id, init);
                }
                if (debug && console.groupEnd) console.groupEnd();
            }
            c.timerReady = setTimeout(function() {
                table.isApplyingWidgets = false;
                $.data(table, 'lastWidgetApplication', new Date());
                c.$table.triggerHandler('tablesorter-ready');
                if (!init && typeof callback === 'function') callback(table);
                if (debug) {
                    widget = c.widgets.length;
                    console.log('Completed ' + (init === true ? 'initializing ' : 'applying ') + widget + ' widget' + (widget !== 1 ? 's' : '') + ts.benchmark(time));
                }
            }, 10);
        },
        removeWidget: function(table, name, refreshing) {
            table = $(table)[0];
            var index, widget, indx, len, c = table.config;
            if (name === true) {
                name = [];
                len = ts.widgets.length;
                for (indx = 0; indx < len; indx++) {
                    widget = ts.widgets[indx];
                    if (widget && widget.id) name[name.length] = widget.id;
                }
            } else name = ($.isArray(name) ? name.join(',') : name || '').toLowerCase().split(/[\s,]+/);
            len = name.length;
            for (index = 0; index < len; index++) {
                widget = ts.getWidgetById(name[index]);
                indx = $.inArray(name[index], c.widgets);
                if (indx >= 0 && refreshing !== true) c.widgets.splice(indx, 1);
                if (widget && widget.remove) {
                    if (ts.debug(c, 'core')) console.log((refreshing ? 'Refreshing' : 'Removing') + ' "' + name[index] + '" widget');
                    widget.remove(table, c, c.widgetOptions, refreshing);
                    c.widgetInit[name[index]] = false;
                }
            }
            c.$table.triggerHandler('widgetRemoveEnd', table);
        },
        refreshWidgets: function(table, doAll, dontapply) {
            table = $(table)[0];
            var indx, widget, c = table.config,
                curWidgets = c.widgets,
                widgets = ts.widgets,
                len = widgets.length,
                list = [],
                callback = function(table) {
                    $(table).triggerHandler('refreshComplete');
                };
            for (indx = 0; indx < len; indx++) {
                widget = widgets[indx];
                if (widget && widget.id && (doAll || $.inArray(widget.id, curWidgets) < 0)) list[list.length] = widget.id;
            }
            ts.removeWidget(table, list.join(','), true);
            if (dontapply !== true) {
                ts.applyWidget(table, doAll || false, callback);
                if (doAll) ts.applyWidget(table, false, callback);
            } else callback(table);
        },
        benchmark: function(diff) {
            return (' (' + (new Date().getTime() - diff.getTime()) + ' ms)');
        },
        log: function() {
            console.log(arguments);
        },
        debug: function(c, name) {
            return c && (c.debug === true || typeof c.debug === 'string' && c.debug.indexOf(name) > -1);
        },
        isEmptyObject: function(obj) {
            for (var name in obj) return false;
            return true;
        },
        isValueInArray: function(column, arry) {
            var indx, len = arry && arry.length || 0;
            for (indx = 0; indx < len; indx++)
                if (arry[indx][0] === column) return indx;
            return -1;
        },
        formatFloat: function(str, table) {
            if (typeof str !== 'string' || str === '') return str;
            var num, usFormat = table && table.config ? table.config.usNumberFormat !== false : typeof table !== 'undefined' ? table : true;
            if (usFormat) str = str.replace(ts.regex.comma, '');
            else str = str.replace(ts.regex.digitNonUS, '').replace(ts.regex.comma, '.');
            if (ts.regex.digitNegativeTest.test(str)) str = str.replace(ts.regex.digitNegativeReplace, '-$1');
            num = parseFloat(str);
            return isNaN(num) ? $.trim(str) : num;
        },
        isDigit: function(str) {
            return isNaN(str) ? ts.regex.digitTest.test(str.toString().replace(ts.regex.digitReplace, '')) : str !== '';
        },
        computeColumnIndex: function($rows, c) {
            var i, j, k, l, cell, cells, rowIndex, rowSpan, colSpan, firstAvailCol, columns = c && c.columns || 0,
                matrix = [],
                matrixrow = new Array(columns);
            for (i = 0; i < $rows.length; i++) {
                cells = $rows[i].cells;
                for (j = 0; j < cells.length; j++) {
                    cell = cells[j];
                    rowIndex = i;
                    rowSpan = cell.rowSpan || 1;
                    colSpan = cell.colSpan || 1;
                    if (typeof matrix[rowIndex] === 'undefined') matrix[rowIndex] = [];
                    for (k = 0; k < matrix[rowIndex].length + 1; k++)
                        if (typeof matrix[rowIndex][k] === 'undefined') {
                            firstAvailCol = k;
                            break;
                        }
                    if (columns && cell.cellIndex === firstAvailCol) {} else if (cell.setAttribute) cell.setAttribute('data-column', firstAvailCol);
                    else $(cell).attr('data-column', firstAvailCol);
                    for (k = rowIndex; k < rowIndex + rowSpan; k++) {
                        if (typeof matrix[k] === 'undefined') matrix[k] = [];
                        matrixrow = matrix[k];
                        for (l = firstAvailCol; l < firstAvailCol + colSpan; l++) matrixrow[l] = 'x';
                    }
                }
            }
            ts.checkColumnCount($rows, matrix, matrixrow.length);
            return matrixrow.length;
        },
        checkColumnCount: function($rows, matrix, columns) {
            var i, len, valid = true,
                cells = [];
            for (i = 0; i < matrix.length; i++)
                if (matrix[i]) {
                    len = matrix[i].length;
                    if (matrix[i].length !== columns) {
                        valid = false;
                        break;
                    }
                }
            if (!valid) {
                $rows.each(function(indx, el) {
                    var cell = el.parentElement.nodeName;
                    if (cells.indexOf(cell) < 0) cells.push(cell);
                });
                console.error('Invalid or incorrect number of columns in the ' + cells.join(' or ') + '; expected ' + columns + ', but found ' + len + ' columns');
            }
        },
        fixColumnWidth: function(table) {
            table = $(table)[0];
            var overallWidth, percent, $tbodies, len, index, c = table.config,
                $colgroup = c.$table.children('colgroup');
            if ($colgroup.length && $colgroup.hasClass(ts.css.colgroup)) $colgroup.remove();
            if (c.widthFixed && c.$table.children('colgroup').length === 0) {
                $colgroup = $('<colgroup class="' + ts.css.colgroup + '">');
                overallWidth = c.$table.width();
                $tbodies = c.$tbodies.find('tr:first').children(':visible');
                len = $tbodies.length;
                for (index = 0; index < len; index++) {
                    percent = parseInt(($tbodies.eq(index).width() / overallWidth) * 1000, 10) / 10 + '%';
                    $colgroup.append($('<col>').css('width', percent));
                }
                c.$table.prepend($colgroup);
            }
        },
        getData: function(header, configHeader, key) {
            var meta, cl4ss, val = '',
                $header = $(header);
            if (!$header.length) return '';
            meta = $.metadata ? $header.metadata() : false;
            cl4ss = ' ' + ($header.attr('class') || '');
            if (typeof $header.data(key) !== 'undefined' || typeof $header.data(key.toLowerCase()) !== 'undefined') val += $header.data(key) || $header.data(key.toLowerCase());
            else if (meta && typeof meta[key] !== 'undefined') val += meta[key];
            else if (configHeader && typeof configHeader[key] !== 'undefined') val += configHeader[key];
            else {
                if (cl4ss !== ' ' && cl4ss.match(' ' + key + '-')) val = cl4ss.match(new RegExp('\\s' + key + '-([\\w-]+)'))[1] || '';
            }
            return $.trim(val);
        },
        getColumnData: function(table, obj, indx, getCell, $headers) {
            if (typeof obj !== 'object' || obj === null) return obj;
            table = $(table)[0];
            var $header, key, c = table.config,
                $cells = ($headers || c.$headers),
                $cell = c.$headerIndexed && c.$headerIndexed[indx] || $cells.find('[data-column="' + indx + '"]:last');
            if (typeof obj[indx] !== 'undefined') return getCell ? obj[indx] : obj[$cells.index($cell)];
            for (key in obj)
                if (typeof key === 'string') {
                    $header = $cell.filter(key).add($cell.find(key));
                    if ($header.length) return obj[key];
                }
            return;
        },
        isProcessing: function($table, toggle, $headers) {
            $table = $($table);
            var c = $table[0].config,
                $header = $headers || $table.find('.' + ts.css.header);
            if (toggle) {
                if (typeof $headers !== 'undefined' && c.sortList.length > 0) $header = $header.filter(function() {
                    return this.sortDisabled ? false : ts.isValueInArray(parseFloat($(this).attr('data-column')), c.sortList) >= 0;
                });
                $table.add($header).addClass(ts.css.processing + ' ' + c.cssProcessing);
            } else $table.add($header).removeClass(ts.css.processing + ' ' + c.cssProcessing);
        },
        processTbody: function(table, $tb, getIt) {
            table = $(table)[0];
            if (getIt) {
                table.isProcessing = true;
                $tb.before('<colgroup class="tablesorter-savemyplace"/>');
                return $.fn.detach ? $tb.detach() : $tb.remove();
            }
            var holdr = $(table).find('colgroup.tablesorter-savemyplace');
            $tb.insertAfter(holdr);
            holdr.remove();
            table.isProcessing = false;
        },
        clearTableBody: function(table) {
            $(table)[0].config.$tbodies.children().detach();
        },
        characterEquivalents: {
            'a': '\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5',
            'A': '\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5',
            'c': '\u00e7\u0107\u010d',
            'C': '\u00c7\u0106\u010c',
            'e': '\u00e9\u00e8\u00ea\u00eb\u011b\u0119',
            'E': '\u00c9\u00c8\u00ca\u00cb\u011a\u0118',
            'i': '\u00ed\u00ec\u0130\u00ee\u00ef\u0131',
            'I': '\u00cd\u00cc\u0130\u00ce\u00cf',
            'o': '\u00f3\u00f2\u00f4\u00f5\u00f6\u014d',
            'O': '\u00d3\u00d2\u00d4\u00d5\u00d6\u014c',
            'ss': '\u00df',
            'SS': '\u1e9e',
            'u': '\u00fa\u00f9\u00fb\u00fc\u016f',
            'U': '\u00da\u00d9\u00db\u00dc\u016e'
        },
        replaceAccents: function(str) {
            var chr, acc = '[',
                eq = ts.characterEquivalents;
            if (!ts.characterRegex) {
                ts.characterRegexArray = {};
                for (chr in eq)
                    if (typeof chr === 'string') {
                        acc += eq[chr];
                        ts.characterRegexArray[chr] = new RegExp('[' + eq[chr] + ']', 'g');
                    }
                ts.characterRegex = new RegExp(acc + ']');
            }
            if (ts.characterRegex.test(str))
                for (chr in eq)
                    if (typeof chr === 'string') str = str.replace(ts.characterRegexArray[chr], chr);
            return str;
        },
        validateOptions: function(c) {
            var setting, setting2, typ, timer, ignore = 'headers sortForce sortList sortAppend widgets'.split(' '),
                orig = c.originalSettings;
            if (orig) {
                if (ts.debug(c, 'core')) timer = new Date();
                for (setting in orig) {
                    typ = typeof ts.defaults[setting];
                    if (typ === 'undefined') console.warn('Tablesorter Warning! "table.config.' + setting + '" option not recognized');
                    else {
                        if (typ === 'object')
                            for (setting2 in orig[setting]) {
                                typ = ts.defaults[setting] && typeof ts.defaults[setting][setting2];
                                if ($.inArray(setting, ignore) < 0 && typ === 'undefined') console.warn('Tablesorter Warning! "table.config.' + setting + '.' + setting2 + '" option not recognized');
                            }
                    }
                }
                if (ts.debug(c, 'core')) console.log('validate options time:' + ts.benchmark(timer));
            }
        },
        restoreHeaders: function(table) {
            var index, $cell, c = $(table)[0].config,
                $headers = c.$table.find(c.selectorHeaders),
                len = $headers.length;
            for (index = 0; index < len; index++) {
                $cell = $headers.eq(index);
                if ($cell.find('.' + ts.css.headerIn).length) $cell.html(c.headerContent[index]);
            }
        },
        destroy: function(table, removeClasses, callback) {
            table = $(table)[0];
            if (!table.hasInitialized) return;
            ts.removeWidget(table, true, false);
            var events, $t = $(table),
                c = table.config,
                $h = $t.find('thead:first'),
                $r = $h.find('tr.' + ts.css.headerRow).removeClass(ts.css.headerRow + ' ' + c.cssHeaderRow),
                $f = $t.find('tfoot:first > tr').children('th, td');
            if (removeClasses === false && $.inArray('uitheme', c.widgets) >= 0) {
                $t.triggerHandler('applyWidgetId', ['uitheme']);
                $t.triggerHandler('applyWidgetId', ['zebra']);
            }
            $h.find('tr').not($r).remove();
            events = 'sortReset update updateRows updateAll updateHeaders updateCell addRows updateComplete sorton ' + 'appendCache updateCache applyWidgetId applyWidgets refreshWidgets removeWidget destroy mouseup mouseleave ' + 'keypress sortBegin sortEnd resetToLoadState '.split(' ').join(c.namespace + ' ');
            $t.removeData('tablesorter').unbind(events.replace(ts.regex.spaces, ' '));
            c.$headers.add($f).removeClass([ts.css.header, c.cssHeader, c.cssAsc, c.cssDesc, ts.css.sortAsc, ts.css.sortDesc, ts.css.sortNone].join(' ')).removeAttr('data-column').removeAttr('aria-label').attr('aria-disabled', 'true');
            $r.find(c.selectorSort).unbind(('mousedown mouseup keypress '.split(' ').join(c.namespace + ' ')).replace(ts.regex.spaces, ' '));
            ts.restoreHeaders(table);
            $t.toggleClass(ts.css.table + ' ' + c.tableClass + ' tablesorter-' + c.theme, removeClasses === false);
            $t.removeClass(c.namespace.slice(1));
            table.hasInitialized = false;
            delete table.config.cache;
            if (typeof callback === 'function') callback(table);
            if (ts.debug(c, 'core')) console.log('tablesorter has been removed');
        }
    };
    $.fn.tablesorter = function(settings) {
        return this.each(function() {
            var table = this,
                c = $.extend(true, {}, ts.defaults, settings, ts.instanceMethods);
            c.originalSettings = settings;
            if (!table.hasInitialized && ts.buildTable && this.nodeName !== 'TABLE') ts.buildTable(table, c);
            else ts.setup(table, c);
        });
    };
    if (!(window.console && window.console.log)) {
        ts.logs = [];
        console = {};
        console.log = console.warn = console.error = console.table = function() {
            var arg = arguments.length > 1 ? arguments : arguments[0];
            ts.logs[ts.logs.length] = {
                date: Date.now(),
                log: arg
            };
        };
    }
    ts.addParser({
        id: 'no-parser',
        is: function() {
            return false;
        },
        format: function() {
            return '';
        },
        type: 'text'
    });
    ts.addParser({
        id: 'text',
        is: function() {
            return true;
        },
        format: function(str, table) {
            var c = table.config;
            if (str) {
                str = $.trim(c.ignoreCase ? str.toLocaleLowerCase() : str);
                str = c.sortLocaleCompare ? ts.replaceAccents(str) : str;
            }
            return str;
        },
        type: 'text'
    });
    ts.regex.nondigit = /[^\w,. \-()]/g;
    ts.addParser({
        id: 'digit',
        is: function(str) {
            return ts.isDigit(str);
        },
        format: function(str, table) {
            var num = ts.formatFloat((str || '').replace(ts.regex.nondigit, ''), table);
            return str && typeof num === 'number' ? num : str ? $.trim(str && table.config.ignoreCase ? str.toLocaleLowerCase() : str) : str;
        },
        type: 'numeric'
    });
    ts.regex.currencyReplace = /[+\-,. ]/g;
    ts.regex.currencyTest = /^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/;
    ts.addParser({
        id: 'currency',
        is: function(str) {
            str = (str || '').replace(ts.regex.currencyReplace, '');
            return ts.regex.currencyTest.test(str);
        },
        format: function(str, table) {
            var num = ts.formatFloat((str || '').replace(ts.regex.nondigit, ''), table);
            return str && typeof num === 'number' ? num : str ? $.trim(str && table.config.ignoreCase ? str.toLocaleLowerCase() : str) : str;
        },
        type: 'numeric'
    });
    ts.regex.urlProtocolTest = /^(https?|ftp|file):\/\//;
    ts.regex.urlProtocolReplace = /(https?|ftp|file):\/\/(www\.)?/;
    ts.addParser({
        id: 'url',
        is: function(str) {
            return ts.regex.urlProtocolTest.test(str);
        },
        format: function(str) {
            return str ? $.trim(str.replace(ts.regex.urlProtocolReplace, '')) : str;
        },
        type: 'text'
    });
    ts.regex.dash = /-/g;
    ts.regex.isoDate = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/;
    ts.addParser({
        id: 'isoDate',
        is: function(str) {
            return ts.regex.isoDate.test(str);
        },
        format: function(str) {
            var date = str ? new Date(str.replace(ts.regex.dash, '/')) : str;
            return date instanceof Date && isFinite(date) ? date.getTime() : str;
        },
        type: 'numeric'
    });
    ts.regex.percent = /%/g;
    ts.regex.percentTest = /(\d\s*?%|%\s*?\d)/;
    ts.addParser({
        id: 'percent',
        is: function(str) {
            return ts.regex.percentTest.test(str) && str.length < 15;
        },
        format: function(str, table) {
            return str ? ts.formatFloat(str.replace(ts.regex.percent, ''), table) : str;
        },
        type: 'numeric'
    });
    ts.addParser({
        id: 'image',
        is: function(str, table, node, $node) {
            return $node.find('img').length > 0;
        },
        format: function(str, table, cell) {
            return $(cell).find('img').attr(table.config.imgAttr || 'alt') || str;
        },
        parsed: true,
        type: 'text'
    });
    ts.regex.dateReplace = /(\S)([AP]M)$/i;
    ts.regex.usLongDateTest1 = /^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i;
    ts.regex.usLongDateTest2 = /^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i;
    ts.addParser({
        id: 'usLongDate',
        is: function(str) {
            return ts.regex.usLongDateTest1.test(str) || ts.regex.usLongDateTest2.test(str);
        },
        format: function(str) {
            var date = str ? new Date(str.replace(ts.regex.dateReplace, '$1 $2')) : str;
            return date instanceof Date && isFinite(date) ? date.getTime() : str;
        },
        type: 'numeric'
    });
    ts.regex.shortDateTest = /(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/;
    ts.regex.shortDateReplace = /[\-.,]/g;
    ts.regex.shortDateXXY = /(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/;
    ts.regex.shortDateYMD = /(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/;
    ts.convertFormat = function(dateString, format) {
        dateString = (dateString || '').replace(ts.regex.spaces, ' ').replace(ts.regex.shortDateReplace, '/');
        if (format === 'mmddyyyy') dateString = dateString.replace(ts.regex.shortDateXXY, '$3/$1/$2');
        else if (format === 'ddmmyyyy') dateString = dateString.replace(ts.regex.shortDateXXY, '$3/$2/$1');
        else {
            if (format === 'yyyymmdd') dateString = dateString.replace(ts.regex.shortDateYMD, '$1/$2/$3');
        }
        var date = new Date(dateString);
        return date instanceof Date && isFinite(date) ? date.getTime() : '';
    };
    ts.addParser({
        id: 'shortDate',
        is: function(str) {
            str = (str || '').replace(ts.regex.spaces, ' ').replace(ts.regex.shortDateReplace, '/');
            return ts.regex.shortDateTest.test(str);
        },
        format: function(str, table, cell, cellIndex) {
            if (str) {
                var c = table.config,
                    $header = c.$headerIndexed[cellIndex],
                    format = $header.length && $header.data('dateFormat') || ts.getData($header, ts.getColumnData(table, c.headers, cellIndex), 'dateFormat') || c.dateFormat;
                if ($header.length) $header.data('dateFormat', format);
                return ts.convertFormat(str, format) || str;
            }
            return str;
        },
        type: 'numeric'
    });
    ts.regex.timeTest = /^(0?[1-9]|1[0-2]):([0-5]\d)(\s[AP]M)$|^((?:[01]\d|[2][0-4]):[0-5]\d)$/i;
    ts.regex.timeMatch = /(0?[1-9]|1[0-2]):([0-5]\d)(\s[AP]M)|((?:[01]\d|[2][0-4]):[0-5]\d)/i;
    ts.addParser({
        id: 'time',
        is: function(str) {
            return ts.regex.timeTest.test(str);
        },
        format: function(str) {
            var temp, timePart = (str || '').match(ts.regex.timeMatch),
                orig = new Date(str),
                time = str && (timePart !== null ? timePart[0] : '00:00 AM'),
                date = time ? new Date('2000/01/01 ' + time.replace(ts.regex.dateReplace, '$1 $2')) : time;
            if (date instanceof Date && isFinite(date)) {
                temp = orig instanceof Date && isFinite(orig) ? orig.getTime() : 0;
                return temp ? parseFloat(date.getTime() + '.' + orig.getTime()) : date.getTime();
            }
            return str;
        },
        type: 'numeric'
    });
    ts.addParser({
        id: 'metadata',
        is: function() {
            return false;
        },
        format: function(str, table, cell) {
            var c = table.config,
                p = (!c.parserMetadataName) ? 'sortValue' : c.parserMetadataName;
            return $(cell).metadata()[p];
        },
        type: 'numeric'
    });
    ts.addWidget({
        id: 'zebra',
        priority: 90,
        format: function(table, c, wo) {
            var $visibleRows, $row, count, isEven, tbodyIndex, rowIndex, len, child = new RegExp(c.cssChildRow, 'i'),
                $tbodies = c.$tbodies.add($(c.namespace + '_extra_table').children('tbody:not(.' + c.cssInfoBlock + ')'));
            for (tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++) {
                count = 0;
                $visibleRows = $tbodies.eq(tbodyIndex).children('tr:visible').not(c.selectorRemove);
                len = $visibleRows.length;
                for (rowIndex = 0; rowIndex < len; rowIndex++) {
                    $row = $visibleRows.eq(rowIndex);
                    if (!child.test($row[0].className)) count++;
                    isEven = (count % 2 === 0);
                    $row.removeClass(wo.zebra[isEven ? 1 : 0]).addClass(wo.zebra[isEven ? 0 : 1]);
                }
            }
        },
        remove: function(table, c, wo, refreshing) {
            if (refreshing) return;
            var tbodyIndex, $tbody, $tbodies = c.$tbodies,
                toRemove = (wo.zebra || ['even', 'odd']).join(' ');
            for (tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++) {
                $tbody = ts.processTbody(table, $tbodies.eq(tbodyIndex), true);
                $tbody.children().removeClass(toRemove);
                ts.processTbody(table, $tbody, false);
            }
        }
    });
})(jQuery);;
! function(a) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = a();
    else if ("function" == typeof define && define.amd) define([], a);
    else {
        var b;
        b = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, b.enquire = a();
    }
}(function() {
    return function a(b, c, d) {
        function e(g, h) {
            if (!c[g]) {
                if (!b[g]) {
                    var i = "function" == typeof require && require;
                    if (!h && i) return i(g, !0);
                    if (f) return f(g, !0);
                    var j = new Error("Cannot find module '" + g + "'");
                    throw j.code = "MODULE_NOT_FOUND", j;
                }
                var k = c[g] = {
                    exports: {}
                };
                b[g][0].call(k.exports, function(a) {
                    var c = b[g][1][a];
                    return e(c ? c : a);
                }, k, k.exports, a, b, c, d);
            }
            return c[g].exports;
        }
        for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
        return e;
    }({
        1: [function(a, b, c) {
            function d(a, b) {
                this.query = a, this.isUnconditional = b, this.handlers = [], this.mql = window.matchMedia(a);
                var c = this;
                this.listener = function(a) {
                    c.mql = a.currentTarget || a, c.assess();
                }, this.mql.addListener(this.listener);
            }
            var e = a(3),
                f = a(4).each;
            d.prototype = {
                constuctor: d,
                addHandler: function(a) {
                    var b = new e(a);
                    this.handlers.push(b), this.matches() && b.on();
                },
                removeHandler: function(a) {
                    var b = this.handlers;
                    f(b, function(c, d) {
                        if (c.equals(a)) return c.destroy(), !b.splice(d, 1);
                    });
                },
                matches: function() {
                    return this.mql.matches || this.isUnconditional;
                },
                clear: function() {
                    f(this.handlers, function(a) {
                        a.destroy();
                    }), this.mql.removeListener(this.listener), this.handlers.length = 0;
                },
                assess: function() {
                    var a = this.matches() ? "on" : "off";
                    f(this.handlers, function(b) {
                        b[a]();
                    });
                }
            }, b.exports = d;
        }, {
            3: 3,
            4: 4
        }],
        2: [function(a, b, c) {
            function d() {
                if (!window.matchMedia) throw new Error("matchMedia not present, legacy browsers require a polyfill");
                this.queries = {}, this.browserIsIncapable = !window.matchMedia("only all").matches;
            }
            var e = a(1),
                f = a(4),
                g = f.each,
                h = f.isFunction,
                i = f.isArray;
            d.prototype = {
                constructor: d,
                register: function(a, b, c) {
                    var d = this.queries,
                        f = c && this.browserIsIncapable;
                    return d[a] || (d[a] = new e(a, f)), h(b) && (b = {
                        match: b
                    }), i(b) || (b = [b]), g(b, function(b) {
                        h(b) && (b = {
                            match: b
                        }), d[a].addHandler(b);
                    }), this;
                },
                unregister: function(a, b) {
                    var c = this.queries[a];
                    return c && (b ? c.removeHandler(b) : (c.clear(), delete this.queries[a])), this;
                }
            }, b.exports = d;
        }, {
            1: 1,
            4: 4
        }],
        3: [function(a, b, c) {
            function d(a) {
                this.options = a, !a.deferSetup && this.setup();
            }
            d.prototype = {
                constructor: d,
                setup: function() {
                    this.options.setup && this.options.setup(), this.initialised = !0;
                },
                on: function() {
                    !this.initialised && this.setup(), this.options.match && this.options.match();
                },
                off: function() {
                    this.options.unmatch && this.options.unmatch();
                },
                destroy: function() {
                    this.options.destroy ? this.options.destroy() : this.off();
                },
                equals: function(a) {
                    return this.options === a || this.options.match === a;
                }
            }, b.exports = d;
        }, {}],
        4: [function(a, b, c) {
            function d(a, b) {
                var c = 0,
                    d = a.length;
                for (c; c < d && b(a[c], c) !== !1; c++);
            }

            function e(a) {
                return "[object Array]" === Object.prototype.toString.apply(a);
            }

            function f(a) {
                return "function" == typeof a;
            }
            b.exports = {
                isFunction: f,
                isArray: e,
                each: d
            };
        }, {}],
        5: [function(a, b, c) {
            var d = a(2);
            b.exports = new d();
        }, {
            2: 2
        }]
    }, {}, [5])(5);
});;
(function($, enquire) {
    var placeSearchBarInMobileMenu = function() {
        var searchBarElement = $('.global-header-digitalgov-search .body').clone().css('display', 'block').remove(),
            mobileSearchContainer = $('<div class="mobile-menu-search-container"></div>'),
            targetElement = $('.global-navigation');
        if (!$('.mobile-menu-search-container').length) {
            mobileSearchContainer.append(searchBarElement);
            mobileSearchContainer.appendTo(targetElement);
            searchBarElement.find("#global-search").attr("id", "mobile-search");
            searchBarElement.find("#global-search-box").attr("id", "mobile-search-box");
        }
    };
    var removeMobileSearchSection = function() {
        $('.mobile-menu-search-container').remove();
    };
    var focusSearchLabel = function() {
        $('#global-search-box').click(function() {
            $('#global-search label.overlabel').hide();
        }).focusin(function() {
            $('#global-search label.overlabel').hide();
        }).focusout(function() {
            if ($('#global-search-box').val().length > 0) $('#global-search label.overlabel').hide();
            else $('#global-search label.overlabel').show();
        });
        $('#mobile-search-box').click(function() {
            $('#mobile-search label.overlabel').hide();
        }).focusin(function() {
            $('#mobile-search label.overlabel').hide();
        }).focusout(function() {
            if ($('#mobile-search-box').val().length > 0) $('#mobile-search label.overlabel').hide();
            else $('#mobile-search label.overlabel').show();
        });
    };
    var openCloseMenu = function() {
        var navbar = $('.global-navigation');
        var menuIcon = $('#mobile-menu-toggle');
        menuIcon.click(function() {
            if (menuIcon.hasClass('is-closed')) {
                menuIcon.removeClass('is-closed').addClass('is-open').find("span").html('g');
                navbar.slideDown();
            } else {
                if (menuIcon.hasClass('is-open')) {
                    menuIcon.removeClass('is-open').addClass('is-closed').find("span").html('q');
                    navbar.slideUp();
                }
            }
        }).keypress(function(e) {
            var keycode = (e.keyCode ? e.keyCode : e.which);
            if (keycode == '13')
                if (menuIcon.hasClass('is-closed')) {
                    menuIcon.removeClass('is-closed').addClass('is-open').find("span").html('g');
                    navbar.slideDown();
                } else {
                    if (menuIcon.hasClass('is-open')) {
                        menuIcon.removeClass('is-open').addClass('is-closed').find("span").html('q');
                        navbar.slideUp();
                    }
                }
            e.stopPropagation();
        });
    };
    $(document).ready(function() {
        openCloseMenu();
        $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link").attr("href", "/");
    });
    $(window).on("load", function(e) {
        enquire.register("screen and (max-width:959px)", {
            match: function() {
                placeSearchBarInMobileMenu();
            },
            unmatch: function() {
                removeMobileSearchSection();
            }
        });
    });
    var mainMenu = $('#block-secgov-main-menu ul.menu');
    $(window).on("load", function(e) {
        $("#main-menu li.is-expanded:not(:first-child)").hide();
        focusSearchLabel();
        $("#section-menu > li").has("ul").addClass("is-expanded expanded").removeClass("is-leaf leaf");
        $("#section-menu > li:first-child").addClass("expanded").removeClass("is-leaf leaf");
        if ($(this).width() < 960) {
            $(".desktop-menu").hide();
            $(".mobile-menu").show();
            $("#mobile-menu-toggle").attr("tabindex", 4);
            $("#mobile-search .usagov-search-autocomplete").removeAttr("tabindex");
            $("#mobile-search .global-search-button").removeAttr("tabindex");
            $("#mobile-search .option-link").removeAttr("tabindex");
            mainMenu.superfish('destroy');
        } else {
            $(".mobile-menu").hide();
            $(".desktop-menu").show();
            $("#global-search .usagov-search-autocomplete").attr("tabindex", 4);
            $("#global-search .global-search-button").attr("tabindex", 5);
            $("#global-search .option-link:first").attr("tabindex", 6);
            $("#global-search .option-link:last").attr("tabindex", 7);
            mainMenu.superfish({
                delay: 650,
                animation: {
                    height: 'show'
                }
            });
        }
        $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link:contains('U.S. Securities and Exchange Commission')").text("Securities & Exchange Commission");
        if ($(window).width() <= 375) $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link:contains('U.S. Securities & Exchange Commission')").text("Securities & Exchange Commission");
        else $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link").text("U.S. Securities & Exchange Commission");
    }).resize(function() {
        focusSearchLabel();
        if ($(this).width() < 960) {
            $(".desktop-menu").hide();
            $(".mobile-menu").show();
            if ($('#mobile-menu-toggle').hasClass('is-open')) {
                $('.global-navigation').show();
                $(this).removeClass('is-closed').addClass('is-open');
                $(this).find("span").html('g');
            } else {
                if ($('#mobile-menu-toggle').hasClass('is-closed')) {
                    $('.global-navigation').hide();
                    $(this).removeClass('is-open').addClass('is-closed');
                    $(this).find("span").html('q');
                }
            }
            $("#mobile-menu-toggle").attr("tabindex", 4);
            $("#mobile-search .usagov-search-autocomplete").removeAttr("tabindex");
            $("#mobile-search .global-search-button").removeAttr("tabindex");
            $("#mobile-search .option-link").removeAttr("tabindex");
            mainMenu.superfish('destroy');
        } else {
            $(".mobile-menu").hide();
            $(".desktop-menu").show();
            $('.global-navigation').show();
            $('#mobile-menu-toggle').find('span').html('q');
            $('#mobile-menu-toggle').removeClass('is-open').addClass('is-closed');
            $("#global-search .usagov-search-autocomplete").attr("tabindex", 4);
            $("#global-search .global-search-button").attr("tabindex", 5);
            $("#global-search .option-link:first-child").attr("tabindex", 6);
            $("#global-search .option-link:last-child").attr("tabindex", 7);
            mainMenu.superfish({
                delay: 650,
                animation: {
                    height: 'show'
                }
            });
        }
        $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link:contains('U.S. Securities and Exchange Commission')").text("Securities & Exchange Commission");
        if ($(window).width() <= 375) $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link:contains('U.S. Securities & Exchange Commission')").text("Securities & Exchange Commission");
        else $(".mobile-menu > ul#main-menu > li.menu__item:first-child > a.menu__link").text("U.S. Securities & Exchange Commission");
    });
})(jQuery, enquire);;
(function($, enquire) {
    var createSubMenuButton = function() {
        var listElementWithSubMenu = $('li.is-expanded'),
            subMenuButton = $('<span class="sub-menu-button"><a class="sub-menu-link" href="javascript:void(0)"><span class="element-invisible">Expand</span></a></span>');
        listElementWithSubMenu.append(subMenuButton);
        listElementWithSubMenu.removeClass('is-active');
        $('.sub-menu-button').on('click', function(e) {
            if ($(this).parent('li').hasClass('is-active')) {
                $(this).parent('li').removeClass('is-active');
                $(this).prev('ul').slideUp();
            } else {
                $(this).parent('li').addClass('is-active');
                $(this).prev('ul').slideDown();
            }
            return false;
        });
    };
    var removeSubMenuButton = function() {
        var subMenuButton = $('.sub-menu-button'),
            subMenu = $('.global-navigation li.is-expanded .menu');
        if (subMenuButton.length) {
            subMenuButton.remove();
            subMenuButton.unbind('click');
        }
    };
    $(window).on("load", function(e) {
        enquire.register("screen and (max-width:959px)", {
            match: function() {
                createSubMenuButton();
            },
            unmatch: function() {
                removeSubMenuButton();
            }
        });
    });
})(jQuery, enquire);;
(function($, w) {
    "use strict";
    var methods = (function() {
        var c = {
                bcClass: 'sf-breadcrumb',
                menuClass: 'sf-js-enabled',
                anchorClass: 'sf-with-ul',
                menuArrowClass: 'sf-arrows'
            },
            ios = (function() {
                var ios = /^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(navigator.userAgent);
                if (ios) $('html').css('cursor', 'pointer').on('click', $.noop);
                return ios;
            })(),
            wp7 = (function() {
                var style = document.documentElement.style;
                return ('behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent));
            })(),
            unprefixedPointerEvents = (function() {
                return (!!w.PointerEvent);
            })(),
            toggleMenuClasses = function($menu, o, add) {
                var classes = c.menuClass,
                    method;
                if (o.cssArrows) classes += ' ' + c.menuArrowClass;
                method = (add) ? 'addClass' : 'removeClass';
                $menu[method](classes);
            },
            setPathToCurrent = function($menu, o) {
                return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels).addClass(o.hoverClass + ' ' + c.bcClass).filter(function() {
                    return ($(this).children(o.popUpSelector).hide().show().length);
                }).removeClass(o.pathClass);
            },
            toggleAnchorClass = function($li, add) {
                var method = (add) ? 'addClass' : 'removeClass';
                $li.children('a')[method](c.anchorClass);
            },
            toggleTouchAction = function($menu) {
                var msTouchAction = $menu.css('ms-touch-action');
                var touchAction = $menu.css('touch-action');
                touchAction = touchAction || msTouchAction;
                touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
                $menu.css({
                    'ms-touch-action': touchAction,
                    'touch-action': touchAction
                });
            },
            getMenu = function($el) {
                return $el.closest('.' + c.menuClass);
            },
            getOptions = function($el) {
                return getMenu($el).data('sfOptions');
            },
            over = function() {
                var $this = $(this),
                    o = getOptions($this);
                clearTimeout(o.sfTimer);
                $this.siblings().superfish('hide').end().superfish('show');
            },
            close = function(o) {
                o.retainPath = ($.inArray(this[0], o.$path) > -1);
                this.superfish('hide');
                if (!this.parents('.' + o.hoverClass).length) {
                    o.onIdle.call(getMenu(this));
                    if (o.$path.length) $.proxy(over, o.$path)();
                }
            },
            out = function() {
                var $this = $(this),
                    o = getOptions($this);
                if (ios) $.proxy(close, $this, o)();
                else {
                    clearTimeout(o.sfTimer);
                    o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
                }
            },
            touchHandler = function(e) {
                var $this = $(this),
                    o = getOptions($this),
                    $ul = $this.siblings(e.data.popUpSelector);
                if (o.onHandleTouch.call($ul) === false) return this;
                if ($ul.length > 0 && $ul.is(':hidden')) {
                    $this.one('click.superfish', false);
                    if (e.type === 'MSPointerDown' || e.type === 'pointerdown') $this.trigger('focus');
                    else $.proxy(over, $this.parent('li'))();
                }
            },
            applyHandlers = function($menu, o) {
                var targets = 'li:has(' + o.popUpSelector + ')';
                if ($.fn.hoverIntent && !o.disableHI) $menu.hoverIntent(over, out, targets);
                else $menu.on('mouseenter.superfish', targets, over).on('mouseleave.superfish', targets, out);
                var touchevent = 'MSPointerDown.superfish';
                if (unprefixedPointerEvents) touchevent = 'pointerdown.superfish';
                if (!ios) touchevent += ' touchend.superfish';
                if (wp7) touchevent += ' mousedown.superfish';
                $menu.on('focusin.superfish', 'li', over).on('focusout.superfish', 'li', out).on(touchevent, 'a', o, touchHandler);
            };
        return {
            hide: function(instant) {
                if (this.length) {
                    var $this = this,
                        o = getOptions($this);
                    if (!o) return this;
                    var not = (o.retainPath === true) ? o.$path : '',
                        $ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
                        speed = o.speedOut;
                    if (instant) {
                        $ul.show();
                        speed = 0;
                    }
                    o.retainPath = false;
                    if (o.onBeforeHide.call($ul) === false) return this;
                    $ul.stop(true, true).animate(o.animationOut, speed, function() {
                        var $this = $(this);
                        o.onHide.call($this);
                    });
                }
                return this;
            },
            show: function() {
                var o = getOptions(this);
                if (!o) return this;
                var $this = this.addClass(o.hoverClass),
                    $ul = $this.children(o.popUpSelector);
                if (o.onBeforeShow.call($ul) === false) return this;
                $ul.stop(true, true).animate(o.animation, o.speed, function() {
                    o.onShow.call($ul);
                });
                return this;
            },
            destroy: function() {
                return this.each(function() {
                    var $this = $(this),
                        o = $this.data('sfOptions'),
                        $hasPopUp;
                    if (!o) return false;
                    $hasPopUp = $this.find(o.popUpSelector).parent('li');
                    clearTimeout(o.sfTimer);
                    toggleMenuClasses($this, o);
                    toggleAnchorClass($hasPopUp);
                    toggleTouchAction($this);
                    $this.off('.superfish').off('.hoverIntent');
                    $hasPopUp.children(o.popUpSelector).attr('style', function(i, style) {
                        if (typeof style !== 'undefined') return style.replace(/display[^;]+;?/g, '');
                    });
                    o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
                    $this.find('.' + o.hoverClass).removeClass(o.hoverClass);
                    o.onDestroy.call($this);
                    $this.removeData('sfOptions');
                });
            },
            init: function(op) {
                return this.each(function() {
                    var $this = $(this);
                    if ($this.data('sfOptions')) return false;
                    var o = $.extend({}, $.fn.superfish.defaults, op),
                        $hasPopUp = $this.find(o.popUpSelector).parent('li');
                    o.$path = setPathToCurrent($this, o);
                    $this.data('sfOptions', o);
                    toggleMenuClasses($this, o, true);
                    toggleAnchorClass($hasPopUp, true);
                    toggleTouchAction($this);
                    applyHandlers($this, o);
                    $hasPopUp.not('.' + c.bcClass).superfish('hide', true);
                    o.onInit.call(this);
                });
            }
        };
    })();
    $.fn.superfish = function(method, args) {
        if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
        else return $.error('Method ' + method + ' does not exist on jQuery.fn.superfish');
    };
    $.fn.superfish.defaults = {
        popUpSelector: 'ul,.sf-mega',
        hoverClass: 'sfHover',
        pathClass: 'overrideThisToUse',
        pathLevels: 1,
        delay: 800,
        animation: {
            opacity: 'show'
        },
        animationOut: {
            opacity: 'hide'
        },
        speed: 'normal',
        speedOut: 'fast',
        cssArrows: true,
        disableHI: false,
        onInit: $.noop,
        onBeforeShow: $.noop,
        onShow: $.noop,
        onBeforeHide: $.noop,
        onHide: $.noop,
        onIdle: $.noop,
        onDestroy: $.noop,
        onHandleTouch: $.noop
    };
})(jQuery, window);;
(function($) {
    $.fn.hoverIntent = function(handlerIn, handlerOut, selector) {
        var cfg = {
            interval: 100,
            sensitivity: 7,
            timeout: 0
        };
        if (typeof handlerIn === "object") cfg = $.extend(cfg, handlerIn);
        else if ($.isFunction(handlerOut)) cfg = $.extend(cfg, {
            over: handlerIn,
            out: handlerOut,
            selector
        });
        else cfg = $.extend(cfg, {
            over: handlerIn,
            out: handlerIn,
            selector: handlerOut
        });
        var cX, cY, pX, pY;
        var track = function(ev) {
            cX = ev.pageX;
            cY = ev.pageY;
        };
        var compare = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                $(ob).off("mousemove.hoverIntent", track);
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ev]);
            } else {
                pX = cX;
                pY = cY;
                ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob);
                }, cfg.interval);
            }
        };
        var delay = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ev]);
        };
        var handleHover = function(e) {
            var ev = jQuery.extend({}, e);
            var ob = this;
            if (ob.hoverIntent_t) ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            if (e.type == "mouseenter") {
                pX = ev.pageX;
                pY = ev.pageY;
                $(ob).on("mousemove.hoverIntent", track);
                if (ob.hoverIntent_s != 1) ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob);
                }, cfg.interval);
            } else {
                $(ob).off("mousemove.hoverIntent", track);
                if (ob.hoverIntent_s == 1) ob.hoverIntent_t = setTimeout(function() {
                    delay(ev, ob);
                }, cfg.timeout);
            }
        };
        return this.on({
            'mouseenter.hoverIntent': handleHover,
            'mouseleave.hoverIntent': handleHover
        }, cfg.selector);
    };
})(jQuery);;
(function(g, U, J) {
    "object" === typeof module && "object" === typeof module.exports ? module.exports = function(g, U) {
        return J(g, U);
    } : J(g, U);
})("undefined" !== typeof window ? window.jQuery : {}, "undefined" !== typeof window ? window : this, function(g, U) {
    function J(d) {
        for (var c in d) d.hasOwnProperty(c) && (this[c] = d[c]);
        return this;
    }

    function na() {
        Z(this, na.baseDefaults);
    }

    function ja(d) {
        return "string" === aa(d);
    }

    function va(d) {
        return !isNaN(wa(d)) && !isNaN(ba(d));
    }

    function K(d) {
        return d && d.getContext ? d.getContext("2d") : null;
    }

    function ka(d) {
        var c, a, b;
        for (c in d) d.hasOwnProperty(c) && (b = d[c], a = aa(b), "string" === a && va(b) && "text" !== c && (d[c] = ba(b)));
        void 0 !== d.text && (d.text = String(d.text));
    }

    function la(d) {
        d = Z({}, d);
        d.masks = d.masks.slice(0);
        return d;
    }

    function fa(d, c) {
        var a;
        d.save();
        a = la(c.transforms);
        c.savedTransforms.push(a);
    }

    function xa(d, c, a, b) {
        a[b] && (da(a[b]) ? c[b] = a[b].call(d, a) : c[b] = a[b]);
    }

    function S(d, c, a) {
        xa(d, c, a, "fillStyle");
        xa(d, c, a, "strokeStyle");
        c.lineWidth = a.strokeWidth;
        a.rounded ? c.lineCap = c.lineJoin = "round" : (c.lineCap = a.strokeCap, c.lineJoin = a.strokeJoin, c.miterLimit = a.miterLimit);
        a.strokeDash || (a.strokeDash = []);
        c.setLineDash && c.setLineDash(a.strokeDash);
        c.webkitLineDash = a.strokeDash;
        c.lineDashOffset = c.webkitLineDashOffset = c.mozDashOffset = a.strokeDashOffset;
        c.shadowOffsetX = a.shadowX;
        c.shadowOffsetY = a.shadowY;
        c.shadowBlur = a.shadowBlur;
        c.shadowColor = a.shadowColor;
        c.globalAlpha = a.opacity;
        c.globalCompositeOperation = a.compositing;
        a.imageSmoothing && (c.imageSmoothingEnabled = c.mozImageSmoothingEnabled = a.imageSmoothingEnabled);
    }

    function ya(d, c, a) {
        a.mask && (a.autosave && fa(d, c), d.clip(), c.transforms.masks.push(a._args));
    }

    function W(d, c, a) {
        a.closed && c.closePath();
        a.shadowStroke && 0 !== a.strokeWidth ? (c.stroke(), c.fill(), c.shadowColor = "transparent", c.shadowBlur = 0, c.stroke()) : (c.fill(), "transparent" !== a.fillStyle && (c.shadowColor = "transparent"), 0 !== a.strokeWidth && c.stroke());
        a.closed || c.closePath();
        a._transformed && c.restore();
        a.mask && (d = H(d), ya(c, d, a));
    }

    function Q(d, c, a, b, f) {
        a._toRad = a.inDegrees ? F / 180 : 1;
        a._transformed = !0;
        c.save();
        a.fromCenter || a._centered || void 0 === b || (void 0 === f && (f = b), a.x += b / 2, a.y += f / 2, a._centered = !0);
        a.rotate && za(c, a, null);
        1 === a.scale && 1 === a.scaleX && 1 === a.scaleY || Aa(c, a, null);
        (a.translate || a.translateX || a.translateY) && Ba(c, a, null);
    }

    function H(d) {
        var c = ca.dataCache,
            a;
        c._canvas === d && c._data ? a = c._data : (a = g.data(d, "jCanvas"), a || (a = {
            canvas: d,
            layers: [],
            layer: {
                names: {},
                groups: {}
            },
            eventHooks: {},
            intersecting: [],
            lastIntersected: null,
            cursor: g(d).css("cursor"),
            drag: {
                layer: null,
                dragging: !1
            },
            event: {
                type: null,
                x: null,
                y: null
            },
            events: {},
            transforms: la(oa),
            savedTransforms: [],
            animating: !1,
            animated: null,
            pixelRatio: 1,
            scaled: !1
        }, g.data(d, "jCanvas", a)), c._canvas = d, c._data = a);
        return a;
    }

    function Ca(d, c, a) {
        for (var b in Y.events) Y.events.hasOwnProperty(b) && (a[b] || a.cursors && a.cursors[b]) && Da(d, c, a, b);
        c.events.mouseout || (d.bind("mouseout.jCanvas", function() {
            var a = c.drag.layer,
                b;
            a && (c.drag = {}, O(d, c, a, "dragcancel"));
            for (b = 0; b < c.layers.length; b += 1) a = c.layers[b], a._hovered && d.triggerLayerEvent(c.layers[b], "mouseout");
            d.drawLayers();
        }), c.events.mouseout = !0);
    }

    function Da(d, c, a, b) {
        Y.events[b](d, c);
        a._event = !0;
    }

    function Ea(d, c, a) {
        var b, f, e;
        if (a.draggable || a.cursors) {
            b = ["mousedown", "mousemove", "mouseup"];
            for (e = 0; e < b.length; e += 1) f = b[e], Da(d, c, a, f);
            a._event = !0;
        }
    }

    function pa(d, c, a, b) {
        d = c.layer.names;
        b ? void 0 !== b.name && ja(a.name) && a.name !== b.name && delete d[a.name] : b = a;
        ja(b.name) && (d[b.name] = a);
    }

    function qa(d, c, a, b) {
        d = c.layer.groups;
        var f, e, h, g;
        if (!b) b = a;
        else {
            if (void 0 !== b.groups && null !== a.groups)
                for (e = 0; e < a.groups.length; e += 1)
                    if (f = a.groups[e], c = d[f]) {
                        for (g = 0; g < c.length; g += 1)
                            if (c[g] === a) {
                                h = g;
                                c.splice(g, 1);
                                break;
                            }
                        0 === c.length && delete d[f];
                    }
        }
        if (void 0 !== b.groups && null !== b.groups)
            for (e = 0; e < b.groups.length; e += 1) f = b.groups[e], c = d[f], c || (c = d[f] = [], c.name = f), void 0 === h && (h = c.length), c.splice(h, 0, a);
    }

    function ra(d, c, a, b, f) {
        b[a] && c._running && !c._running[a] && (c._running[a] = !0, b[a].call(d[0], c, f), c._running[a] = !1);
    }

    function O(d, c, a, b, f) {
        if (!(a.disableEvents || a.intangible && -1 !== g.inArray(b, Ua))) {
            if ("mouseout" !== b) {
                var e;
                a.cursors && (e = a.cursors[b]); - 1 !== g.inArray(e, V.cursors) && (e = V.prefix + e);
                e && d.css({
                    cursor: e
                });
            }
            ra(d, a, b, a, f);
            ra(d, a, b, c.eventHooks, f);
            ra(d, a, b, Y.eventHooks, f);
        }
    }

    function N(d, c, a, b) {
        var f, e = c._layer ? a : c;
        c._args = a;
        if (c.draggable || c.dragGroups) c.layer = !0, c.draggable = !0;
        c._method || (c._method = b ? b : c.method ? g.fn[c.method] : c.type ? g.fn[X.drawings[c.type]] : function() {});
        if (c.layer && !c._layer) {
            if (a = g(d), b = H(d), f = b.layers, null === e.name || ja(e.name) && void 0 === b.layer.names[e.name]) ka(c), e = new J(c), e.canvas = d, e.layer = !0, e._layer = !0, e._running = {}, e.data = null !== e.data ? Z({}, e.data) : {}, e.groups = null !== e.groups ? e.groups.slice(0) : [], pa(a, b, e), qa(a, b, e), Ca(a, b, e), Ea(a, b, e), c._event = e._event, e._method === g.fn.drawText && a.measureText(e), null === e.index && (e.index = f.length), f.splice(e.index, 0, e), c._args = e, O(a, b, e, "add");
        } else c.layer || ka(c);
        return e;
    }

    function Fa(d, c) {
        var a, b;
        for (b = 0; b < V.props.length; b += 1) a = V.props[b], void 0 !== d[a] && (d["_" + a] = d[a], V.propsObj[a] = !0, c && delete d[a]);
    }

    function Va(d, c, a) {
        var b, f, e, h;
        for (b in a)
            if (a.hasOwnProperty(b) && (f = a[b], da(f) && (a[b] = f.call(d, c, b)), "object" === aa(f) && Ga(f))) {
                for (e in f) f.hasOwnProperty(e) && (h = f[e], void 0 !== c[b] && (c[b + "." + e] = c[b][e], a[b + "." + e] = h));
                delete a[b];
            }
        return a;
    }

    function Ha(d) {
        var c, a, b = [],
            f = 1;
        "transparent" === d ? d = "rgba(0, 0, 0, 0)" : d.match(/^([a-z]+|#[0-9a-f]+)$/gi) && (a = Ia.head, c = a.style.color, a.style.color = d, d = g.css(a, "color"), a.style.color = c);
        d.match(/^rgb/gi) && (b = d.match(/(\d+(\.\d+)?)/gi), d.match(/%/gi) && (f = 2.55), b[0] *= f, b[1] *= f, b[2] *= f, b[3] = void 0 !== b[3] ? ba(b[3]) : 1);
        return b;
    }

    function Wa(d) {
        var c = 3,
            a;
        "array" !== aa(d.start) && (a = d.start.slice(0), d.start = Ha(d.start), console.log(a, "=>", d.start), d.end = Ha(d.end));
        d.now = [];
        if (1 !== d.start[3] || 1 !== d.end[3]) c = 4;
        for (a = 0; a < c; a += 1) d.now[a] = d.start[a] + (d.end[a] - d.start[a]) * d.pos, 3 > a && (d.now[a] = Xa(d.now[a]));
        1 !== d.start[3] || 1 !== d.end[3] ? d.now = "rgba( " + d.now.join(",") + " )" : (d.now.slice(0, 3), d.now = "rgb( " + d.now.join(",") + " )");
        d.elem.nodeName ? d.elem.style[d.prop] = d.now : d.elem[d.prop] = d.now;
    }

    function Ya(d) {
        X.touchEvents[d] && (d = X.touchEvents[d]);
        return d;
    }

    function Za(d) {
        Y.events[d] = function(c, a) {
            function b(a) {
                h.x = a.offsetX;
                h.y = a.offsetY;
                h.type = f;
                h.event = a;
                c.drawLayers({
                    resetFire: !0
                });
                a.preventDefault();
            }
            var f, e, h;
            h = a.event;
            f = "mouseover" === d || "mouseout" === d ? "mousemove" : d;
            e = Ya(f);
            a.events[f] || (e !== f ? c.bind(f + ".jCanvas " + e + ".jCanvas", b) : c.bind(f + ".jCanvas", b), a.events[f] = !0);
        };
    }

    function T(d, c, a) {
        var b, f, e, h;
        if (a = a._args) d = H(d), b = d.event, null !== b.x && null !== b.y && (e = b.x * d.pixelRatio, h = b.y * d.pixelRatio, f = c.isPointInPath(e, h) || c.isPointInStroke && c.isPointInStroke(e, h)), c = d.transforms, a.eventX = b.x, a.eventY = b.y, a.event = b.event, b = d.transforms.rotate, e = a.eventX, h = a.eventY, 0 !== b ? (a._eventX = e * L(-b) - h * P(-b), a._eventY = h * L(-b) + e * P(-b)) : (a._eventX = e, a._eventY = h), a._eventX /= c.scaleX, a._eventY /= c.scaleY, f && d.intersecting.push(a), a.intersects = !!f;
    }

    function za(d, c, a) {
        c._toRad = c.inDegrees ? F / 180 : 1;
        d.translate(c.x, c.y);
        d.rotate(c.rotate * c._toRad);
        d.translate(-c.x, -c.y);
        a && (a.rotate += c.rotate * c._toRad);
    }

    function Aa(d, c, a) {
        1 !== c.scale && (c.scaleX = c.scaleY = c.scale);
        d.translate(c.x, c.y);
        d.scale(c.scaleX, c.scaleY);
        d.translate(-c.x, -c.y);
        a && (a.scaleX *= c.scaleX, a.scaleY *= c.scaleY);
    }

    function Ba(d, c, a) {
        c.translate && (c.translateX = c.translateY = c.translate);
        d.translate(c.translateX, c.translateY);
        a && (a.translateX += c.translateX, a.translateY += c.translateY);
    }

    function Ja(d) {
        for (; 0 > d;) d += 2 * F;
        return d;
    }

    function Ka(d, c, a, b) {
        var f, e, h, g, n, t, z;
        a === b ? z = t = 0 : (t = a.x, z = a.y);
        b.inDegrees || 360 !== b.end || (b.end = 2 * F);
        b.start *= a._toRad;
        b.end *= a._toRad;
        b.start -= F / 2;
        b.end -= F / 2;
        n = F / 180;
        b.ccw && (n *= -1);
        f = b.x + b.radius * L(b.start + n);
        e = b.y + b.radius * P(b.start + n);
        h = b.x + b.radius * L(b.start);
        g = b.y + b.radius * P(b.start);
        ga(d, c, a, b, f, e, h, g);
        c.arc(b.x + t, b.y + z, b.radius, b.start, b.end, b.ccw);
        f = b.x + b.radius * L(b.end + n);
        n = b.y + b.radius * P(b.end + n);
        e = b.x + b.radius * L(b.end);
        h = b.y + b.radius * P(b.end);
        ha(d, c, a, b, e, h, f, n);
    }

    function La(d, c, a, b, f, e, h, g) {
        var n, t;
        b.arrowRadius && !a.closed && (t = $a(g - e, h - f), t -= F, d = a.strokeWidth * L(t), n = a.strokeWidth * P(t), a = h + b.arrowRadius * L(t + b.arrowAngle / 2), f = g + b.arrowRadius * P(t + b.arrowAngle / 2), e = h + b.arrowRadius * L(t - b.arrowAngle / 2), b = g + b.arrowRadius * P(t - b.arrowAngle / 2), c.moveTo(a - d, f - n), c.lineTo(h - d, g - n), c.lineTo(e - d, b - n), c.moveTo(h - d, g - n), c.lineTo(h + d, g + n), c.moveTo(h, g));
    }

    function ga(d, c, a, b, f, e, h, g) {
        b._arrowAngleConverted || (b.arrowAngle *= a._toRad, b._arrowAngleConverted = !0);
        b.startArrow && La(d, c, a, b, f, e, h, g);
    }

    function ha(d, c, a, b, f, e, h, g) {
        b._arrowAngleConverted || (b.arrowAngle *= a._toRad, b._arrowAngleConverted = !0);
        b.endArrow && La(d, c, a, b, f, e, h, g);
    }

    function Ma(d, c, a, b) {
        var f, e, h;
        f = 2;
        ga(d, c, a, b, b.x2 + a.x, b.y2 + a.y, b.x1 + a.x, b.y1 + a.y);
        for (void 0 !== b.x1 && void 0 !== b.y1 && c.moveTo(b.x1 + a.x, b.y1 + a.y);;)
            if (e = b["x" + f], h = b["y" + f], void 0 !== e && void 0 !== h) c.lineTo(e + a.x, h + a.y), f += 1;
            else break;
        --f;
        ha(d, c, a, b, b["x" + (f - 1)] + a.x, b["y" + (f - 1)] + a.y, b["x" + f] + a.x, b["y" + f] + a.y);
    }

    function Na(d, c, a, b) {
        var f, e, h, g, n;
        f = 2;
        ga(d, c, a, b, b.cx1 + a.x, b.cy1 + a.y, b.x1 + a.x, b.y1 + a.y);
        for (void 0 !== b.x1 && void 0 !== b.y1 && c.moveTo(b.x1 + a.x, b.y1 + a.y);;)
            if (e = b["x" + f], h = b["y" + f], g = b["cx" + (f - 1)], n = b["cy" + (f - 1)], void 0 !== e && void 0 !== h && void 0 !== g && void 0 !== n) c.quadraticCurveTo(g + a.x, n + a.y, e + a.x, h + a.y), f += 1;
            else break;
        --f;
        ha(d, c, a, b, b["cx" + (f - 1)] + a.x, b["cy" + (f - 1)] + a.y, b["x" + f] + a.x, b["y" + f] + a.y);
    }

    function Oa(d, c, a, b) {
        var f, e, h, g, n, t, z, E;
        f = 2;
        e = 1;
        ga(d, c, a, b, b.cx1 + a.x, b.cy1 + a.y, b.x1 + a.x, b.y1 + a.y);
        for (void 0 !== b.x1 && void 0 !== b.y1 && c.moveTo(b.x1 + a.x, b.y1 + a.y);;)
            if (h = b["x" + f], g = b["y" + f], n = b["cx" + e], t = b["cy" + e], z = b["cx" + (e + 1)], E = b["cy" + (e + 1)], void 0 !== h && void 0 !== g && void 0 !== n && void 0 !== t && void 0 !== z && void 0 !== E) c.bezierCurveTo(n + a.x, t + a.y, z + a.x, E + a.y, h + a.x, g + a.y), f += 1, e += 2;
            else break;
        --f;
        e -= 2;
        ha(d, c, a, b, b["cx" + (e + 1)] + a.x, b["cy" + (e + 1)] + a.y, b["x" + f] + a.x, b["y" + f] + a.y);
    }

    function Pa(d, c, a) {
        c *= d._toRad;
        c -= F / 2;
        return a * L(c);
    }

    function Qa(d, c, a) {
        c *= d._toRad;
        c -= F / 2;
        return a * P(c);
    }

    function Ra(d, c, a, b) {
        var f, e, h, g, n, t, z;
        a === b ? n = g = 0 : (g = a.x, n = a.y);
        f = 1;
        e = g = t = b.x + g;
        h = n = z = b.y + n;
        ga(d, c, a, b, e + Pa(a, b.a1, b.l1), h + Qa(a, b.a1, b.l1), e, h);
        for (void 0 !== b.x && void 0 !== b.y && c.moveTo(e, h);;)
            if (e = b["a" + f], h = b["l" + f], void 0 !== e && void 0 !== h) g = t, n = z, t += Pa(a, e, h), z += Qa(a, e, h), c.lineTo(t, z), f += 1;
            else break;
        ha(d, c, a, b, g, n, t, z);
    }

    function sa(d, c, a) {
        isNaN(wa(a.fontSize)) || (a.fontSize += "px");
        c.font = a.fontStyle + " " + a.fontSize + " " + a.fontFamily;
    }

    function ta(d, c, a, b) {
        var f, e;
        f = ca.propCache;
        if (f.text === a.text && f.fontStyle === a.fontStyle && f.fontSize === a.fontSize && f.fontFamily === a.fontFamily && f.maxWidth === a.maxWidth && f.lineHeight === a.lineHeight) a.width = f.width, a.height = f.height;
        else {
            a.width = c.measureText(b[0]).width;
            for (e = 1; e < b.length; e += 1) f = c.measureText(b[e]).width, f > a.width && (a.width = f);
            c = d.style.fontSize;
            d.style.fontSize = a.fontSize;
            a.height = ba(g.css(d, "fontSize")) * b.length * a.lineHeight;
            d.style.fontSize = c;
        }
    }

    function Sa(d, c) {
        var a = c.maxWidth,
            b = String(c.text).split("\n"),
            f = [],
            e, h, g, n, t;
        for (g = 0; g < b.length; g += 1) {
            n = b[g];
            t = n.split(" ");
            e = [];
            h = "";
            if (1 === t.length || d.measureText(n).width < a) e = [n];
            else {
                for (n = 0; n < t.length; n += 1) d.measureText(h + t[n]).width > a && ("" !== h && e.push(h), h = ""), h += t[n], n !== t.length - 1 && (h += " ");
                e.push(h);
            }
            f = f.concat(e.join("\n").replace(/( (\n))|( $)/gi, "$2").split("\n"));
        }
        return f;
    }
    var Ia = U.document,
        Ta = U.Image,
        ab = U.getComputedStyle,
        ea = U.Math,
        wa = U.Number,
        ba = U.parseFloat,
        ma, Z = g.extend,
        ia = g.inArray,
        aa = function(d) {
            return Object.prototype.toString.call(d).slice(8, -1).toLowerCase();
        },
        da = g.isFunction,
        Ga = g.isPlainObject,
        F = ea.PI,
        Xa = ea.round,
        bb = ea.abs,
        P = ea.sin,
        L = ea.cos,
        $a = ea.atan2,
        ua = U.Array.prototype.slice,
        cb = g.event.fix,
        X = {},
        ca = {
            dataCache: {},
            propCache: {},
            imageCache: {}
        },
        oa = {
            rotate: 0,
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
            masks: []
        },
        V = {},
        Ua = "mousedown mousemove mouseup mouseover mouseout touchstart touchmove touchend".split(" "),
        Y = {
            events: {},
            eventHooks: {},
            future: {}
        };
    na.baseDefaults = {
        align: "center",
        arrowAngle: 90,
        arrowRadius: 0,
        autosave: !0,
        baseline: "middle",
        bringToFront: !1,
        ccw: !1,
        closed: !1,
        compositing: "source-over",
        concavity: 0,
        cornerRadius: 0,
        count: 1,
        cropFromCenter: !0,
        crossOrigin: null,
        cursors: null,
        disableEvents: !1,
        draggable: !1,
        dragGroups: null,
        groups: null,
        data: null,
        dx: null,
        dy: null,
        end: 360,
        eventX: null,
        eventY: null,
        fillStyle: "transparent",
        fontStyle: "normal",
        fontSize: "12pt",
        fontFamily: "sans-serif",
        fromCenter: !0,
        height: null,
        imageSmoothing: !0,
        inDegrees: !0,
        intangible: !1,
        index: null,
        letterSpacing: null,
        lineHeight: 1,
        layer: !1,
        mask: !1,
        maxWidth: null,
        miterLimit: 10,
        name: null,
        opacity: 1,
        r1: null,
        r2: null,
        radius: 0,
        repeat: "repeat",
        respectAlign: !1,
        restrictDragToAxis: null,
        rotate: 0,
        rounded: !1,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowStroke: !1,
        shadowX: 0,
        shadowY: 0,
        sHeight: null,
        sides: 0,
        source: "",
        spread: 0,
        start: 0,
        strokeCap: "butt",
        strokeDash: null,
        strokeDashOffset: 0,
        strokeJoin: "miter",
        strokeStyle: "transparent",
        strokeWidth: 1,
        sWidth: null,
        sx: null,
        sy: null,
        text: "",
        translate: 0,
        translateX: 0,
        translateY: 0,
        type: null,
        visible: !0,
        width: null,
        x: 0,
        y: 0
    };
    ma = new na();
    J.prototype = ma;
    Y.extend = function(d) {
        d.name && (d.props && Z(ma, d.props), g.fn[d.name] = function a(b) {
            var f, e, h, g;
            for (e = 0; e < this.length; e += 1)
                if (f = this[e], h = K(f)) g = new J(b), N(f, g, b, a), S(f, h, g), d.fn.call(f, h, g);
            return this;
        }, d.type && (X.drawings[d.type] = d.name));
        return g.fn[d.name];
    };
    g.fn.getEventHooks = function() {
        var d;
        d = {};
        0 !== this.length && (d = this[0], d = H(d), d = d.eventHooks);
        return d;
    };
    g.fn.setEventHooks = function(d) {
        var c, a;
        for (c = 0; c < this.length; c += 1) g(this[c]), a = H(this[c]), Z(a.eventHooks, d);
        return this;
    };
    g.fn.getLayers = function(d) {
        var c, a, b, f, e = [];
        if (0 !== this.length)
            if (c = this[0], a = H(c), a = a.layers, da(d))
                for (f = 0; f < a.length; f += 1) b = a[f], d.call(c, b) && e.push(b);
            else e = a;
        return e;
    };
    g.fn.getLayer = function(d) {
        var c, a, b, f;
        if (0 !== this.length)
            if (c = this[0], a = H(c), c = a.layers, f = aa(d), d && d.layer) b = d;
            else if ("number" === f) 0 > d && (d = c.length + d), b = c[d];
        else if ("regexp" === f) {
            for (a = 0; a < c.length; a += 1)
                if (ja(c[a].name) && c[a].name.match(d)) {
                    b = c[a];
                    break;
                }
        } else b = a.layer.names[d];
        return b;
    };
    g.fn.getLayerGroup = function(d) {
        var c, a, b, f = aa(d);
        if (0 !== this.length)
            if (c = this[0], "array" === f) b = d;
            else if ("regexp" === f) {
            for (a in c = H(c), c = c.layer.groups, c)
                if (a.match(d)) {
                    b = c[a];
                    break;
                }
        } else c = H(c), b = c.layer.groups[d];
        return b;
    };
    g.fn.getLayerIndex = function(d) {
        var c = this.getLayers();
        d = this.getLayer(d);
        return ia(d, c);
    };
    g.fn.setLayer = function(d, c) {
        var a, b, f, e, h, M, n;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = H(this[b]), e = g(this[b]).getLayer(d)) {
                pa(a, f, e, c);
                qa(a, f, e, c);
                ka(c);
                for (h in c) c.hasOwnProperty(h) && (M = c[h], n = aa(M), "object" === n && Ga(M) ? (e[h] = Z({}, M), ka(e[h])) : "array" === n ? e[h] = M.slice(0) : "string" === n ? 0 === M.indexOf("+=") ? e[h] += ba(M.substr(2)) : 0 === M.indexOf("-=") ? e[h] -= ba(M.substr(2)) : !isNaN(M) && va(M) && "text" !== h ? e[h] = ba(M) : e[h] = M : e[h] = M);
                Ca(a, f, e);
                Ea(a, f, e);
                !1 === g.isEmptyObject(c) && O(a, f, e, "change", c);
            }
        return this;
    };
    g.fn.setLayers = function(d, c) {
        var a, b, f, e;
        for (b = 0; b < this.length; b += 1)
            for (a = g(this[b]), f = a.getLayers(c), e = 0; e < f.length; e += 1) a.setLayer(f[e], d);
        return this;
    };
    g.fn.setLayerGroup = function(d, c) {
        var a, b, f, e;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = a.getLayerGroup(d))
                for (e = 0; e < f.length; e += 1) a.setLayer(f[e], c);
        return this;
    };
    g.fn.moveLayer = function(d, c) {
        var a, b, f, e, h;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = H(this[b]), e = f.layers, h = a.getLayer(d)) h.index = ia(h, e), e.splice(h.index, 1), e.splice(c, 0, h), 0 > c && (c = e.length + c), h.index = c, O(a, f, h, "move");
        return this;
    };
    g.fn.removeLayer = function(d) {
        var c, a, b, f, e;
        for (a = 0; a < this.length; a += 1)
            if (c = g(this[a]), b = H(this[a]), f = c.getLayers(), e = c.getLayer(d)) e.index = ia(e, f), f.splice(e.index, 1), delete e._layer, pa(c, b, e, {
                name: null
            }), qa(c, b, e, {
                groups: null
            }), O(c, b, e, "remove");
        return this;
    };
    g.fn.removeLayers = function(d) {
        var c, a, b, f, e, h;
        for (a = 0; a < this.length; a += 1) {
            c = g(this[a]);
            b = H(this[a]);
            f = c.getLayers(d);
            for (h = 0; h < f.length; h += 1) e = f[h], c.removeLayer(e), --h;
            b.layer.names = {};
            b.layer.groups = {};
        }
        return this;
    };
    g.fn.removeLayerGroup = function(d) {
        var c, a, b, f;
        if (void 0 !== d)
            for (a = 0; a < this.length; a += 1)
                if (c = g(this[a]), H(this[a]), c.getLayers(), b = c.getLayerGroup(d))
                    for (b = b.slice(0), f = 0; f < b.length; f += 1) c.removeLayer(b[f]);
        return this;
    };
    g.fn.addLayerToGroup = function(d, c) {
        var a, b, f, e = [c];
        for (b = 0; b < this.length; b += 1) a = g(this[b]), f = a.getLayer(d), f.groups && (e = f.groups.slice(0), -1 === ia(c, f.groups) && e.push(c)), a.setLayer(f, {
            groups: e
        });
        return this;
    };
    g.fn.removeLayerFromGroup = function(d, c) {
        var a, b, f, e = [],
            h;
        for (b = 0; b < this.length; b += 1) a = g(this[b]), f = a.getLayer(d), f.groups && (h = ia(c, f.groups), -1 !== h && (e = f.groups.slice(0), e.splice(h, 1), a.setLayer(f, {
            groups: e
        })));
        return this;
    };
    V.cursors = ["grab", "grabbing", "zoom-in", "zoom-out"];
    V.prefix = function() {
        var d = ab(Ia.documentElement, "");
        return "-" + (ua.call(d).join("").match(/-(moz|webkit|ms)-/) || "" === d.OLink && ["", "o"])[1] + "-";
    }();
    g.fn.triggerLayerEvent = function(d, c) {
        var a, b, f;
        for (b = 0; b < this.length; b += 1) a = g(this[b]), f = H(this[b]), (d = a.getLayer(d)) && O(a, f, d, c);
        return this;
    };
    g.fn.drawLayer = function(d) {
        var c, a, b;
        for (c = 0; c < this.length; c += 1) b = g(this[c]), (a = K(this[c])) && (a = b.getLayer(d)) && a.visible && a._method && (a._next = null, a._method.call(b, a));
        return this;
    };
    g.fn.drawLayers = function(d) {
        var c, a, b = d || {},
            f, e, h, M, n, t, z, E;
        (M = b.index) || (M = 0);
        for (c = 0; c < this.length; c += 1)
            if (d = g(this[c]), a = K(this[c])) {
                n = H(this[c]);
                !1 !== b.clear && d.clearCanvas();
                a = n.layers;
                for (h = M; h < a.length; h += 1)
                    if (f = a[h], f.index = h, b.resetFire && (f._fired = !1), t = d, z = f, e = h + 1, z && z.visible && z._method && (z._next = e ? e : null, z._method.call(t, z)), f._masks = n.transforms.masks.slice(0), f._method === g.fn.drawImage && f.visible) {
                        E = !0;
                        break;
                    }
                if (E) break;
                f = n;
                var x = e = z = t = void 0;
                t = null;
                for (z = f.intersecting.length - 1; 0 <= z; --z)
                    if (t = f.intersecting[z], t._masks) {
                        for (x = t._masks.length - 1; 0 <= x; --x)
                            if (e = t._masks[x], !e.intersects) {
                                t.intersects = !1;
                                break;
                            }
                        if (t.intersects && !t.intangible) break;
                    }
                t && t.intangible && (t = null);
                f = t;
                t = n.event;
                z = t.type;
                if (n.drag.layer) {
                    e = d;
                    var x = n,
                        C = z,
                        u = void 0,
                        m = void 0,
                        k = void 0,
                        y = k = void 0,
                        B = void 0,
                        k = u = u = k = void 0,
                        k = x.drag,
                        y = (m = k.layer) && m.dragGroups || [],
                        u = x.layers;
                    if ("mousemove" === C || "touchmove" === C) {
                        if (k.dragging || (k.dragging = !0, m.dragging = !0, m.bringToFront && (u.splice(m.index, 1), m.index = u.push(m)), m._startX = m.x, m._startY = m.y, m._endX = m._eventX, m._endY = m._eventY, O(e, x, m, "dragstart")), k.dragging)
                            for (u = m._eventX - (m._endX - m._startX), k = m._eventY - (m._endY - m._startY), m.dx = u - m.x, m.dy = k - m.y, "y" !== m.restrictDragToAxis && (m.x = u), "x" !== m.restrictDragToAxis && (m.y = k), O(e, x, m, "drag"), u = 0; u < y.length; u += 1)
                                if (k = y[u], B = x.layer.groups[k], m.groups && B)
                                    for (k = 0; k < B.length; k += 1) B[k] !== m && ("y" !== m.restrictDragToAxis && "y" !== B[k].restrictDragToAxis && (B[k].x += m.dx), "x" !== m.restrictDragToAxis && "x" !== B[k].restrictDragToAxis && (B[k].y += m.dy));
                    } else {
                        if ("mouseup" === C || "touchend" === C) k.dragging && (m.dragging = !1, k.dragging = !1, O(e, x, m, "dragstop")), x.drag = {};
                    }
                }
                e = n.lastIntersected;
                null === e || f === e || !e._hovered || e._fired || n.drag.dragging || (n.lastIntersected = null, e._fired = !0, e._hovered = !1, O(d, n, e, "mouseout"), d.css({
                    cursor: n.cursor
                }));
                f && (f[z] || X.mouseEvents[z] && (z = X.mouseEvents[z]), f._event && f.intersects && (n.lastIntersected = f, !(f.mouseover || f.mouseout || f.cursors) || n.drag.dragging || f._hovered || f._fired || (f._fired = !0, f._hovered = !0, O(d, n, f, "mouseover")), f._fired || (f._fired = !0, t.type = null, O(d, n, f, z)), !f.draggable || f.disableEvents || "mousedown" !== z && "touchstart" !== z || (n.drag.layer = f)));
                null !== f || n.drag.dragging || d.css({
                    cursor: n.cursor
                });
                h === a.length && (n.intersecting.length = 0, n.transforms = la(oa), n.savedTransforms.length = 0);
            }
        return this;
    };
    g.fn.addLayer = function(d) {
        var c, a;
        for (c = 0; c < this.length; c += 1)
            if (a = K(this[c])) a = new J(d), a.layer = !0, N(this[c], a, d);
        return this;
    };
    V.props = ["width", "height", "opacity", "lineHeight"];
    V.propsObj = {};
    g.fn.animateLayer = function() {
        function d(a, b, c) {
            return function() {
                var d, f;
                for (f = 0; f < V.props.length; f += 1) d = V.props[f], c[d] = c["_" + d];
                for (var h in c) c.hasOwnProperty(h) && -1 !== h.indexOf(".") && delete c[h];
                b.animating && b.animated !== c || a.drawLayers();
                c._animating = !1;
                b.animating = !1;
                b.animated = null;
                e[4] && e[4].call(a[0], c);
                O(a, b, c, "animateend");
            };
        }

        function c(a, b, c) {
            return function(d, f) {
                var h, g, m = !1;
                "_" === f.prop[0] && (m = !0, f.prop = f.prop.replace("_", ""), c[f.prop] = c["_" + f.prop]); - 1 !== f.prop.indexOf(".") && (h = f.prop.split("."), g = h[0], h = h[1], c[g] && (c[g][h] = f.now));
                c._pos !== f.pos && (c._pos = f.pos, c._animating || b.animating || (c._animating = !0, b.animating = !0, b.animated = c), b.animating && b.animated !== c || a.drawLayers());
                e[5] && e[5].call(a[0], d, f, c);
                O(a, b, c, "animate", f);
                m && (f.prop = "_" + f.prop);
            };
        }
        var a, b, f, e = ua.call(arguments, 0),
            h, M;
        "object" === aa(e[2]) ? (e.splice(2, 0, e[2].duration || null), e.splice(3, 0, e[3].easing || null), e.splice(4, 0, e[4].complete || null), e.splice(5, 0, e[5].step || null)) : (void 0 === e[2] ? (e.splice(2, 0, null), e.splice(3, 0, null), e.splice(4, 0, null)) : da(e[2]) && (e.splice(2, 0, null), e.splice(3, 0, null)), void 0 === e[3] ? (e[3] = null, e.splice(4, 0, null)) : da(e[3]) && e.splice(3, 0, null));
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = K(this[b])) f = H(this[b]), (h = a.getLayer(e[0])) && h._method !== g.fn.draw && (M = Z({}, e[1]), M = Va(this[b], h, M), Fa(M, !0), Fa(h), h.style = V.propsObj, g(h).animate(M, {
                duration: e[2],
                easing: g.easing[e[3]] ? e[3] : null,
                complete: d(a, f, h),
                step: c(a, f, h)
            }), O(a, f, h, "animatestart"));
        return this;
    };
    g.fn.animateLayerGroup = function(d) {
        var c, a, b = ua.call(arguments, 0),
            f, e;
        for (a = 0; a < this.length; a += 1)
            if (c = g(this[a]), f = c.getLayerGroup(d))
                for (e = 0; e < f.length; e += 1) b[0] = f[e], c.animateLayer.apply(c, b);
        return this;
    };
    g.fn.delayLayer = function(d, c) {
        var a, b, f, e;
        c = c || 0;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = H(this[b]), e = a.getLayer(d)) g(e).delay(c), O(a, f, e, "delay");
        return this;
    };
    g.fn.delayLayerGroup = function(d, c) {
        var a, b, f, e, h;
        c = c || 0;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = a.getLayerGroup(d))
                for (h = 0; h < f.length; h += 1) e = f[h], a.delayLayer(e, c);
        return this;
    };
    g.fn.stopLayer = function(d, c) {
        var a, b, f, e;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = H(this[b]), e = a.getLayer(d)) g(e).stop(c), O(a, f, e, "stop");
        return this;
    };
    g.fn.stopLayerGroup = function(d, c) {
        var a, b, f, e, h;
        for (b = 0; b < this.length; b += 1)
            if (a = g(this[b]), f = a.getLayerGroup(d))
                for (h = 0; h < f.length; h += 1) e = f[h], a.stopLayer(e, c);
        return this;
    };
    (function(d) {
        var c;
        for (c = 0; c < d.length; c += 1) g.fx.step[d[c]] = Wa;
    })("color backgroundColor borderColor borderTopColor borderRightColor borderBottomColor borderLeftColor fillStyle outlineColor strokeStyle shadowColor".split(" "));
    X.touchEvents = {
        mousedown: "touchstart",
        mouseup: "touchend",
        mousemove: "touchmove"
    };
    X.mouseEvents = {
        touchstart: "mousedown",
        touchend: "mouseup",
        touchmove: "mousemove"
    };
    (function(d) {
        var c;
        for (c = 0; c < d.length; c += 1) Za(d[c]);
    })("click dblclick mousedown mouseup mousemove mouseover mouseout touchstart touchmove touchend contextmenu".split(" "));
    g.event.fix = function(d) {
        var c, a;
        d = cb.call(g.event, d);
        if (c = d.originalEvent)
            if (a = c.changedTouches, void 0 !== d.pageX && void 0 === d.offsetX) {
                if (c = g(d.currentTarget).offset()) d.offsetX = d.pageX - c.left, d.offsetY = d.pageY - c.top;
            } else a && (c = g(d.currentTarget).offset()) && (d.offsetX = a[0].pageX - c.left, d.offsetY = a[0].pageY - c.top);
        return d;
    };
    X.drawings = {
        arc: "drawArc",
        bezier: "drawBezier",
        ellipse: "drawEllipse",
        "function": "draw",
        image: "drawImage",
        line: "drawLine",
        path: "drawPath",
        polygon: "drawPolygon",
        slice: "drawSlice",
        quadratic: "drawQuadratic",
        rectangle: "drawRect",
        text: "drawText",
        vector: "drawVector",
        save: "saveCanvas",
        restore: "restoreCanvas",
        rotate: "rotateCanvas",
        scale: "scaleCanvas",
        translate: "translateCanvas"
    };
    g.fn.draw = function c(a) {
        var b, f, e = new J(a);
        if (X.drawings[e.type] && "function" !== e.type) this[X.drawings[e.type]](a);
        else {
            for (b = 0; b < this.length; b += 1)
                if (g(this[b]), f = K(this[b])) e = new J(a), N(this[b], e, a, c), e.visible && e.fn && e.fn.call(this[b], f, e);
        }
        return this;
    };
    g.fn.clearCanvas = function a(b) {
        var f, e, h = new J(b);
        for (f = 0; f < this.length; f += 1)
            if (e = K(this[f])) null === h.width || null === h.height ? (e.save(), e.setTransform(1, 0, 0, 1, 0, 0), e.clearRect(0, 0, this[f].width, this[f].height), e.restore()) : (N(this[f], h, b, a), Q(this[f], e, h, h.width, h.height), e.clearRect(h.x - h.width / 2, h.y - h.height / 2, h.width, h.height), h._transformed && e.restore());
        return this;
    };
    g.fn.saveCanvas = function b(f) {
        var e, h, g, n, t;
        for (e = 0; e < this.length; e += 1)
            if (h = K(this[e]))
                for (n = H(this[e]), g = new J(f), N(this[e], g, f, b), t = 0; t < g.count; t += 1) fa(h, n);
        return this;
    };
    g.fn.restoreCanvas = function f(e) {
        var h, g, n, t, z;
        for (h = 0; h < this.length; h += 1)
            if (g = K(this[h]))
                for (t = H(this[h]), n = new J(e), N(this[h], n, e, f), z = 0; z < n.count; z += 1) {
                    var E = g,
                        x = t;
                    0 === x.savedTransforms.length ? x.transforms = la(oa) : (E.restore(), x.transforms = x.savedTransforms.pop());
                }
        return this;
    };
    g.fn.rotateCanvas = function e(h) {
        var g, n, t, z;
        for (g = 0; g < this.length; g += 1)
            if (n = K(this[g])) z = H(this[g]), t = new J(h), N(this[g], t, h, e), t.autosave && fa(n, z), za(n, t, z.transforms);
        return this;
    };
    g.fn.scaleCanvas = function h(g) {
        var n, t, z, E;
        for (n = 0; n < this.length; n += 1)
            if (t = K(this[n])) E = H(this[n]), z = new J(g), N(this[n], z, g, h), z.autosave && fa(t, E), Aa(t, z, E.transforms);
        return this;
    };
    g.fn.translateCanvas = function M(g) {
        var t, z, E, x;
        for (t = 0; t < this.length; t += 1)
            if (z = K(this[t])) x = H(this[t]), E = new J(g), N(this[t], E, g, M), E.autosave && fa(z, x), Ba(z, E, x.transforms);
        return this;
    };
    g.fn.drawRect = function n(g) {
        var z, E, x, C, u, m, k, y, B;
        for (z = 0; z < this.length; z += 1)
            if (E = K(this[z])) x = new J(g), N(this[z], x, g, n), x.visible && (Q(this[z], E, x, x.width, x.height), S(this[z], E, x), E.beginPath(), x.width && x.height && (C = x.x - x.width / 2, u = x.y - x.height / 2, (y = bb(x.cornerRadius)) ? (m = x.x + x.width / 2, k = x.y + x.height / 2, 0 > x.width && (B = C, C = m, m = B), 0 > x.height && (B = u, u = k, k = B), 0 > m - C - 2 * y && (y = (m - C) / 2), 0 > k - u - 2 * y && (y = (k - u) / 2), E.moveTo(C + y, u), E.lineTo(m - y, u), E.arc(m - y, u + y, y, 3 * F / 2, 2 * F, !1), E.lineTo(m, k - y), E.arc(m - y, k - y, y, 0, F / 2, !1), E.lineTo(C + y, k), E.arc(C + y, k - y, y, F / 2, F, !1), E.lineTo(C, u + y), E.arc(C + y, u + y, y, F, 3 * F / 2, !1), x.closed = !0) : E.rect(C, u, x.width, x.height)), T(this[z], E, x), W(this[z], E, x));
        return this;
    };
    g.fn.drawArc = function t(g) {
        var E, x, C;
        for (E = 0; E < this.length; E += 1)
            if (x = K(this[E])) C = new J(g), N(this[E], C, g, t), C.visible && (Q(this[E], x, C, 2 * C.radius), S(this[E], x, C), x.beginPath(), Ka(this[E], x, C, C), T(this[E], x, C), W(this[E], x, C));
        return this;
    };
    g.fn.drawEllipse = function z(g) {
        var x, C, u, m, k;
        for (x = 0; x < this.length; x += 1)
            if (C = K(this[x])) u = new J(g), N(this[x], u, g, z), u.visible && (Q(this[x], C, u, u.width, u.height), S(this[x], C, u), m = 4 / 3 * u.width, k = u.height, C.beginPath(), C.moveTo(u.x, u.y - k / 2), C.bezierCurveTo(u.x - m / 2, u.y - k / 2, u.x - m / 2, u.y + k / 2, u.x, u.y + k / 2), C.bezierCurveTo(u.x + m / 2, u.y + k / 2, u.x + m / 2, u.y - k / 2, u.x, u.y - k / 2), T(this[x], C, u), u.closed = !0, W(this[x], C, u));
        return this;
    };
    g.fn.drawPolygon = function E(g) {
        var C, u, m, k, y, B, w, A, p, l;
        for (C = 0; C < this.length; C += 1)
            if (u = K(this[C]))
                if (m = new J(g), N(this[C], m, g, E), m.visible) {
                    Q(this[C], u, m, 2 * m.radius);
                    S(this[C], u, m);
                    y = 2 * F / m.sides;
                    B = y / 2;
                    k = B + F / 2;
                    w = m.radius * L(B);
                    u.beginPath();
                    for (l = 0; l < m.sides; l += 1) A = m.x + m.radius * L(k), p = m.y + m.radius * P(k), u.lineTo(A, p), m.concavity && (A = m.x + (w + -w * m.concavity) * L(k + B), p = m.y + (w + -w * m.concavity) * P(k + B), u.lineTo(A, p)), k += y;
                    T(this[C], u, m);
                    m.closed = !0;
                    W(this[C], u, m);
                }
        return this;
    };
    g.fn.drawSlice = function x(C) {
        var u, m, k, y, B;
        for (u = 0; u < this.length; u += 1)
            if (g(this[u]), m = K(this[u])) k = new J(C), N(this[u], k, C, x), k.visible && (Q(this[u], m, k, 2 * k.radius), S(this[u], m, k), k.start *= k._toRad, k.end *= k._toRad, k.start -= F / 2, k.end -= F / 2, k.start = Ja(k.start), k.end = Ja(k.end), k.end < k.start && (k.end += 2 * F), y = (k.start + k.end) / 2, B = k.radius * k.spread * L(y), y = k.radius * k.spread * P(y), k.x += B, k.y += y, m.beginPath(), m.arc(k.x, k.y, k.radius, k.start, k.end, k.ccw), m.lineTo(k.x, k.y), T(this[u], m, k), k.closed = !0, W(this[u], m, k));
        return this;
    };
    g.fn.drawLine = function C(g) {
        var m, k, y;
        for (m = 0; m < this.length; m += 1)
            if (k = K(this[m])) y = new J(g), N(this[m], y, g, C), y.visible && (Q(this[m], k, y), S(this[m], k, y), k.beginPath(), Ma(this[m], k, y, y), T(this[m], k, y), W(this[m], k, y));
        return this;
    };
    g.fn.drawQuadratic = function u(g) {
        var k, y, B;
        for (k = 0; k < this.length; k += 1)
            if (y = K(this[k])) B = new J(g), N(this[k], B, g, u), B.visible && (Q(this[k], y, B), S(this[k], y, B), y.beginPath(), Na(this[k], y, B, B), T(this[k], y, B), W(this[k], y, B));
        return this;
    };
    g.fn.drawBezier = function m(g) {
        var y, B, w;
        for (y = 0; y < this.length; y += 1)
            if (B = K(this[y])) w = new J(g), N(this[y], w, g, m), w.visible && (Q(this[y], B, w), S(this[y], B, w), B.beginPath(), Oa(this[y], B, w, w), T(this[y], B, w), W(this[y], B, w));
        return this;
    };
    g.fn.drawVector = function k(g) {
        var B, w, A;
        for (B = 0; B < this.length; B += 1)
            if (w = K(this[B])) A = new J(g), N(this[B], A, g, k), A.visible && (Q(this[B], w, A), S(this[B], w, A), w.beginPath(), Ra(this[B], w, A, A), T(this[B], w, A), W(this[B], w, A));
        return this;
    };
    g.fn.drawPath = function y(g) {
        var w, A, p, l, v;
        for (w = 0; w < this.length; w += 1)
            if (A = K(this[w]))
                if (p = new J(g), N(this[w], p, g, y), p.visible) {
                    Q(this[w], A, p);
                    S(this[w], A, p);
                    A.beginPath();
                    for (l = 1;;)
                        if (v = p["p" + l], void 0 !== v) v = new J(v), "line" === v.type ? Ma(this[w], A, p, v) : "quadratic" === v.type ? Na(this[w], A, p, v) : "bezier" === v.type ? Oa(this[w], A, p, v) : "vector" === v.type ? Ra(this[w], A, p, v) : "arc" === v.type && Ka(this[w], A, p, v), l += 1;
                        else break;
                    T(this[w], A, p);
                    W(this[w], A, p);
                }
        return this;
    };
    g.fn.drawText = function B(w) {
        var A, p, l, v, D, r, G, R, I, H;
        for (A = 0; A < this.length; A += 1)
            if (g(this[A]), p = K(this[A]))
                if (l = new J(w), v = N(this[A], l, w, B), l.visible) {
                    p.textBaseline = l.baseline;
                    p.textAlign = l.align;
                    sa(this[A], p, l);
                    D = null !== l.maxWidth ? Sa(p, l) : l.text.toString().split("\n");
                    ta(this[A], p, l, D);
                    v && (v.width = l.width, v.height = l.height);
                    Q(this[A], p, l, l.width, l.height);
                    S(this[A], p, l);
                    G = l.x;
                    "left" === l.align ? l.respectAlign ? l.x += l.width / 2 : G -= l.width / 2 : "right" === l.align && (l.respectAlign ? l.x -= l.width / 2 : G += l.width / 2);
                    if (l.radius)
                        for (G = ba(l.fontSize), null === l.letterSpacing && (l.letterSpacing = G / 500), v = 0; v < D.length; v += 1) {
                            p.save();
                            p.translate(l.x, l.y);
                            r = D[v];
                            l.flipArcText && (r = r.split(""), r.reverse(), r = r.join(""));
                            R = r.length;
                            p.rotate(-(F * l.letterSpacing * (R - 1)) / 2);
                            for (H = 0; H < R; H += 1) I = r[H], 0 !== H && p.rotate(F * l.letterSpacing), p.save(), p.translate(0, -l.radius), l.flipArcText && p.scale(-1, -1), p.fillText(I, 0, 0), "transparent" !== l.fillStyle && (p.shadowColor = "transparent"), 0 !== l.strokeWidth && p.strokeText(I, 0, 0), p.restore();
                            l.radius -= G;
                            l.letterSpacing += G / (1E3 * F);
                            p.restore();
                        } else
                            for (v = 0; v < D.length; v += 1) r = D[v], R = l.y + v * l.height / D.length - (D.length - 1) * l.height / D.length / 2, p.shadowColor = l.shadowColor, p.fillText(r, G, R), "transparent" !== l.fillStyle && (p.shadowColor = "transparent"), 0 !== l.strokeWidth && p.strokeText(r, G, R);
                    R = 0;
                    "top" === l.baseline ? R += l.height / 2 : "bottom" === l.baseline && (R -= l.height / 2);
                    l._event && (p.beginPath(), p.rect(l.x - l.width / 2, l.y - l.height / 2 + R, l.width, l.height), T(this[A], p, l), p.closePath());
                    l._transformed && p.restore();
                }
        ca.propCache = l;
        return this;
    };
    g.fn.measureText = function(g) {
        var w, A;
        w = this.getLayer(g);
        if (!w || w && !w._layer) w = new J(g);
        if (g = K(this[0])) sa(this[0], g, w), A = Sa(g, w), ta(this[0], g, w, A);
        return w;
    };
    g.fn.drawImage = function w(A) {
        function p(l, w, p, q, r) {
            return function() {
                var v = g(l);
                null === q.width && null === q.sWidth && (q.width = q.sWidth = I.width);
                null === q.height && null === q.sHeight && (q.height = q.sHeight = I.height);
                r && (r.width = q.width, r.height = q.height);
                null !== q.sWidth && null !== q.sHeight && null !== q.sx && null !== q.sy ? (null === q.width && (q.width = q.sWidth), null === q.height && (q.height = q.sHeight), q.cropFromCenter && (q.sx += q.sWidth / 2, q.sy += q.sHeight / 2), 0 > q.sy - q.sHeight / 2 && (q.sy = q.sHeight / 2), q.sy + q.sHeight / 2 > I.height && (q.sy = I.height - q.sHeight / 2), 0 > q.sx - q.sWidth / 2 && (q.sx = q.sWidth / 2), q.sx + q.sWidth / 2 > I.width && (q.sx = I.width - q.sWidth / 2), Q(l, w, q, q.width, q.height), S(l, w, q), w.drawImage(I, q.sx - q.sWidth / 2, q.sy - q.sHeight / 2, q.sWidth, q.sHeight, q.x - q.width / 2, q.y - q.height / 2, q.width, q.height)) : (Q(l, w, q, q.width, q.height), S(l, w, q), w.drawImage(I, q.x - q.width / 2, q.y - q.height / 2, q.width, q.height));
                w.beginPath();
                w.rect(q.x - q.width / 2, q.y - q.height / 2, q.width, q.height);
                T(l, w, q);
                w.closePath();
                q._transformed && w.restore();
                ya(w, p, q);
                q.layer ? O(v, p, r, "load") : q.load && q.load.call(v[0], r);
                q.layer && (r._masks = p.transforms.masks.slice(0), q._next && v.drawLayers({
                    clear: !1,
                    resetFire: !0,
                    index: q._next
                }));
            };
        }
        var l, v, D, r, G, R, I, F, L, P = ca.imageCache;
        for (v = 0; v < this.length; v += 1)
            if (l = this[v], D = K(this[v])) r = H(this[v]), G = new J(A), R = N(this[v], G, A, w), G.visible && (L = G.source, F = L.getContext, L.src || F ? I = L : L && (P[L] && P[L].complete ? I = P[L] : (I = new Ta(), L.match(/^data:/i) || (I.crossOrigin = G.crossOrigin), I.src = L, P[L] = I)), I && (I.complete || F ? p(l, D, r, G, R)() : (I.onload = p(l, D, r, G, R), I.src = I.src)));
        return this;
    };
    g.fn.createPattern = function(w) {
        function A() {
            r = l.createPattern(D, v.repeat);
            v.load && v.load.call(p[0], r);
        }
        var p = this,
            l, v, D, r, G;
        (l = K(p[0])) ? (v = new J(w), G = v.source, da(G) ? (D = g("<canvas />")[0], D.width = v.width, D.height = v.height, w = K(D), G.call(D, w), A()) : (w = G.getContext, G.src || w ? D = G : (D = new Ta(), G.match(/^data:/i) || (D.crossOrigin = v.crossOrigin), D.src = G), D.complete || w ? A() : (D.onload = A, D.src = D.src))) : r = null;
        return r;
    };
    g.fn.createGradient = function(g) {
        var A, p = [],
            l, v, D, r, G, H, I;
        g = new J(g);
        if (A = K(this[0])) {
            g.x1 = g.x1 || 0;
            g.y1 = g.y1 || 0;
            g.x2 = g.x2 || 0;
            g.y2 = g.y2 || 0;
            A = null !== g.r1 && null !== g.r2 ? A.createRadialGradient(g.x1, g.y1, g.r1, g.x2, g.y2, g.r2) : A.createLinearGradient(g.x1, g.y1, g.x2, g.y2);
            for (r = 1; void 0 !== g["c" + r]; r += 1) void 0 !== g["s" + r] ? p.push(g["s" + r]) : p.push(null);
            l = p.length;
            null === p[0] && (p[0] = 0);
            null === p[l - 1] && (p[l - 1] = 1);
            for (r = 0; r < l; r += 1) {
                if (null !== p[r]) {
                    H = 1;
                    I = 0;
                    v = p[r];
                    for (G = r + 1; G < l; G += 1)
                        if (null !== p[G]) {
                            D = p[G];
                            break;
                        } else H += 1;
                    v > D && (p[G] = p[r]);
                } else null === p[r] && (I += 1, p[r] = v + (D - v) / H * I);
                A.addColorStop(p[r], g["c" + (r + 1)]);
            }
        } else A = null;
        return A;
    };
    g.fn.setPixels = function A(g) {
        var l, v, D, r, G, H, I, F, L;
        for (v = 0; v < this.length; v += 1)
            if (l = this[v], D = K(l)) {
                r = new J(g);
                N(l, r, g, A);
                Q(this[v], D, r, r.width, r.height);
                if (null === r.width || null === r.height) r.width = l.width, r.height = l.height, r.x = r.width / 2, r.y = r.height / 2;
                if (0 !== r.width && 0 !== r.height) {
                    H = D.getImageData(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height);
                    I = H.data;
                    L = I.length;
                    if (r.each)
                        for (F = 0; F < L; F += 4) G = {
                            r: I[F],
                            g: I[F + 1],
                            b: I[F + 2],
                            a: I[F + 3]
                        }, r.each.call(l, G, r), I[F] = G.r, I[F + 1] = G.g, I[F + 2] = G.b, I[F + 3] = G.a;
                    D.putImageData(H, r.x - r.width / 2, r.y - r.height / 2);
                    D.restore();
                }
            }
        return this;
    };
    g.fn.getCanvasImage = function(g, p) {
        var l, v = null;
        0 !== this.length && (l = this[0], l.toDataURL && (void 0 === p && (p = 1), v = l.toDataURL("image/" + g, p)));
        return v;
    };
    g.fn.detectPixelRatio = function(A) {
        var p, l, v, D, r, G, F;
        for (l = 0; l < this.length; l += 1) p = this[l], g(this[l]), v = K(p), F = H(this[l]), F.scaled || (D = U.devicePixelRatio || 1, r = v.webkitBackingStorePixelRatio || v.mozBackingStorePixelRatio || v.msBackingStorePixelRatio || v.oBackingStorePixelRatio || v.backingStorePixelRatio || 1, D /= r, 1 !== D && (r = p.width, G = p.height, p.width = r * D, p.height = G * D, p.style.width = r + "px", p.style.height = G + "px", v.scale(D, D)), F.pixelRatio = D, F.scaled = !0, A && A.call(p, D));
        return this;
    };
    Y.clearCache = function() {
        for (var g in ca) ca.hasOwnProperty(g) && (ca[g] = {});
    };
    g.support.canvas = void 0 !== g("<canvas />")[0].getContext;
    Z(Y, {
        defaults: ma,
        setGlobalProps: S,
        transformShape: Q,
        detectEvents: T,
        closePath: W,
        setCanvasFont: sa,
        measureText: ta
    });
    g.jCanvas = Y;
    g.jCanvasObject = J;
});;