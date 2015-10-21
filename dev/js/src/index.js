var plugin = {
    path:'//test.proj/codes/',
    prefix:'instId_',
    regex: new RegExp(/[0-9]/),
    instances:[],
    init: function (selector, args) {
        var elements = [];
        if ( typeof selector === "string" ) {
            var f_e = selector[0];
            if ( (f_e === '.') || (f_e === '#') ) {
                selector = selector.substr(1);
            }
            if (f_e === '.') {
                var elements = document.getElementsByClassName( selector );
            } else if (f_e === '#') {
                elements.push(document.getElementById( selector ));
            } else {
                return ;
            }
        } else if(selector.nodeType) {
            elements.push(selector);
        }

        for(i in elements) {
            if(elements.hasOwnProperty(i)) {
                this.preload(elements[i], args);
            }
        }
    },
    preload:function (el, args) {
        var u = 'undefined';
        var opt = {
            lang: el.dataset.lang ? el.dataset.lang : (typeof args !== u && args.lang ? args.lang : false),
            country: el.dataset.country ? el.dataset.country : (typeof args !== u && args.country ? args.country : false),
            phone: el.dataset.phone ? el.dataset.phone : (typeof args !== u && args.phone ? args.phone : false)
        };

        if (phoneCodes.all.length===0) { // or froom  storage
            this.loadMasks('all', opt.lang);
        }

        var obj = new inpClass(el, opt);
        this.instances[obj.opt.instId] = obj;
    },
    loadMasks: function (type, lang) {
        $.AJAX({
            url:         this.path + type + '/' + lang + '.json',
            type:        "GET",
            async:       false,
            crossDomain: true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                phoneCodes[type] = responce;
            }
        });
    },
    selectInstance: function (e) {
        return plugin.instances[e.className.match(new RegExp(/instId_[0-9a-zA-Z]+/))];
    }
};


