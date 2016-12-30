/**
 * @var mixed doc
 * @var null type_null
 * @TODO getInst ???
 * @TODO getPhone
 * @TODO isValid
 * @TODO toggle
 * @TODO o.setPhone
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
plugin.toggle = function(e) {
    var i,
        instance,
        toggled_element,
        instances = Global.instances;


    for (i in instances) {
        if (instances.hasOwnProperty(i)) {
            instance = instances[i];

            console.log(e , instance.opt.oldState);
            if (e === instance.opt.element || e === instance.opt.oldState) {
                toggled_element = instance;
            }
        }
    }
    console.log(toggled_element);
    if (toggled_element) {
        var opt = toggled_element.opt,
            element = opt.element;

        if (!empty(e.parentNode) && e.parentNode.className === 'CBH-masks') {

            e.parentNode.outerHTML = opt.oldState.outerHTML;
        }
        else {
            console.log('set template');
            //instance.setTemplate();
        //     element.value       = element.value;
        //     instance.addActions(element);
        }
    }


};


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
            opt;

        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                el   = elements[i];

                if (el) {
                    opt = generalMaskedFn.extend(generalMaskedFn.extend({}, options), el.dataset);
                    var object = new Mask(el, opt);
                   // self.objects.push(object);
                    Global.instances.push(object);
                }
            }
        }
    },
};
