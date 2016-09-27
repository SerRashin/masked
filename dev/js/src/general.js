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
            var self = this;

            /**
             * Загружаем системную маску и инициализируем все объекты
             */
            Masked.phoneCodes.loadMasks('all', MConf('lang'), function() {

                self.subscribers.forEach(function(mask) {
                    mask.start()
                });

                Masked.postload();
            });

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
var  alternativeReady = (function() {
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