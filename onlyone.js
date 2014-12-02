/*
--------------------------------
OnlyOne
--------------------------------
+ https://github.com/sendlo/OnlyOne
+ version 0.1
+ Copyright 2013 Mike Sendlakowski
+ Licensed under the MIT license

Allows only one instance of a specified DOM object to exist on any tab in the browser.
If a second instance is created in a different tab then the first tab will be notified next time it gains focus.

Limitations:

1) Only works on browsers that support local storage.
2) Doesn't work on incognito browser instances.
3) Doesn't work across browsers (for example, an instance of IE won't trigger a duplication on Chrome)


Usage:

$.onlyOne({
    selector: '',       // jQuery selector to identify objects to monitor for.
    eventId: ''         // Id of a custom event attached to the document which will be triggered if a duplicate is found.
});

*/

(function($) {
    'use strict';

    var localStorageSupported = false,
        monitorList = [];

    var init = function() {
        testLocalStorage();
        if (!localStorageSupported) {
            return false;
        }
        $(window).on('focus', monitor);
    };

    var monitor = function() {
        var monitorItem;
        for (var i = 0, j = monitorList.length; i < j; i++) {
            monitorItem = monitorList[i];
            if (monitorItem.inst !== localStorage['onlyone.' + monitorItem.id]) {
                $(document).trigger(monitorItem.eventId);
            }
        }
    };

    var addMonitor = function(config) {
        config.selector = config.selector || '';

        var $obj = $(config.selector).first(),
            timeStamp = new Date().getTime().toString(),
            monitorId = 'm' + config.selector.replace('.', '-'),
            localStorageObj;

        if (!localStorageSupported || !config.eventId || $obj === $() || $obj.length === 0) {
            return false;
        }

        monitorList.push({
            id: monitorId,
            inst: timeStamp,
            eventId: config.eventId
        });

        localStorage['onlyone.' + monitorId] = timeStamp;
    };

    var testLocalStorage = function() {
        var mod = 'onlyone';
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            localStorageSupported = true;
        } catch (e) {
        }
    };

    var onlyOne = function() {
        init();
        return {
            add: function(config) {
                return addMonitor(config);
            }
        };
    };

    $.onlyOne = function(method, args) {
        var $body = $('body'),
            instance = $body.data('onlyOne');
        if (!instance) {
            instance = new onlyOne();
            $body.data('onlyOne', instance);
        }
        if ($.isFunction(instance[method])) {
            return instance[method].apply(this, [args]);
        }
    };

})(jQuery);
