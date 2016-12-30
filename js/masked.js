/**! 
* Masked - v1.1.0 - 
* 
* @author Rashin Sergey 
* @version 1.1.0 2016-12-30
*/


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

var MaskedConfig = MConf = (function() {

    var exception_example = {
        'ru' : {
            localFormat:'8',
            exceptions: {
                '8975': '7975'
            }
        }
    };

    var options = {
        pathToList:         '/js/masks/',
        prefix:             'instId_',
        lang:               'ru',
        country:            'ru',
        one_country:        false, // false or string 'iso_code'
        first_countries:    ['ru'],
        exceptions:         exception_example,
        initial_focus:      false,
        select_range:       false,
        onToggleList:       null,
        onShowList:         null,
        onHideList:         null,
        onSend:             null,
        onValueChanged:     null,
        popup_direction:    'auto'
    };

    
    return function (args) {
        if (typeof args === 'string') {
            return options[args];
        } else {
            for (var i in args) {
                if (args.hasOwnProperty(i) && typeof options[i] === 'undefined') {
                    console.warn('masked argument not exists');
                }
            }
            return options = generalMaskedFn.extend(options, args);
        }
    };
})();


var Masked = (function(doc, win) {
    var type_undefined      = 'undefined',
    type_null           = 'null',
    _regex          =  new RegExp('[0-9]');
/**
 * Обработчик событий
 *
 * @type {{add, remove}}
 */
var Event = (function() {
    var guid = 0;
    var win = window;
    var doc = document;
    function fixEvent(_event) {
        var event = _event || win.event;
        if ( event.isFixed ) {
            return event;
        }
        event.isFixed = true;
        event.preventDefault = event.preventDefault || function(){this.returnValue = false};
        event.stopPropagation = event.stopPropagation || function(){this.cancelBubble = true};
        if (!event.target) {
            event.target = event.srcElement;
        }
        if (!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }
        if ( event.pageX == null && event.clientX != null ) {
            var html = doc.documentElement,
                body = doc.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }
        if ( !event.which && event.button ) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }
        return event
    }
    function commonHandle(_event) {
        var i,
            event = fixEvent(_event),
            handlers = this.events[event.type];
        for ( i in handlers ) {
            if (!handlers.hasOwnProperty(i)) {
                continue;
            }
            var handler = handlers[i];
            var ret = handler.call(this, event);
            if ( ret === false ) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    return {
        add: function(elem, type, handler) {
            if (elem.setInterval && ( elem != win && !elem.frameElement ) ) {
                elem = win;
            }
            if (!handler.guid) {
                handler.guid = ++guid;
            }
            if (!elem.events) {
                elem.events = {};
                elem.handle = function(event) {
                    if (isset(Event)) {
                        return commonHandle.call(elem, event);
                    }
                }
            }
            if (!elem.events[type]) {
                elem.events[type] = {};
                if (elem.addEventListener)
                    elem.addEventListener(type, elem.handle, false);
                else if (elem.attachEvent)
                    elem.attachEvent("on" + type, elem.handle);
            }
            elem.events[type][handler.guid] = handler;
        },
        remove: function(elem, type, handler) {
            var i,
                handlers = elem.events && elem.events[type];
            if (!handlers) return;
            delete handlers[handler.guid];
            for(i in handlers) {
                if (!handlers.hasOwnProperty(i)) {
                    continue;
                }

                return;
            }
            if (elem.removeEventListener)
                elem.removeEventListener(type, elem.handle, false);
            else if (elem.detachEvent)
                elem.detachEvent("on" + type, elem.handle);
            delete elem.events[type];
            for (i in elem.events) {
                if (!elem.events.hasOwnProperty(i)) {
                    continue;
                }

                return;
            }
            try {
                delete elem.handle;
                delete elem.events;
            } catch(e) { // IE
                elem.removeAttribute("handle");
                elem.removeAttribute("events");
            }
        }
    }
}());

/**
 *  SUPPOORT
 *
 *   CORS is supported in the following browsers:
 *
 *   Chrome 3+
 *   Firefox 3.5+
 *   Opera 12+
 *   Safari 4+
 *   Internet Explorer 8+
 *
 * @author Sergey Rashin
 * @link https://github.com/serhanters/sAJAX
 */
var sAJAX = function (obj) {
    var i,
        res,
        url,
        xhr,
        status,
        statusText,
        callback,
        responses = {},
        und       = 'undefined',
        availableType       = ['GET', 'POST', 'PUT'],
        availableDataType   = ['json', 'text'],
        headers             = {},
        xmlhttpobj          = XMLHttpRequest,
        Msxml2              = 'Msxml2.XMLHTTP',
        args = {
            url:            obj.url             || false,
            async:          obj.async           || false,
            data:           obj.data            || null,
            crossDomain:    obj.crossDomain     || false,
            complete:       obj.result          || function(){},
            timeout:        obj.timeout         || 10000,
            type:           ( availableType.indexOf(obj.type) !== -1 ? obj.type : null )                || "GET",
            dataType:       ( availableDataType.indexOf(obj.dataType) !== -1 ? obj.dataType : null )    || "json"
        },
        makeQueryString      = function(data) {
            var query = [];
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    query.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
                }
            }
            return query.join('&');
        };

    if (empty(args.url)) {
        return;
    }

    if (typeof xmlhttpobj == und){
        xmlhttpobj = function () {
            try {
                var activex_obj = ActiveXObject;
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2+'.6.0' );
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2+'.3.0' );
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2 );
            } catch ( e ) {}
            throw new Error( 'This browser does not support XMLHttpRequest.' );
        };
    }
    xhr = new (("onload" in new xmlhttpobj()) ? xmlhttpobj : XDomainRequest)();

    url = args.url;

    if (typeof args.data === 'string') {
        try {args.data = JSON.parse(args.data);} catch ( e ) {}
    }

    if (typeof args.data === 'object') {
        args.data = makeQueryString(args.data);
    }

    if (args.type === 'GET' && args.data && args.data.length>0) {
        url = args.url + '?' +args.data.toString();
    }
    xhr.open( args.type, url, args.async );

    if ( !args.crossDomain ) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }

    for ( i in headers ) { // Support: IE<9
        if ( headers.hasOwnProperty(i) && isset(headers[ i ]) ) {
            xhr.setRequestHeader( i, headers[ i ] + "" );
        }
    }

    if (args.data && args.data.toString().length>0) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        args.data = args.data.toString();
    }

    try {
        xhr.send(args.data || null);
    } catch ( e ) {}

    if  (args.async) {
        var timeout = setTimeout( function() {
            xhr.abort();
        }, args.timeout);
    }

    callback = function() {
        if ( xhr.readyState === 4  ) {
            if  (args.async) {
                clearTimeout(timeout);
            }
            callback = 'undefined';
            if ( xhr.readyState !== 4 ) {
                xhr.abort();
            } else {
                status = xhr.status;
                if ( typeof xhr.responseText === "string" ) {responses.text = xhr.responseText;}
                try {statusText = xhr.statusText;} catch( e ) {statusText = "";}
                if ( !status && !args.crossDomain ) {
                    status = responses.text ? 200 : 404;
                } else if ( status === 1223 ) {
                    status = 204;
                }
            }
        }

        if ( responses ) {
            if ( !status && !args.crossDomain ) {
                status = responses.text ? 200 : 404;
            } else if ( status === 1223 ) {
                status = 204;
            }
            if (status === 200) {
                if(args.dataType === 'text') {
                    res = responses.text || '';
                } else if (args.dataType === 'json') {
                    try {
                        res = JSON.parse(responses.text) || '';
                    } catch ( e ) {
                        res = '';
                    }
                }
                /**
                 * @param a responce result
                 * @param b responce code
                 * @param c response text
                 * @param d header for responce
                 */
                args.complete(res, status, statusText, xhr.getAllResponseHeaders());
            }
        }
    };

    if ( !args.async ) {
        callback();
    } else if ( xhr.readyState === 4 ) { // (IE6 & IE7) if it's in cache and has been
        setTimeout( callback, 20 );
    } else {
        xhr.onreadystatechange = callback;
    }
};

