var Global = {
    pre: [],
    initialization: false,
    instances: [],
    countries: { // коды стран которые необходимо дополнительно подключить
        all:    [],     // список масок для всех стран
        ae:     [],     //
        an:     [],     //
        ba:     [],     //
        bt:     [],     //
        ca:     [],     // список кодов для канады
        cn:     [],     //
        de:     [],     //
        ec:     [],     //
        ee:     [],     //
        id:     [],     //
        il:     [],     //
        jp:     [],     //
        kp:     [],     //
        la:     [],     //
        lb:     [],     //
        ly:     [],     //
        mc:     [],     //
        mm:     [],     //
        mx:     [],     //
        my:     [],     //
        ng:     [],     //
        nz:     [],     //
        ru:     [],     // список кодов для россии
        sa:     [],     //
        sb:     [],     //
        so:     [],     //
        sr:     [],     //
        th:     [],     //
        tl:     [],     //
        tv:     [],     //
        tw:     [],     //
        ua:     [],     // список кодов для Украины
        us:     [],     // список кодов для США
        vn:     [],     //
        vu:     [],     //
        ye:     [],     //
    }
};

/**
 * Сервер подписки объектов
 */
var MaskedObserver = (function() {
    function MObserver() {
        this.subscribers = [];
    }

    MObserver.prototype = {
        /**
         * Добавляем в наш обсервер объект для отслеживания
         *
         * @param options
         */
        add: function (options) {
            this.subscribers.push(options);
        },

        /**
         * Отправляем всем объектам уведомление, что пора стартовать работу инпутов
         */
        notify: function () {
            var self = this,
                languages = [],
                /**
                 * Загружаем системную маску и инициализируем все объекты
                 */
                callback = function () {
                    self.subscribers.forEach(function(mask) {
                        mask.self.start(mask.elements, mask.options);
                    });

                    self.subscribers = []; // сброс подписчиков в ноль

                    if (MaskedSubListObserver.subscribers.length > 0) {
                        MaskedSubListObserver.notify();
                    } else {
                        Global.initialization = false;
                    }

                };

            Global.initialization = true;
            if (self.subscribers) {
                for(var i in self.subscribers) {
                    if(self.subscribers.hasOwnProperty(i)) {
                        languages.push(self.subscribers[i].options.lang);
                    }
                }
            }

            Masked.phoneCodes.loadMask('all', languages, function() {
                callback();
            });
        }
    };

    return new MObserver();
})();


var MaskedSubListObserver = (function() {
    function MObserver() {
        this.subscribers = [];
    }

    MObserver.prototype = {
        /**
         * Добавляем в наш обсервер объект для отслеживания
         *
         * @param options
         */
        add: function (options) {
            this.subscribers.push(options);
        },

        /**
         * Отправляем всем объектам уведомление, что пора стартовать работу инпутов
         */
        notify: function () {
            var object,
                subscriber,
                self        = this,
                languages   = [],
                countries   = [],
                objects     = [],
                subscribers = self.subscribers;

            for (var i in subscribers) {
                if (subscribers.hasOwnProperty(i)) {
                    subscriber = subscribers[i];
                    objects.push(subscriber.object);
                    languages.push(subscriber.language);
                    countries.push(subscriber.country);
                }
            }

            Masked.phoneCodes.loadMask(countries, languages, function() {
                for (var i in objects) {
                    if (objects.hasOwnProperty(i)) {
                        object = objects[i];
                        object.findMask(object.opt.phone);
                    }
                }
            });

            Global.initialization = false;
            self.subscribers = []; // сброс подписчиков в ноль
        }
    };

    return new MObserver();
})();

var $M = MaskedReady = (function() {
    return function (callback) {
        this.use = true;
        callback();
        MaskedObserver.notify();
    };
})();
$M.ready = $M;

/**
 * Этот способ намного хуже способа с оберткой через $M.ready
 */
var alternativeReady = (function() {
    return {
        timerID: 0,
        init: function() {

            if (this.timerID) {
                clearTimeout(this.timerID);
            }

            this.timerID = setTimeout(function() {
                MaskedObserver.notify();
            }, 250);
        }
    };
})();

/**
 * Объект хелперов нужных во всех частях программы
 */
var generalMaskedFn = {
    extend: function (defaults, options) {
        var i,
            extended = {},
            prototype = Object.prototype.hasOwnProperty;

        for (i in defaults) {
            if (defaults.hasOwnProperty(i) && prototype.call(defaults, i)) {
                extended[i] = defaults[i];
            }
        }
        for (i in options) {
            if (options.hasOwnProperty(i) && prototype.call(options, i)) {
                extended[i] = options[i];
            }
        }
        return extended;
    }
};