var plugin = {
    path:   opt.path,
    prefix: opt.prefix,
    regex:  new RegExp('[0-9]'),
    instances:[],
    loaded:true,
    init: function (selector, args) {
        var i,
            f_e,
            tId,
            elements = [],
            self     = this,
            elem,
            doc      = document;
        if ( typeof selector === "string" ) {
            f_e = selector[0];
            if ( (f_e === '.') || (f_e === '#') ) {
                selector = selector.substr(1);
            }
            if (f_e === '.') {
                elem = doc.getElementsByClassName( selector );
                for(i in elem) {
                    if (elem.hasOwnProperty(i) && elem[i] !== null) {
                        elements[elem[i].id||i] = elem[i];
                    }
                }
            } else if (f_e === '#') {
                elem = doc.getElementById( selector );
                if (elem !== null) {
                    elements.push(elem);
                }
            } else {
                return ;
            }
        } else if(selector.nodeType) {
            if (selector !== null) {
                elements.push(selector);
            }
        }
        if (self.loaded === false) {
            tId = setInterval(function() {
                if (self.loaded === true) {
                    self.loop(elements, args);
                    clearInterval(tId);
                }
            }, 10);
        } else {
            self.loop(elements, args);
        }
    },
    loop: function (elements, args) {
        var i,
            el,
            opt,
            self = this;
        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                el   = elements[i];
                opt  = self.extend(self.extend({}, args), el.dataset);

                if (phoneCodes.all.length === 0) {
                    self.loaded = false;
                    self.loadMasks('all', opt.lang, function () {
                        self.loop(elements, opt);
                    });
                    break;
                } else {
                    self.preload(el, opt);
                }
            }
        }
    },
    preload:function (el, opt) {
        var self = this,
            obj  = new inpClass(el, opt);
        self.instances[obj.opt.instId] = obj;
    },
    loadMasks: function (type, lang, callback) {
        var self  = this,
            pc    = phoneCodes,
            _true = true;
        $AJAX({
            url:         self.path + type + '/' + (lang == 'ru' ? 'ru' : 'en') + '.min.json',
            type:        "GET",
            async:       _true,
            crossDomain: _true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                pc[type] = pc.sortPhones(responce, "mask", 'desc');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    },
    selectInstance: function (e) {
        var p = plugin;
        return p.instances[e.className.match(new RegExp(p.prefix+'[0-9a-zA-Z]+'))];
    },
    extend: function ( defaults, options ) {
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
    },
    findPos: function (obj) {
        var curleft = 0,
            curtop  = 0;
        if (obj && obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return {
            left: curleft,
            top: curtop
        };
    },
    getById: function (id) {
        var el = document.getElementById(id);
        if(el !== null){
            return this.selectInstance(el);
        }
        return false;
    }
};