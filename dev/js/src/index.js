var plugin = {
    path:'//test.proj/codes/',
    prefix:'instId_',
    regex: new RegExp(/[0-9]/),
    instances:[],
    init: function (selector, args) {
        var elements = [],
            elem     = und,
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
        for(i in elements) {
            if(elements.hasOwnProperty(i)) {
                this.preload(elements[i], args);
            }
        }
    },
    preload:function (el, args) {
        var self = this,
            opt  = self.extend(self.extend({}, args), el.dataset);
        if (phoneCodes.all.length===0) { // or froom  storage
            self.loadMasks('all', opt.lang);
        }
        var obj = new inpClass(el, opt);
        self.instances[obj.opt.instId] = obj;
    },
    loadMasks: function (type, lang) {
        $AJAX({
            url:         this.path + type + '/' + (lang='ru'?'ru':'en') + '.json',
            type:        "GET",
            async:       false,
            crossDomain: true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                if(type === 'all') {
                    phoneCodes[type] =  phoneCodes.sortPhones(responce ,"mask",'desc');
                } else {
                    phoneCodes[type] =  phoneCodes.sortPhones(responce, "mask",'desc');
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
    },
    cbh_phones:phoneCodes
};


