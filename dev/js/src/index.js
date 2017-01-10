/**
 * @var mixed doc
 * @var null type_null
 */

var plugin = function (params) {
    var self        = this;

    self.paths = [];
    self.ready = false;

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
    var self = this.getInst(e),
        opt  = self.opt;

    if (self) {
        if (!empty(e.parentNode) && e.parentNode.className === 'CBH-masks') {
            e.parentNode.outerHTML = opt.oldState.outerHTML;
        } else {
            opt.element = e;
            self.setTemplate();
            self.addActions(opt.element);
        }
    }
};

plugin.getPhone = function (value) {
    return value ? plugin.prototype.getPhone(value) : false;
};

plugin.isValid = function (value) {
    return value ? plugin.prototype.isValid(value) : false;
};



/**
 * Получить инстанс
 * @param e
 * @returns {*}
 */
plugin.getInst = function (e) {
    var i,
        instance,
        toggled_element,
        instances = Global.instances;


    for (i in instances) {
        if (instances.hasOwnProperty(i)) {
            instance = instances[i];

            if (getElementPath(e) === instance.opt.xpath) {
                toggled_element = instance;
                break;
            }
        }
    }
    return  toggled_element;
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
            opt,
            self = this;

        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                el   = elements[i];

                if (el) {
                    opt = generalMaskedFn.extend(generalMaskedFn.extend({}, options), el.dataset);
                    var object = new Mask(el, opt);
                    self.paths.push(object.opt.xpath);

                    Global.instances.push(object);
                    self.ready = true;
                }
            }
        }
    },

    /**
     * Получить форматированную маску по номеру телефона, или объекту/объектам макси
     * вернет строку или массив, можно вернуть номер без маски
     * @param value
     * @param _with_mask
     * @returns {string}|{object}
     */
    getPhone: function (value, _with_mask) {
        var self = this,
            phone,
            context,
            mask,
            with_mask  = _with_mask || true;

        if (value) {
            context = new Mask(null, MConf());
            mask = context.findMask(value);
            if (mask) {
                phone = getNewMaskValue(
                    value,
                    mask.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
                );
            }
        } else {
            if (!self.ready) {
                return false;
            }
            var path      = self.paths[0];

            context = getInstanceByXpath(path);

            if (context) {
                phone = context.opt.element.value;
            }
        }

        if (!with_mask) {
            phone = getPhone(phone);
        }

        return phone;
    },

    setPhone: function (value) {
        var self = this;
        if (self.ready) {
            getInstanceByXpath(this.paths[0]).findMask(value ? value : false);
        }
    },

    isValid: function (value) {
        var phone,
            mask,
            context,
            valid      = false;

        if (value) {
            context = new Mask(null, MConf());
            mask = context.findMask(value);

            phone = getNewMaskValue(
                value,
                mask.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
            );
        } else {

            if (!this.ready) {
                return false;
            }

            var path      = this.paths[0];

            if (path) {
                context = getInstanceByXpath(path);

                if (context) {
                    phone = context.opt.element.value;
                }
            }
        }

        if (phone) {
            valid = phone.indexOf('_') === -1;
        }

        return valid;
    },
};