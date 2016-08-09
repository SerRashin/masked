/**
 * @var mixed doc
 * @var null type_null
 */

var Global = {
    initialization: true,
    instances: [],
    countries: [], // коды стран которые необходимо дополнительно подключить
};

var plugin = function (options) {
    var self        = this;
    self.elements   = [];
    self.options    = {
        lang:       MConf('lang'),
        country:    MConf('country')
    };

    self.init(options);

    if(typeof MaskedReady.use === type_undefined) {
        alternativeReady.init();
    }
    
    return self;
};

/**
 * После отгрузки всех масок проинициализируем все еще раз с доп масками если есть
 */
plugin.postload = function () {
    var i,
        c,
        iso,
        object,
        country,
        pc = phoneCodes,
        g = Global,
        ge = g.instances,
        gc = g.countries;

    for(i in gc) {
        if(gc.hasOwnProperty(i)) {
            country = gc[i];
            if (isset(pc[country.iso_code]) && empty(pc[country.iso_code])) {

                pc.loadMasks(country.iso_code, country.lang, function () {
                    for (i in ge) {
                        if(ge.hasOwnProperty(i)) {
                            object = ge[i];
                            c = {'iso_code': object.opt.country, 'lang': object.opt.lang };


                            if(languageIsset(gc, c)) {
                                object.maskFinder(object.opt.phone, object.opt.country);
                            }

                        }
                    }
                });
            }
        }
    }

    g.initialization = false;
};

/**
 * Получить инстанс
 * @param e
 * @returns {*}
 */
plugin.getInst = function (e) {
    return Global.instances[e.className.match(new RegExp(MConf('prefix') + '[0-9a-zA-Z]+'))];
};

/**
 * Открываем доступ из вне для обращения к Masked.phoneCodes
 */
plugin.phoneCodes = phoneCodes;


plugin.getById = function (id) {
    var el = document.getElementById(id);
    if(el !== null){
        return this.getInst(el);
    }
    return false;
}

/**
 * Переключение статуса
 * @param e Элемент или класс
 */
plugin.toggle = function(e) {
    var self = this.getInst(e),
        opt  = self.opt;

    if (!empty(e.parentNode) && e.parentNode.className === 'CBH-masks') {
        e.parentNode.outerHTML = opt.oldState;
    } else {
        opt.element = e;
        self.setTemplate();
        opt.element.value       = opt.value;
        self.addActions(opt.element);
    }
}


plugin.prototype = {
    init:  function(options) {
        var self      = this;

        if (options) {
            if (typeof options === 'string') {
                options = {
                    selector: options
                };
            }
            self.options = generalMaskedFn.extend(self.options, options);
        }

        if (typeof options.selector !== type_undefined) {

            /**
             * Вернет массив елементов
             *
             * @param options
             */
            function select(options) {
                var i,
                    elem,
                    first_digit,
                    elements = [],
                    selector = options.selector;

                if ( typeof selector === 'string' ) {
                    first_digit = selector[0];

                    if ( (first_digit === '.') || (first_digit === '#') ) {
                        selector = selector.substr(1);
                    }

                    if (first_digit === '.') {
                        elem = doc.getElementsByClassName( selector );
                        for(i in elem) {
                            if (elem.hasOwnProperty(i) && elem[i] !== type_null) {
                                elements[elem[i].id||i] = elem[i];
                            }
                        }
                    } else if (first_digit === '#') {
                        elem = doc.getElementById( selector );
                        if (elem !== type_null) {
                            elements.push(elem);
                        }
                    } else {
                        console.log('selector finder empty');
                    }
                } else if (selector.nodeType) {
                    if (selector !== type_null) {
                        elements.push(selector);
                    }
                }
                return elements;
            }

            self.elements = select(options);
        }

        if (Object.keys(self.elements).length) {
            MaskedObserver.add(self);
        }

        return self;
    },

    start: function () {
        var i,
            el,
            opt,
            object,
            self     = this,
            elements = self.elements;

        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                el   = elements[i];
                if (!el.className.match(new RegExp(MConf('prefix') + '[0-9a-zA-Z]+'))) {
                    opt = generalMaskedFn.extend(generalMaskedFn.extend({}, self.options), el.dataset);

                    object = new Mask(el, opt);
                    Global.instances[object.opt.instId] = object;
                }
            }
        }
    }
};