/**
 * Проверяет переменную на существование
 * @returns {boolean}
 */
function isset() {
    var a  = arguments,
        l  = a.length,
        i  = 0,
        u  = undefined,
        uu = ''+u;

    while (i !== l) {
        if (a[i] === u || typeof a[i] === uu || a[i] === null) {
            return false;
        }
        i++;
    }

    return true;
}

/**
 * Проверяет переменную на пустоту
 * @returns {boolean}
 */
function empty()  {
    var a  = arguments,
        l  = a.length,
        i  = 0,
        i2 = 0,
        u  = undefined,
        uu = ''+ u,
        ev = [u, false, ''],
        el = ev.length;
    while (i !== l) {
        for (i2 = 0; i2 < el; i2++) {
            if (typeof a[i] === uu || a[i] === ev[i2] || a[i].length === 0) {
                return true;
            }
        }
        i++;
    }
    return false;
}

/**
 * Добавляет класс
 *
 * @param o
 * @param c
 */
function addClass(o, c) {
    var object_class = o.className;
    if (new RegExp("(^|\\s)" + c + "(\\s|$)", "g").test(object_class)) return;
    o.className = (object_class + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}

/**
 * Удаляет класс
 * @param o
 * @param c
 */
function removeClass(o, c) {
    o.className = o.className.replace(new RegExp("(^|\\s)" + c + "(\\s|$)", "g"), "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}

/**
 * Проверяет есть ли в родительском елементе указанный
 *
 * @param c Child node
 * @param p Parent node
 * @returns {boolean}
 */
function childOf(c,p){ //returns boolean
    while((c=c.parentNode)&&c!==p);
    return !!c;
}

/**
 * Получить значение маски без символов только int
 * @param value
 * @returns {string}
 */
function getPhone(value) {
    return (value+'').replace(/\D+/g,"");
}

/**
 * Вернуть заполненное значение маски
 *
 * @param _value
 * @param _mask
 * @returns {string}
 */
function getNewMaskValue(_value, _mask) {
    var i,
        digit,
        value       = getPhone(_value),
        mask        = _mask.split(''),
        len         = 0;
    for (i in mask) {
        if (mask.hasOwnProperty(i)) {
            digit = mask[i];
            if (digit == '_') {
                if (len < value.length) {
                    mask[i] = value[len];
                    len++;
                }
            }
        }
    }
    return mask.join('');
}









function languageIsset(_array, _object) {
    var a = false;
    for(var i in _array) {
        if(_array.hasOwnProperty(i)) {
            if (_array[i].iso_code === _object.iso_code && _array[i].lang === _object.lang) {
                a = true;
                break;
            }
        }
    }

    return a;
}

function isFunction(a) {
    return typeof a === 'function';
}

function getElements(selector) {
    var i,
        element,
        elements = [],
        first_digit;
    if ( typeof selector === 'string' ) {
        first_digit = selector[0];

        if ( (first_digit === '.') || (first_digit === '#') ) {
            selector = selector.substr(1);
        }

        if (first_digit === '.') {
            element = doc.getElementsByClassName( selector );
            for(i in element) {
                if (element.hasOwnProperty(i) && element[i] !== type_null) {
                    elements[element[i].id||i] = element[i];
                }
            }
        } else if (first_digit === '#') {
            element = doc.getElementById( selector );
            if (element !== type_null) {
                elements.push(element);
            }
        } else {
            console.warn('selector finder empty');
        }
    } else if (selector.nodeType) {
        if (selector !== type_null) {
            elements.push(selector);
        }
    }

    return elements;
}

Array.prototype.getUnique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
};

Math.sign = Math.sign || function(x) {
    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) {
        return x;
    }
    return x > 0 ? 1 : -1;
};

var phoneCodes = {

    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @param k
     * @param s
     * @returns {*}
     */
    sortPhones:function (maskList, k, s) {
        var txt_mask = 'mask',
            txt_desc = 'desc',
            txt_asc  = 'asc',
            key      = (k  == txt_mask) ? txt_mask : 'name',
            sort     = (s == txt_desc) ? txt_desc : txt_asc;

        if (maskList) {
            maskList.sort(function (a, b) {
                if (!isset(a[key]) || !isset(b[key])) {
                    return !isset(a[key]) ? 1 : -1;
                }

                if (key === txt_mask) {
                    a = a[key].replace(/\D+/g,"");
                    b = b[key].replace(/\D+/g,"");
                } else {
                    a = a[key];
                    b = b[key];
                }
                if (a > b) {
                    return sort==txt_asc ? 1:-1;
                } else if (a < b) {
                    return sort==txt_asc ? -1:1;
                } else {
                    return 0;
                }
            });
        }

        return maskList;
    },

    /**
     * Загрузить маску
     *
     * @param type
     * @param lang
     * @param callback
     */
    loadMask: function (types, languages, callback) {
        var self  = this,
            gc    = Global.countries;

        var type = typeof types === 'string' ? [types] : types.splice(0,1)[0];
        var lang = typeof languages === 'string' ? [languages] : languages.splice(0,1)[0];

        if (typeof type !== 'undefined' && typeof gc[type] === 'undefined') {
            return self.loadMask(types, languages, callback);
        }

        if (typeof gc[type][lang] !== 'undefined' && gc[type][lang].length > 0) {
            if (languages.length === 0) {
                return callback();
            } else {
                self.loadMask(types, languages, callback);
            }
        } else {
            sAJAX({
                url:         MConf('pathToList') + type + '/' + (!empty(lang) ? lang : 'ru') + '.min.json',
                type:        'GET',
                async:       true,
                crossDomain: true,             /// при crossdomain не возможен заголовок XMLHttpRequest
                dataType:    'json',
                result: function (responce) {
                    gc[type][lang] = self.sortPhones(responce, 'mask', 'desc');

                    if (languages.length === 0 && isFunction(callback)) {
                        return callback();
                    } else {
                        self.loadMask(types, languages, callback)
                    }
                }
            });
        }

        return true;
    },

    findMaskByCode: function(type, code, language) {
        var i,
            one,
            self = this,
            gc    = Global.countries,
            sortedCodes = self.sortPhones(gc[type][language], 'name', 1);

        if (sortedCodes.length > 0) {
            for (i in sortedCodes) {
                if (sortedCodes.hasOwnProperty(i)) {
                    one = sortedCodes[i];
                    /**
                     * @namespace one.iso_code Код страны
                     */
                    if (one.iso_code === code) {
                        return one;
                    }
                }
            }
        }

        return false;
    }
};
var actions = {

    /**
     * При фокусе на поле ввода
     * @return void
     */
    focus: function () {
       this.focused();
    },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    click: function () {
        var self = this;

        if (self.opt.select_range !== false) {
            self.setRange();
        } else {
            self.focused();
        }
    },

    /**
     * При двойном нажатии
     * @return void
     */
    dblclick:function () {
        actions.click.bind(this);
    },

    /**
     * При потери фокуса
     * @return boolean
     */
    blur: function () {
        var self = this;
        if (self.opt.select_range !== false) {
            self.unsetRange();
        }

        return true;
    },

    /**
     * При вставке номера телефона
     * @param e
     * @return void
     */
    paste: function(e) {
        e.preventDefault();
        this.findMask(getPhone((e.originalEvent || e).clipboardData.getData('text/plain')));
    },

    /**
     * При нажатии клавиши
     * @return void|boolean
     */
    keydown: function (e) {
        var index,
            num,
            self        = this,
            element     = self.opt.element,
            code        = e.which || e.keyCode,
            ctrlKey     = e.ctrlKey||e.metaKey,
            key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
            value       = element.value,
            select_range= self.opt.select_range;

        if (code === 8) {  // BACKSPACE
            index = self.getLastNum();
            if (_regex.test(value[index]) === true) {

                if (select_range !== false) {
                    if (select_range.focus === true) {
                        self.replaceRange();
                        index   = select_range.start;
                        self.unsetRange();
                        self.opt.select_range.changed  = select_range.end - select_range.start > 1;
                    }
                }
                self.removeLastChar(index);
                self.setCaretFocus(index ,index);


                self.findMask(element.value); // ищем новую маску
                self.focused();

                return false;
            } else {
                return false;
            }
        } else {
            if(ctrlKey === true && code === 86) {
                return true;
            } else {

                num = value.indexOf('_');
                if (select_range !== false) {
                    if (select_range.focus === true) {
                        if (_regex.test(key) === true) {
                            self.replaceRange();
                            num   = select_range.start;
                            value = element.value;
                            self.unsetRange();
                            self.opt.select_range.changed  = select_range.end - select_range.start > 1;
                        }
                    }
                }

                if (num !== -1) { // если есть еще пустые символы
                    if (_regex.test(key) === true && value[num] === '_' ) {
                        self.setCaretFocus(num, (num + 1));
                    } else {
                        return false;
                    }
                } else {
                    // тут добавляем проверку на коды большей длинны
                    if (self.ifIssetNextMask() && _regex.test(key) === true) {
                        return true;
                    }
                    return false;
                }
            }
        }
    },

    /**
     * При отпускании клавиши проверим фокусировку
     * @param e
     * @return boolean|void
     */
    keyup: function (e) {
        var index,
            num,
            self        = this,
            element     = self.opt.element,
            code        = e.keyCode || e.which,
            value       = element.value,
            opt         = self.opt,
            select_range= opt.select_range;

        if (code === 8) {     // BACKSPACE
            index = self.getLastNum();
            if (_regex.test(value[index]) === true) {
                index += 1;
                self.focused();
                return false;
            } else {
                return false;
            }
        }  else if(code === 13) {
            if (opt.onSend) {
                opt.onSend(opt);
            }
        } else {
            num   = value.indexOf('_');
            index = (num !== -1) ? num : value.length;

            if (select_range.changed !== true) {
                self.findMask(element.value); // ищем новую маску
                self.focused();
            } else {
                if (num === -1) {
                    self.unsetRange();
                    self.focused();
                }
            }

        }
    },
};
/**
 * Объект маски
 */
var Mask = function (el, args) {
    var self = this;

    var init = function(el, args) {
        var opt = self.opt;

        opt.oldState = el;

        self.setTemplate();
        self.addActions(opt.element);
    };

    self.opt = {
        pre_value:        false,
        listOpened:       false,                    // список открыт
        element:          el,
        lang:             args.lang                 || MConf('lang'),
        country:          args.country              || MConf('country'),
        phone:            args.phone                || false,
        mask:             args.mask                 || '',
        onSend:           args.onSend               || MConf('onSend'),
        onToggleList:     args.onToggleList         || MConf('onToggleList'),
        onShowList:       args.onShowList           || MConf('onShowList'),
        onHideList:       args.onHideList           || MConf('onHideList'),
        onValueChanged:   args.onValueChanged       || MConf('onValueChanged'),
        one_country:      args.one_country          || MConf('one_country'),    // режим одной страны
        first_countries:  args.first_countries      || MConf('first_countries'),
        exceptions:       args.exceptions           || MConf('exceptions'),
        name:             '',
        title: {
            country:          '',
            region:           '',
            city:             '',
            operator:         ''
        },
        old:              {},
        oldState:         null,    // предыдущее состояние для переключения активностиб
        initial_focus:    args.initial_focus       || MConf('initial_focus'),
        select_range:     !args.select_range && !MConf('select_range') ? false : {  // разрешать выделять диапазон
            focus:   false,
            changed: false,
            start:   0,
            end:     0
        },
        popup_direction: args.popup_direction || MConf('popup_direction')
    };

    init(el, self.opt);
};

Mask.prototype = {
    setTemplate: function() {
        var i,
            li,
            ul,
            ico,
            span,
            flag,
            caret,
            cur_el,
            wrapper,
            selected,
            flags_block,
            sortedCodes,
            self             = this,
            w                = window,
            d                = document,
            opt              = self.opt,
            el               = opt.element,
            lists            = 'lists',
            active           = 'active',
            top              = 'top',
            cbm              = 'CBH-masks',
            one_country      = self.opt.one_country,
            first_countries  = self.opt.first_countries,
            opened_elements  = d.getElementsByClassName(lists+' '+active),

            document_create  = function (e) {
                return document.createElement(e);
            },
            inner_HTML  = function (i, o) {
                i.innerHTML = o.outerHTML;
            },
            className  = function (e, c) {
                return e.className = c;
            },
            pc = phoneCodes,
            append_child = function (e,i) {
                e.appendChild(i);
            },
            text_div = 'div',
            text_flag = 'flag';


        wrapper = document_create('div');
        inner_HTML(wrapper, el);
        className(wrapper,cbm);


        el.parentNode.replaceChild(wrapper, el);

        if (!one_country) {
            caret                   = document_create('i');
            className(caret,'caret');
        }
        flag                    = document_create(text_div);
        if (!one_country) {
            inner_HTML(flag, caret);
        }
        className(flag, text_flag+' ' + opt.country);
        selected                = document_create(text_div);
        inner_HTML(selected, flag);
        className(selected, 'selected');

        if (!one_country) {
            flags_block = document_create(text_div);
            inner_HTML(flags_block, selected);
            className(flags_block, 'flags');
            ul          = document_create('ul');
            className(ul, 'lists');
        } else {
            flags_block = document_create(text_div);
            inner_HTML(flags_block, selected);
            className(flags_block, 'country');
        }

        sortedCodes = pc.sortPhones(Global.countries['all'][opt.lang], 'name', 'asc'); // phoneCodes

        if(sortedCodes.length===0) {
            return;
        }

        var createLi = function () {
            var one             = sortedCodes[i],
                iso             = one['iso_code'].toString().toLowerCase(),
                name            = one.name,
                mask            = one.mask;


            if (!isset(name)) {
                return false;
            }

            if (opt.phone === false) {
                if (opt.country === iso) {
                    self.opt.element.value = mask;
                }
            }
            if (!one_country) {
                li                      = document_create('li');
                li.className            = 'country';
                li.dataset['isoCode']   = iso;
                li.dataset['mask']      = mask;

                Event.add(li, 'click', self.maskReplace.bind(self));

                ico                     = document_create('i');
                className(ico, text_flag+' ' + iso);
                append_child(li, ico);
                span                    = document_create('span');
                className(span, 'name');
                span.innerHTML = name;
                append_child(li, span);
                span                    = document_create('span');
                className(span, 'code');
                span.innerHTML = '+'+one['phone_code'];
                append_child(li, span);
                append_child(ul, li)
            }

        };

        if (!one_country) {
            for (i in sortedCodes) {
                if (sortedCodes.hasOwnProperty(i)) {
                    if (first_countries.indexOf(sortedCodes[i].iso_code) !== -1 ) {
                        if(createLi() === false) {
                            continue;
                        }
                    }
                }
            }

            var hr                      = document_create('hr');
            append_child(ul, hr)
        }

        for (i in sortedCodes) {
            if (sortedCodes.hasOwnProperty(i)) {
                if(createLi() === false) {
                    continue;
                }
            }
        }


        if (!one_country) {
            append_child(flags_block, ul);

            Event.add(ul, 'mousedown', function(e) {
                e.stopPropagation();
            });
        }


        wrapper.insertBefore( flags_block, wrapper.firstChild );

        if (!one_country) {
            wrapper.getElementsByClassName('selected')[0].onclick = function () {
                cur_el = wrapper.getElementsByClassName(lists)[0];
                var txt_opened = 'opened',
                    txt_closed = 'closed',
                    list_status = 'closed',
                    doc         = document,
                    handler     = function (e) {
                        if (!childOf(e.target, flags_block)) {
                            removeClass(cur_el, active);
                            removeClass(cur_el, top);
                            Event.remove(doc, 'click', handler);

                            /**
                             * При клике на li так же отсылаем статус closed
                             */
                            if (isFunction(opt.onHideList)) {
                                opt.onHideList();
                            }

                            if (isFunction(opt.onToggleList)) {
                                opt.onToggleList(txt_closed);
                            }
                        }
                    };

                if (!!opened_elements.length) {
                    for (i=0; i<opened_elements.length; i++) {
                        if (cur_el !== opened_elements[i]) {
                            removeClass(opened_elements[i], active);
                        }
                    }
                }

                if (/active/.test(cur_el.className) !== true) {

                    // Event.add(doc, 'click', handler);

                    function findPos(obj) {
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
                    }

                    addClass(cur_el, active);
                    var winHeight = w.innerHeight || d.documentElement.clientHeight || d.body.clientHeight,
                        offset    = findPos(cur_el),
                        fromTop   = (offset.top - cur_el.scrollTop),
                        maskBlockHeight = cur_el.clientHeight;

                    if ((winHeight - (fromTop + wrapper.childNodes[1].clientHeight)) <= maskBlockHeight) {
                        if (opt.popup_direction === "auto" || opt.popup_direction === 'top') {
                            addClass(cur_el, top);
                        }
                    }
                    list_status = txt_opened

                } else {
                    removeClass(cur_el, active);
                    removeClass(cur_el, top);
                    Event.remove(doc, 'click', handler);
                    list_status = txt_closed
                }

                if (list_status === txt_opened && isFunction(opt.onShowList)) {
                    opt.onShowList();
                }

                if (list_status === txt_closed && isFunction(opt.onHideList)) {
                    opt.onHideList();
                }

                if (isFunction(opt.onToggleList)) {
                    opt.onToggleList(list_status);
                }
            };
        }

        var value = opt.phone ? opt.phone : opt.element.value;
        self.opt.element = wrapper.childNodes[1];
        self.opt.element.value = value;

        self.findMask(value);
    },

    /**
     * Добавление событий на елемент
     * @param e Элемент
     */
    addActions: function(e) {
        Event.add(e, 'focus',       actions.focus.bind(this));
        Event.add(e, 'click',       actions.click.bind(this));
        Event.add(e, 'dblclick',    actions.dblclick.bind(this));
        Event.add(e, 'blur',        actions.blur.bind(this));
        Event.add(e, 'paste',       actions.paste.bind(this));
        Event.add(e, 'keydown',     actions.keydown.bind(this));
        Event.add(e, 'keyup',       actions.keyup.bind(this));
    },

    /**
     * Сфокусировать маску на доступном для ввода элементе
     */
    focused: function() {
        var self  = this,
            v     = self.opt.element.value,
            num   = v.indexOf('_'),
            i     = (num === -1) ? v.length : num;

        self.setCaretFocus(i, i);
    },

    /**
     * Установить выделение
     */
    setRange: function() {
        var self     = this,
            o        = self.opt,
            e        = self.opt.element,
            start    = e.selectionStart,
            end      = e.selectionEnd;

        if (start !== end) {
            o.select_range = {
                focus:   true,
                changed: false,
                start:   start,
                end:     end
            };
        } else {
            self.focused();
        }
    },

    /**
     * Удалить выделение
     */
    unsetRange: function() {
        this.opt.select_range = {
            focus: false,
            changed: false,
            start: 0,
            end:   0
        };
    },

    findMask: function (_phone) {
        var find,
            mask,
            self = this,
            opt = self.opt,
            one_country =  opt.one_country,
            language = opt.lang,
            country = opt.country,
            phone = getPhone(_phone),
            pc          = phoneCodes,
            exceptions  = opt.exceptions;


        if (one_country !== false) {
            var phone_code = pc.findMaskByCode('all', one_country, language).phone_code;
        }
        /**
         * Если маска полностью очищается, оставляем последнее совпадение
         */
        if (!phone) {
            if (one_country !== false) {
                if (find = pc.findMaskByCode('all', one_country, language)) {
                    phone = getPhone(find.mask);
                }
            } else {
                if (_phone === false) { /// форсированная установка значения в пустоту
                    self.setPhone('');
                }
                return false;
            }
        } else {
            if (one_country !== false && phone.indexOf(phone_code, 0) === -1) {
                phone = phone_code;
            }

            /**
             * Маска не пуста, если включены исключения самое время из использовать
             */
            if (!empty(exceptions[country]) && !empty(exceptions[country].exceptions)) {
                var exc = exceptions[country].exceptions;

                for (var expr in exc) {
                    if(exc.hasOwnProperty(expr)) {
                        if (phone === phone_code + ''+expr) {
                            phone = phone.replace(phone_code + ''+expr, exc[expr]);
                            break;
                        }
                    }
                }
            }
        }

        mask = self.hardSearch(
            phone, language, country
        );


        if (mask) {

            if (country !== mask.iso_code) {
                mask = self.hardSearch(
                        phone, language, mask.iso_code
                    ) || mask;
            }

            self.setTitle(mask);
            self.setMask(mask);
            self.setPhone(phone);

            if (self.opt.initial_focus === true) {
                self.focused();
            }
        }



        return !!mask;
    },

    setMask: function (mask) {
        var self     = this,
            opt      = self.opt;

        opt.country         = mask.iso_code;
        opt.mask            = mask.mask;

        return self;
    },

    setTitle: function (mask) {
        var i,
            t,
            self     = this,
            opt      = self.opt,
            e        = opt.element,
            title    = opt.title,
            iso_code = mask.iso_code;

        for (i in title) {
            if (title.hasOwnProperty(i)) {
                t = title[i];

                if (i === 'country' && mask.name) {
                    title.country  = mask.name;
                    title.region   = '';
                    title.city     = '';
                    title.operator = '';
                } else if (i === 'region' && mask.region) {
                    title.region   = mask.region;
                    title.city     = '';
                    title.operator = '';
                } else if (i === 'city' && mask.city) {
                    title.city     = mask.city;
                    title.operator = '';
                }  else if (i === 'operator' && mask.operator) {
                    title.operator = mask.operator;
                    title.region   = '';
                    title.city     = '';
                }
            }
        }

        var title_text = '';
        for (i in title) {
            if (title.hasOwnProperty(i)) {
                t = title[i];
                if (t) {
                    title_text += title_text ? ' / ' + t : t ;
                }
            }
        }

        if (!empty(e.parentNode.getElementsByClassName('selected')[0])) {
            i            = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
            i.className  = 'flag '+ iso_code;

            if (typeof title_text !== 'undefined') {
                i.parentNode.setAttribute('title', title_text);
            }
        }

        return self;
    },
    setPhone: function (phone) {
        var opt   = this.opt;
        var value = getNewMaskValue(
            phone,
            opt.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
        );


        opt.phone = phone;
        // opt.value         = value; // todo ???

        opt.element.placeholder = value;
        opt.element.value       = value;
    },

    maskReplace: function (e,e2) {
        var self        = this,
            opt         = self.opt,
            pc          = phoneCodes,
            t           = e.target,
            li          = t.tagName === 'LI' ? t : t.parentNode,
            ul          = li.parentNode,
            input       = opt.element,
            dataset     = li.dataset;

        var finded_old          = pc.findMaskByCode('all', opt.country, opt.lang);
        var finded_new          = pc.findMaskByCode('all', dataset['isoCode'], opt.lang);

        var phone = getNewMaskValue(
            getPhone(input.value).replace(finded_old.phone_code, finded_new.phone_code),
            finded_new.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
        );


        this.setTitle(finded_new);

        if(finded_new) {
            this.setMask(finded_new);
            this.setPhone(phone);
        }

        removeClass(ul, 'active');

        /**
         * При клике на li так же отсылаем статус closed
         */
        if (isFunction(self.opt.onHideList)) {
            self.opt.onHideList();
        }

        if (isFunction(self.opt.onToggleList)) {
            self.opt.onToggleList('closed');
        }
    },

    ifIssetNextMask: function () {
        var json,
            self            = this,
            iso             = self.opt.country,
            lang            = self.opt.lang,
            pc              = Global.countries,
            value           = self.opt.element.value,
            cur_length      = value.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_').replace(/[+()-]/g,"").length;

        if (isset(pc[iso]) && isset(pc[iso][lang])) {
            json = pc[iso][lang];
            for(var i in json) {
                if (json.hasOwnProperty(i)) {
                    var one = (json[i]['mask'].replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_').replace(/[0-9+()-]/g, "")).length;
                    if (one > cur_length) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     *
     * @todo можно будет сделать исключения (для спорных ситуаций таких как CA и US) при которых флаг страны не отображается
     *
     * @param value
     * @param mask_code
     * @returns {*}
     */
    hardSearch: function(value, language, country) {
        var i,
            it,
            im,
            val,
            find,
            mask,
            pass,
            determined,
            self      = this,
            maths     = [],
            pc        = phoneCodes,
            masklist  = Global.countries.all[language];


        self.opt.pre_value = !self.opt.one_country && (!self.opt.pre_value || value.length > self.opt.pre_value.length) ? value : self.opt.pre_value;

        if (empty(masklist)) {
            return false;
        }

        masklist = pc.sortPhones(masklist, 'mask', 'desc');

        if (isset(Global.countries[country]) && !empty(Global.countries[country][language])) {
            masklist = Global.countries[country][language].concat(masklist);
        }

        for (i in masklist) {
            if (masklist.hasOwnProperty(i)) {
                mask = masklist[i]['mask'];

                pass = true;
                for ( it = 0, im = 0; (it < value.length && im < mask.length);) {
                    var chm = mask.charAt(im);
                    var cht = value.charAt(it);

                    if (!_regex.test(chm) && chm !== '_') {
                        im++;
                        continue;
                    }

                    if ((chm === '_' && _regex.test(cht)) || (cht == chm)) {
                        it++;
                        im++;
                    } else {
                        pass = false;
                        break;
                    }
                }
                if (pass && it == value.length) {
                    determined = mask.substr(im).search(_regex) == -1;
                    mask = mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_');

                    if (value === '1' && masklist[i].iso_code !== 'us') {
                        continue;
                    }

                    maths.push(masklist[i]);
                }
            }
        }

        maths = phoneCodes.sortPhones(maths, 'mask', 'desc');

        find = false;
        for (i in maths) {
            if (maths.hasOwnProperty(i)) {
                val = maths[i].mask.replace(/\D+/g,"");
                if (parseInt(val) === parseInt(value)) { // точное совпадение
                    find = maths[i];
                }
            }
        }

        if (find) {
            return find;
        }

        // так как у нас не точное совпадение начинаем искать по подмаскам
        if (maths.length > 1) {
            maths.sort(function (a, b) {
                return Math.sign((a['mask'].match(/_/g) || []).length - (b['mask'].match(/_/g) || []).length);
            });
        }

        if (isset(Global.countries[country]) && empty(Global.countries[country][language]) && maths && value) {

            for(i in maths) {
                if (maths.hasOwnProperty(i)) {
                    var iso = maths[i]['iso_code'];
                    if (iso === 'ca') {
                        iso = 'us';
                    }

                    if (Global.initialization === true) {
                        MaskedSubListObserver.add({
                            object: self,
                            country: iso,
                            language: language
                        });
                    } else {

                        Masked.phoneCodes.loadMask([iso], [language], function() {
                            self.opt.country = iso;
                            self.opt.lang = language;

                            value = self.opt.pre_value.length > value.length ? self.opt.pre_value : value;

                            self.findMask(value);
                            if (self.opt.initial_focus === true) {
                                self.focused();
                            }

                            self.opt.pre_value = false;
                        });
                        return false;
                    }
                }
            }
        }

        // строка слишком длинная, обрежем 1 символ и попытаемся еще раз
        if (!isset(maths[0])) {
            value = value.substring(0, value.length - 1);
            if (value) { // если есть еще символы
                return this.hardSearch(value, language, country);
            }
        } else {
            self.opt.pre_value = false;
            return find || maths[0] || false;
        }
    },



    /**
     * Получить номер(массива) последнего int символа, используется для BACKSPACE методов actions.[keypress||keyup]
     * @returns {Number}
     */
    getLastNum: function() {
        var i,
            v  = this.opt.element.value;
        for (i = v.length; i >= 0; i--) {
            if (_regex.test(v[i])) {
                break;
            }
        }
        return i;
    },

    /**
     * Удалить последний элемент
     * @param e
     * @param i
     */
    removeLastChar: function (i) {
        var e = this.opt.element,
            temp = e.value.split('');

        if (_regex.test(temp[i])) {
            temp[i]='_';
        }
        e.value = temp.join('');
    },

    /**
     * Функция может устанавливать курсор на позицию start||end или выделять символ для замены
     *   если start и end равны, то курсор устанавливается на позицию start||end
     *   если не равны, выделяет символы от start до end
     */
    setCaretFocus: function(start, end) {
        var character = 'character';
        e         = this.opt.element;

        e.focus();
        if (e.setSelectionRange) {
            e.setSelectionRange(start, end);
        } else if (e.createTextRange) {
            var range = e.createTextRange();
            range.collapse(true);
            range.moveEnd(character, start);
            range.moveStart(character, end);
            range.select();
        }
    },
    /**
     * Замена символов
     */
    replaceRange: function() {
        var self     = this,
            o        = self.opt,
            e        = self.opt.element,
            value    = e.value.split(''),
            selected = self.opt.select_range;

        for(var i in value) {
            if(value.hasOwnProperty(i)) {
                if (i >= selected.start && i < selected.end) {
                    if (_regex.test(value[i])) {
                        value[i] = '_';
                    }
                }
            }
        }
        e.value = value.join('');
    },
};
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

    return plugin;
})(document, window);
// $.masked = new Masked;

/**
 * Добавить поддержку $(selector).Masked( options );
 */