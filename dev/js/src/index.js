/**
 * @var mixed doc
 * @var null type_null
 */

var plugin = function (params) {
    var self        = this;

    self.objects = [];

    self.init(params);

    if(typeof MaskedReady.use === 'undefined') {
       return alternativeReady.init(self);
    }

    return self;
};

/**
 * Открываем доступ из вне для обращения к Masked.phoneCodes
 */
plugin.phoneCodes = phoneCodes;


plugin.prototype = {
    /**
     * Первичная инициализация
     *
     * Этап выборки елементов по селектору и передача всех элементов в сервер приема сообщений [MaskedObserver]
     * @param params
     * @returns {plugin}
     */
    init:  function(params) {
        var self  = this,
            elements,
            options;

        if (params) {
            if (typeof params === 'string') {
                params = {
                    selector: params
                };
            }
            options = generalMaskedFn.extend(MConf(), params);
        }

        if (typeof params.selector !== 'undefined') {
            elements = getElements(params.selector);

        }

        if (Object.keys(elements).length) {
            MaskedObserver.add({
                self:     self,
                elements: elements,
                options:  options
            });
        }

        return self;
    },
    /**
     * Начинаем загружать масочки
     */
    start: function (elements, options) {

        var i,
            el,
            opt,
            self     = this;

        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                el   = elements[i];

                if (el) {
                    opt = generalMaskedFn.extend(generalMaskedFn.extend({}, options), el.dataset);
                    var object = new Mask(el, opt);
                    self.objects.push(object);
                }
            }
        }
    },
};
