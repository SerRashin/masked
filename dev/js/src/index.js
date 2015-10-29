var plugin = {
    path:   opt.path,
    prefix: opt.prefix,
    regex:  new RegExp(/[0-9]/),
    instances:[],
    loaded:true,
    init: function (selector, args) {
        var elements = [],
            self     = this,
            elem,
            doc      = document;
        if ( typeof selector === "string" ) {
            var f_e = selector[0];
            if ( (f_e === '.') || (f_e === '#') ) {
                selector = selector.substr(1);
            }
            if (f_e === '.') {
                elem = doc.getElementsByClassName( selector );
                for(i in elem) {
                    if (elem.hasOwnProperty(i)) {
                        if (elem[i] !== null) {
                            elements[elem[i].id||i] = elem[i];
                        }
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
            var tId = setInterval(function() {
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
        for(i in elements) {
            if (elements.hasOwnProperty(i)) {
                var self = this,
                    el   = elements[i],
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
        $AJAX({
            url:         this.path + type + '/' + (lang='ru'?'ru':'en') + '.min.json',
            type:        "GET",
            async:       true,
            crossDomain: true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                phoneCodes[type] = phoneCodes.sortPhones(responce, "mask", 'desc');

                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    },
    selectInstance: function (e) {
        return plugin.instances[e.className.match(new RegExp(/instId_[0-9a-zA-Z]+/))];
    },
    extend: function ( defaults, options ) {
        var extended = {};
        var prop;
        var prototype = Object.prototype.hasOwnProperty;
        for (prop in defaults) {
            if (prototype.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (prototype.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    },
    findPos: function (obj) {
        var curleft = curtop = 0;
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


