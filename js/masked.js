/**! 
* Masked - v1.0.2 - 
* 
* @author Rashin Sergey 
* @version 1.0.2 2018-01-18
*/


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

            var callback = function () {
                self.subscribers.forEach(function(mask) {
                    mask.start()
                });

                Masked.postload();
            };

            if (Object.keys(Masked.phoneCodes.all).length === 0) {
                Masked.phoneCodes.loadMasks('all', MConf('lang'), function() {
                    callback();
                });
            } else {
                callback();
            }


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

var MaskedConfig = MConf = (function() {

    var exception_example = {
        // 'ru' : {
            //localFormat:'8',
            // exceptions: {
            //     '8975': '7975'
            // }
        // }
    };

    var options = {
        pathToList:         '/js/masks/',
        prefix:             'instId_',
        lang:               'ru',
        country:            'ru',
        one_country:        false, // false or string 'iso_code'
        country_binding:    false,
        first_countries:    ['ru'],
        exceptions:         exception_example,
        initial_focus:      false,
        select_range:       false,
        onToggleList:       null,
        onShowList:         null,
        onHideList:         null,
        onSend:             null,
        onValueChanged:     null,
        onValidationError:  null,
        onShowInformation:  null,
        show_validation_errors: false,
        show_phone_information: true,
        i18n: {
            'ru': {
                'errors': {
                    'phone_is_empty': 'Телефон не заполнен, заполните все символы.',
                    'phone_not_exists': 'Телефон введен не верно или не существует.'
                }
            }
        },
        popover: {
            prefix_id: 'masked_popover',
            prefix_class: 'Masked_popover'
        }
    };

    
    return function (args) {
        if (typeof args === 'string') {
            return options[args];
        } else {
            return options = generalMaskedFn.extend(options, args);
        }
    };
})();


var Masked = (function(doc, win) {
    var type_undefined      = 'undefined',
    type_null           = 'null',
    _regex              =  new RegExp("[0-9]");
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
    return value.replace(/\D+/g,"");
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

/**
 * Функция может устанавливать курсор на позицию start||end или выделять символ для замены
 *   если start и end равны, то курсор устанавливается на позицию start||end
 *   если не равны, выделяет символы от start до end
 */
function setCaretFocus(input, start) {
    var character = 'character';
    if (input.setSelectionRange) {
        input.setSelectionRange(start, start);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart(character, start);
        range.moveEnd(character, start);
        range.select();
    }
    input.focus();
}

/**
 * Получить номер(массива) последнего int символа, используется для BACKSPACE методов actions.[keypress||keyup]
 * @param e
 * @returns {Number}
 */
function getLastNum(e) {
    var i,
        v  = e.value;
    for (i = v.length; i >= 0; i--) {
        if (_regex.test(v[i])) {
            break;
        }
    }

    return i;
}


/**
 * Удалить последний элемент
 * @param e
 * @param i
 */
function removeLastChar(e, i) {
    var temp = e.value.split('');
    if (_regex.test(temp[i])) {
        temp[i]='_';
    }
    e.value = temp.join('');
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

function getDataSet(el) {
    var data = [].filter.call(el.attributes, function(at) { return /^data-/.test(at.name); });

    var res = {};
    for(var i=0; i < data.length; i++) {
        res[data[i].name.replace(/^data-/, '')] = data[i].value;
    }

    return res;
}

function isAndroid() {
  return navigator.userAgent.toLowerCase().indexOf("android") > -1;
}
var phoneCodes = {
    all:    [],     // список масок для всех стран
    ae:     [],     //
    an:     [],     //
    ba:     [],     //
    by:     [],     // Белорусь
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
    kz:     [],     // Казахстан
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
     * Загрузить маски
     *
     * @param type
     * @param lang
     * @param callback
     */
    loadMasks: function (type, lang, callback) {
        var self  = this,
            _true = true;

        sAJAX({
            url:         MConf('pathToList') + type + '/' + (!empty(lang) ? lang : 'ru') + '.min.json',
            type:        'GET',
            async:       _true,
            crossDomain: _true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                self[type] = self.sortPhones(responce, 'mask', 'desc');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    },
    findMaskByCode: function(code) {
        var i,
            one,
            self = this,
            sortedCodes = self.sortPhones(self.all, 'name', 1);

        for (i in self.all) {
            if (self.all.hasOwnProperty(i)) {
                one = sortedCodes[i];
                /**
                 * @namespace one.iso_code Код страны
                 */
                if (one.iso_code === code) {
                    return one;
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
  focus: function (e) {
    Masked.getInst(this).focused();
  },

  /**
   * При двойном нажатии
   * @return void
   */
  dblclick: function () {
    this.click();
  },

  /**
   * При нажатии на поле ввода
   * @return void
   */
  click: function () {
    var inst = Masked.getInst(this);

    if (inst.opt.select_range !== false) {
      inst.setRange();
    } else {
      inst.focused();
    }
  },

  /**
   * При потери фокуса
   * @return void
   */
  blur: function () {
    var inst = Masked.getInst(this);
    if (inst.opt.select_range !== false) {
      inst.unsetRange();
    }

    Popover.hide();

    return true;
  },

  /**
   * События новых символов
   *
   * только для android
   *
   * @param e
   * @returns {boolean}
   */
  textInput: function (e) {
    var index,
      num,
      self = this,
      p = plugin,
      instance = p.getInst(self),
      data = e.data,
      value = self.value;

    num = value.indexOf('_');

    if (num !== -1) { // если есть еще пустые символы
      if (_regex.test(data) === true && value[num] === '_') {

        self.value = getPhone(value + '' + data);

        instance.setMask(self);

        setTimeout(function () {
          instance.focused();
        });
      }
    } else {
      if (instance.ifIssetNextMask() && _regex.test(data) === true) {

        instance.setMask(self);

        setTimeout(function () {
          instance.focused();
        });

        return true;
      }
    }

    return false;
  },

  /**
   * Удаление символов
   *
   * только для android
   *
   * @param e
   * @returns {boolean}
   */
  input: function (e) {
    e.preventDefault();
    if (e.data === null) {
      var self = this,
        p = plugin,
        instance = p.getInst(self);

      self.value = instance.opt.value;

      var index = getLastNum(self);
      removeLastChar(self, index);

      setCaretFocus(self, index);
      instance.setMask(self); // ищем новую маску

      setTimeout(function () {
        instance.focused();
      });
    }
  },

  inputText: function (e) {
    var index,
      num,
      self = this,
      p = plugin,
      instance = p.getInst(self),
      code = e.which || e.keyCode,
      key = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48) : String.fromCharCode(code), // для numpad(а) преобразовываем
      value = self.value,
      select_range = instance.opt.select_range;

    num = value.indexOf('_');

        // backspace
    if (code === 8) {
      index = getLastNum(self);

      if (select_range !== false) {
        if (select_range.focus === true) {
          instance.replaceRange();
          index = select_range.start;
          instance.unsetRange();
          instance.opt.select_range.changed = select_range.end - select_range.start > 1;
        }
      }

      removeLastChar(self, index);
      instance.setMask(self); // ищем новую маску
      instance.focused();

      return false;
    }

    if (isNaN(key)) {
      return false;
    }

    if (_regex.test(key) === true && value[num] === '_') { // если есть еще пустые символы
      if (select_range !== false) {
        if (select_range.focus === true) {
          instance.replaceRange();
          instance.unsetRange();
          instance.opt.select_range.changed  = select_range.end - select_range.start > 1;

          value = instance.opt.element.value;
          num = value.indexOf('_');
        }
      }

      instance.addDigitToMask(key);
      instance.setMask(self); // ищем новую маску
      instance.focused();
    } else {
      if (instance.ifIssetNextMask() && _regex.test(key) === true) {

        instance.setMask(self);
        instance.focused();
        return true;
      }
    }

    return false;
  },
  /**
   * При вставке номера телефона
   * @param e
   * @return void
   */
  paste: function (e) {
    e.preventDefault();
    var self = this,
      p = plugin,
      instance = p.getInst(self),
      clipboard_text = (e.originalEvent || e).clipboardData.getData('text/plain');

    /**
     * @todo нужно сделать дополнительно вставку по субкодам если они еще не загружены
     *
     */
    instance.opt.element.value = getPhone(clipboard_text);
    instance.setMask(self); // ищем новую маску, и принудительно перезагружаем вторым аргументом
  }
};

(function () {
  var ev;
  try {
    ev = new KeyboardEvent('keydown');
    if (!('key' in ev)) {
      if (!('keyCode' in ev))
        Object.defineProperty(
          KeyboardEvent.prototype,
          'key',
          {
            get: function () {
              return this.keyCode;
            }
          }
        );
    }
  } catch (e) {
  }
}());
/**
 *
 * @param element Элементу которому будет показан popover
 * @param text
 * @param direction
 * @constructor
 */
var Popover = (function() {
    var Popover = function () {
        var self = this;

        var settings = MConf('popover');

        self.prefix_id = settings.prefix_id;
        self.prefix_class = settings.prefix_class;

        self.template = '<div class="{class} {direction}" id="{id}" style="{styles}">'
            + '<div class="arrow" style="left: 50%;"></div>'
            + '<h3 class="popover-title" style="display:none"></h3>'
            + '<div class="popover-content">{text}</div>'
            + '</div>';



        function fragmentFromString(strHTML) {
            return document.createRange().createContextualFragment(strHTML);
        }

        function setPx(el, type, px) {
            el.style[type] = px + 'px';
        }

        function hidePopover() {
            self.hide();
        }

        self.show = function (e, text, direction) {
            var pos = e.getBoundingClientRect(),
                top = pos.top,
                left = pos.left,
                width = pos.width,
                height = pos.height,
                direction = direction || 'top';

            var template = self.template.replace('{direction}', direction)
                       .replace('{class}', self.prefix_class)
                       .replace('{id}', self.prefix_id)
                       .replace('{styles}', "display: block")
                       .replace('{text}', text);

            var element = fragmentFromString(template).getElementById(self.prefix_id);

            element.style.visibility = 'hidden';
            element.style.display    = 'block';
            document.body.appendChild(element);
            element.style.visibility = '';

            var p_width = element.offsetWidth,
                p_height = element.offsetHeight;



            if (p_height + 10 > top || direction === 'bottom') {
                removeClass(element, direction);
                top = Math.ceil(height + top);
                addClass(element, 'bottom')
                direction = 'bottom'
            }

            if (p_width > width) {
                left -= (p_width - width) / 2;
            }

            if (direction === 'top') {
                top -= Math.ceil(p_height) + 2;
            }

            if (window.pageYOffset > 0) {
                top += (window.pageYOffset || window.scrollY || document.documentElement.scrollTop);
            }

            setPx(element, 'left', left);
            setPx(element, 'top', top);

            Event.add(document, 'click', hidePopover);
        };

        self.hide = function() {
            if (document.getElementById(self.prefix_id) !== null) {
                document.getElementById(self.prefix_id).remove();
                Event.remove(document, 'click', hidePopover);
            }
        };



        return self;
    };

    return new Popover();
})();
/**
 * Объект маски
 */
var Mask = function (el, args) {
    var self = this;

    var init = function(el, args) {
        var element,
            options;

        if (args.phone) {
            var finded = self.maskFinder(args.phone);

            if (!finded) {
                args.phone = false;
            }
        }

        addClass(self.opt.element, self.opt.instId);
        self.opt.oldState =  el.outerHTML;



        self.setTemplate();

        options = self.opt;
        element = self.opt.element;

        element.value       = options.value;
        element.placeholder = options.value;

        self.addActions(options.element);
    };

    /**
     * Генерация ID для инпута
     *
     * @returns {string}
     */
    var makeId = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    self.opt = {
        listOpened:       false,                        // список открыт
        instId:           MConf('prefix') + makeId(),   //  Селектор выбранного елемента
        element:          el,
        lang:                 args.lang                 || MConf('lang'),
        country:              args.country              || MConf('country'),
        phone:                args.phone                || false,
        mask:                 args.mask                 || '',
        onSend:               args.onSend               || MConf('onSend'),
        onToggleList:         args.onToggleList         || MConf('onToggleList'),
        onShowList:           args.onShowList           || MConf('onShowList'),
        onHideList:           args.onHideList           || MConf('onHideList'),
        onValueChanged:       args.onValueChanged       || MConf('onValueChanged'),
        onValidationError:    args.onValidationError    || MConf('onValidationError'),
        one_country:          args.one_country          || MConf('one_country'),    // режим одной страны
        first_countries:      args.first_countries      || MConf('first_countries'),
        exceptions:           args.exceptions           || MConf('exceptions'),
        country_binding:        args.country_binding        || MConf('country_binding'),
        show_validation_errors: args.show_validation_errors || MConf('show_validation_errors'),
        // show_phone_information: args.show_phone_information || MConf('show_phone_information'),
        i18n:                 args.i18n || MConf('i18n'),
        value:            '',
        name:             '',
        old:              {},
        oldState:         null,    // предыдущее состояние для переключения активностиб
        initial_focus:    args.initial_focus       || MConf('initial_focus'),
        select_range:     !args.select_range && !MConf('select_range') ? false : {  // разрешать выделять диапазон
            focus:   false,
            changed: false,
            start:   0,
            end:     0
        },
        phoneBindingValid: false
    };

    init(el, self.opt);
};

Mask.prototype = {
    /**
     * Установка маски
     *
     **/
    setMask: function (e) {
        var self = this,
            oldValue = self.opt.value;

        this.maskFinder(e.value, this.opt.country);

        if (
            isFunction(self.opt.onValueChanged) &&
            oldValue != e.value
        ) {
            self.opt.onValueChanged(getPhone(e.value), e.value);
        }
    },

    /**
     * Метод поиска маски
     *
     * @param _value
     * @param _country
     * @returns {boolean|*}
     */
    maskFinder: function (_value, _country) {
        var iso,
            obj,
            find,
            self = this,
            g   = Global,
            gc   = g.countries,
            value = getPhone(_value + ''),
            country = _country ? _country : false,
            pc = phoneCodes,
            one_country = self.opt.one_country,
            exceptions  = self.opt.exceptions,
            _false = false;


        /**
         * Если маска полностью очищается, оставляем последнее совпадение
         */
        if (!value) {
            if (one_country !== false) {
                if (find = pc.findMaskByCode(one_country)) {
                    value = getPhone(find.mask);
                }
            } else {
                if (_value === false) { /// форсированная установка значения в пустоту
                    self.setInp(self.opt.element, self.opt.country, self.opt.name, self.opt.value.replace(/[0-9]/g,'_'));
                }
                return false;
            }
        } else {
            /**
             * Маска не пуста, если включены исключения самое время из использовать
             */
            if (!empty(exceptions[country]) && !empty(exceptions[country].exceptions)) {
                var exc = exceptions[country].exceptions;
                var phone_code = pc.findMaskByCode(country).phone_code;

                for (var expr in exc) {
                    if(exc.hasOwnProperty(expr)) {
                        if (value === expr) {
                            value = value.replace(value, exc[expr]);
                            break;
                        }
                    }
                }
            }
        }

        find = hardSearch(value, country);

        if (find) {
            obj = find.obj;
            iso = obj['iso_code'];

            /**
             * Если режим одной страны
             */
            if (one_country !== _false && one_country.toString().toLowerCase() !== iso) {
                return false;
            }

            if (isset(pc[iso]) && empty(pc[iso])) {
                var t = {'iso_code':iso, 'lang': self.opt.lang };
                if (!languageIsset(gc, t)) {
                    gc.push(t);

                    if (g.initialization === _false) {
                        pc.loadMasks(iso, self.opt.lang, function() {
                            find = hardSearch(value, iso);
                            self.setInp(self.opt.element, find.obj['iso_code'], find.obj['name'], getNewMaskValue(value, find['mask']));

                          self.focused();
                        });
                    }
                }

                self.setInp(self.opt.element, find.obj['iso_code'], find.obj['name'], getNewMaskValue(value, find['mask']));
            } else {
                if (isset(pc[iso]) && !empty(pc[iso]) && country !== _false) {
                    find = hardSearch(value, iso);
                }

                value = (self.opt.select_range.changed === true && _value.indexOf('_') !== -1) ? _value : getNewMaskValue(value, find['mask']);

                self.setInp(self.opt.element, obj['iso_code'], obj['name'], value);
            }
        }

        if (self.opt.initial_focus === true) {
            self.focused();
        }

        return find;
    },

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
            phone_codes = phoneCodes,
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

        sortedCodes = phone_codes.sortPhones(phone_codes.all, 'name', 'asc'); // phoneCodes

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
                    self.opt.name = name;
                    self.opt.mask = mask;
                    self.opt.value = mask;
                }
            }
            if (!one_country) {
                li                      = document_create('li');
                li.className            = 'country';
                li.setAttribute('data-isocode', iso);
                li.setAttribute('data-mask', mask);

                Event.add(li, 'click', self.maskReplace);

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

                    Event.add(doc, 'click', handler);

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
                        addClass(cur_el, top);
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

        self.opt.element = wrapper.childNodes[1];
    },


    setInp: function (e, flag, title, value) {
        var i,
            opt          = this.opt;

        if (!empty(e.parentNode.getElementsByClassName('selected')[0])) {
            i            = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
            i.className  = 'flag '+ flag;
            if (typeof title !== type_undefined) {
                i.parentNode.setAttribute('title', title);
            }
        }

        opt.country     = flag;
        opt.name        = title;
        opt.value       = value;
        opt.mask        = value;

        e.value         = value;
    },

    /**
     * Сфокусировать маску на доступном для ввода элементе
     */
    focused: function() {
        var self  = this,
            o     = self.opt,
            e     = self.opt.element,
            v     = e.value,
            num   = v.indexOf('_'),
            i     = (num === -1) ? v.length : num;

        setCaretFocus(e, i, i);
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

    /**
     * Замена символов
     */
    replaceRange: function() {
        var self     = this,
            o        = self.opt,
            e        = self.opt.element,
        value    = self.opt.element.value.split(''),
        selected = self.opt.select_range;

        var a = false;
        for(var i in value) {
            if(value.hasOwnProperty(i)) {
                if (i >= selected.start && i < selected.end) {
                    if (_regex.test(value[i])) {
                        value[i] = '_';
                    }
                }
            }
        }
        self.opt.element.value = value.join('');
    },

    /**
     * Снять фокус
     */
    blured: function() {
        this.opt.element.blur();
    },

    maskReplace: function () {
        var self        = this,
            pc          = phoneCodes,
            parent      = self.parentNode.parentNode,
            input       = parent.parentNode.childNodes[1],
            instance    = Masked.getInst(input),
            dataset     = getDataSet(self);

        var finded_old          = pc.findMaskByCode(instance.opt.country);
        var finded_new          = pc.findMaskByCode(dataset['isocode']);

        instance.setInp(
            instance.opt.element,
            finded_new.iso_code,
            finded_new.name,
            getNewMaskValue(
                getPhone(input.value).replace(finded_old.phone_code, finded_new.phone_code),
                finded_new.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
            )
        );

        removeClass(parent.childNodes[1],'active');

        /**
         * При клике на li так же отсылаем статус closed
         */
        if (isFunction(instance.opt.onHideList)) {
            instance.opt.onHideList();
        }

        if (isFunction(instance.opt.onToggleList)) {
            instance.opt.onToggleList('closed');
        }
    },

    ifIssetNextMask: function () {
        var self            = this,
            iso             = self.opt.country,
            pc              = phoneCodes,
            value           = self.opt.element.value,
            cur_length      = value.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_').replace(/[+()-]/g,"").length;

        if (isset(pc[iso])) {
            for(var i in pc[iso]) {
                if (pc[iso].hasOwnProperty(i)) {
                    var one = (pc[iso][i]['mask'].replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_').replace(/[0-9+()-]/g, "")).length;
                    if (one > cur_length) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * Установка нового номера телефона
     * @param value
     * @return void
     */
    setPhone: function(value) {
        var self            = this;

        /**
         * @todo нужно сделать дополнительно вставку по субкодам если они еще не загружены
         *
         */
        self.opt.element.value = getPhone(value);
        self.setMask(self); // ищем новую маску, и принудительно перезагружаем вторым аргументом
    },

    /**
     * Добавление событий на елемент
     * @param e Элемент
     */
    addActions: function(e) {
        Event.add(e,'focus',       actions.focus);
        Event.add(e,'blur',        actions.blur);
        Event.add(e,'click',       actions.click)
        Event.add(e,'dblclick',    actions.dblclick);

        if (isAndroid()) {
            Event.add(e,'textInput',   actions.textInput);
            Event.add(e,'input',       actions.input);
        } else {
            Event.add(e,'keydown',     actions.inputText);
        }


        Event.add(e,'paste',       actions.paste);
    },

    checkCountryBinding: function(value, country) {
        var self = this,
            opt = self.opt;

      return checkCountryBinding(opt.element.value, opt.country);
    },

    /**
    * Проверяет переданный телефонный номер на корректность
    * @param {string} _phone
    * @returns {Boolean} true если всё ок, иначе false
    */
    isValidPhone: function(_phone) {
        var phone = getPhone(_phone);

        if (
          typeof phone !== 'string'   ||
          phone === ''                ||
          (phone.indexOf('_') !== -1) ||                 // проверяем ввел ли пользователь все символы
          /(.)\1{6,}/i.test(phone.replace(/\D+/g,""))    //проверка на число одинаковых цифр подряд (>=7)
        ) {
          return false;
        }

        return true;
    },
    validationErrors: function() {
        var self = this,
            opt = self.opt,
            value = opt.element.value,
            phone = getPhone(value);

        var errors = [];

        if (opt.show_validation_errors) {

            if (
                self.checkCountryBinding() === false && opt.country_binding ||
                /(.)\1{6,}/i.test(phone.replace(/\D+/g, ""))
            ) {
                errors.push({type:'phone_not_exists', message: opt.i18n[opt.lang].errors.phone_not_exists});
            }

            if (
                phone === '' || (value.indexOf('_') !== -1)
            ) {
                errors.push({type:'phone_is_empty', message: opt.i18n[opt.lang].errors.phone_is_empty});
            }

            if (opt.onValidationError) {
                return opt.onValidationError(errors)
            } else {
                return onValidationError(errors, self.opt.element);
            }

            return true;
        }

        // ошибки валидации отключены
        return false;
    },

    addDigitToMask: function (_digit) {
    var mask = this.opt.element.value;

    var maskArray = mask.split('');

    for (var i in maskArray) {
      if (maskArray.hasOwnProperty(i)) {
        var digit = maskArray[i];

        if (digit === '_' && _digit !== null) {
          maskArray[i] = _digit;
          _digit = null;
        }
      }
    }

    this.opt.element.value = maskArray.join('');
  }
};


/**
 *
 * @todo можно будет сделать исключения (для спорных ситуаций таких как CA и US) при которых флаг страны не отображается
 *
 * @param value
 * @param mask_code
 * @returns {*}
 */
function hardSearch(value, mask_code) {
    var i,
        it,
        im,
        val,
        find,
        mask,
        pass,
        determined,
        maths     = [],
        _false    = false,
        pc        = phoneCodes,
        masklist  = pc.all;

    if (empty(masklist)) {
        return false;
    }

    masklist = pc.sortPhones(masklist, 'mask', 'desc');

    if (!empty(pc[mask_code])) {
        masklist = pc[mask_code].concat(masklist);
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
                    pass = _false;
                    break;
                }
            }
            if (pass && it == value.length) {
                determined = mask.substr(im).search(_regex) == -1;
                mask = mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_');

                if (value === '1' && masklist[i].iso_code !== 'us') {
                    continue;
                }

                maths.push({
                    mask: mask,
                    obj: masklist[i]
                });
            }
        }
    }

    if (mask_code === 'us' || mask_code === 'ca') {
        maths = phoneCodes.sortPhones(maths,'mask','desc');
    }

    find = _false;
    for (i in maths) {
        if (maths.hasOwnProperty(i)) {
            val = maths[i].obj.mask.replace(/\D+/g,"");
            if (parseInt(val) === parseInt(value)) {
                find = maths[i];
            }
        }
    }

    if (!find && maths.length > 1) {
        maths.sort(function (a, b) {
            /**
             * @var
             */
            return Math.sign((a['mask'].match(/_/g) || []).length - (b['mask'].match(/_/g) || []).length);
        });
    }

    if (!isset(maths[0])) {
        value = value.substring(0, value.length - 1);
        if (value) { // если есть еще символы
            return hardSearch(value, mask_code);
        }
    } else {
        return find || maths[0] || _false;
    }
}


function checkCountryBinding(_value, _country) {
  var i,
    it,
    im,
    mask,
    pass,
    pc  = phoneCodes,
    masklist,
    value = getPhone(_value);

    /**
     * Если кодов для данной страны нет вообще, то разрешаем все
     */
  if (empty(pc[_country])) {
    return true;
  }

  masklist = pc[_country];

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
      if (pass === true) {
        break;
      }
    }
  }

  return pass;
}


function onValidationError(errors, element) {
    var i,
        messages = [];

    for (i in errors) {
        if (errors.hasOwnProperty(i)) {
            var o = errors[i];
            messages.push('<p>' + o.message + '</p>');
        }
    }

    if (messages.length > 0) {

        Popover.show(
            element,
            messages.join('')
        );

        return true;
    }

    return false;
}

/**
 * @var mixed doc
 * @var null type_null
 */

var Global = {
    initialization: true,
    instances: [],
    countries: [] // коды стран которые необходимо дополнительно подключить
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
    if (el !== null) {
        return this.getInst(el);
    }
    return false;
};

plugin.getPhone = function (value) {
    return value ? plugin.prototype.getPhone(value) : false;
};

plugin.isValid = function (value) {
    return value ? plugin.prototype.isValid(value) : false;
};

plugin.checkCountryBinding = function (value, country) {
  return value && country ? plugin.prototype.checkCountryBinding(value, country) : false;
};

plugin.validationErrors = function (element, callback) {
    return element ? plugin.prototype.validationErrors(element, callback) : false;
};
plugin.Popover = Popover;


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
};


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
                if (el && !el.className.match(new RegExp(MConf('prefix') + '[0-9a-zA-Z]+'))) {
                    opt = generalMaskedFn.extend(generalMaskedFn.extend({}, self.options), getDataSet(el));

                    object = new Mask(el, opt);
                    Global.instances[object.opt.instId] = object;
                }
            }
        }
    },

    setPhone: function (value) {
        var instance,
            elements = this.elements;
        for(var i in elements) {
            if (elements.hasOwnProperty(i)) {
                instance = plugin.getInst(elements[i]);
                if (!empty(instance)) {
                    instance.maskFinder(value ? value : false);
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
        var phone,
            inst,
            phones   = [],
            elements   = [],
            hs         = hardSearch,
            with_mask  = _with_mask || true;

        if (value) {
            value = getPhone(value);
            phone = hs(value);

            if (phone) {
                phone = getNewMaskValue(value, phone.mask);
            }
            if (!with_mask) {
                phone = getPhone(phone);
            }
            phones.push(phone);
        } else {
            elements = this.elements;

            for(var i in elements) {
                if (elements.hasOwnProperty(i)) {
                    if (!empty(plugin.getInst(elements[i]))) {
                        phone = plugin.getInst(elements[i]).opt.value;

                        phone = getNewMaskValue(phone, hs(getPhone(phone)).mask);
                        if (!with_mask) {
                            phone = getPhone(phone);
                        }
                        phones.push(phone);
                    }
                }
            }
        }

        return (
            value || !value && (Object.keys(elements).length == 1)
        ) ? phones[0] : phones;
    },

    isValid: function (value) {
        var phone,
            valid = false,
            hs         = hardSearch,
            elements   = [];

        if (value) {
            valid = getNewMaskValue(getPhone(value), hs(getPhone(value)).mask).indexOf('_') === -1;
        } else {
             elements = this.elements;

             if (Object.keys(elements).length) {
                 phone = plugin.getInst(elements[0]).opt.value;

                 valid = getNewMaskValue(getPhone(phone), hs(getPhone(phone)).mask).indexOf('_') === -1;
             } else {
                 valid = false;
             }
        }
        return valid;
    },
    checkCountryBinding: function(value, country) {
      return checkCountryBinding(value, country)
    },
    validationErrors: function(element, callback) {
        var value = element.value,
            phone = getPhone(value);

        var errors = [];

        var inst = plugin.getInst(element),
        opt = null;

        if (inst) {
            opt = inst.opt;
        }

        var i18n = opt ? opt.i18n : MaskedConfig('i18n');
        var lang = opt ? opt.lang : MaskedConfig('lang');
        var country = opt ? opt.country : MaskedConfig('country');
        var country_binding = opt ? opt.country_binding : MaskedConfig('country_binding');

        if (
            this.checkCountryBinding(value, country) === false && country_binding ||
            /(.)\1{6,}/i.test(phone.replace(/\D+/g, ""))
        ) {
            errors.push({type:'phone_not_exists', message: i18n[lang].errors.phone_not_exists});
        }

        if (
            phone === '' || (value.indexOf('_') !== -1)
        ) {
            errors.push({type:'phone_is_empty', message: i18n[lang].errors.phone_is_empty});
        }

        Popover.hide();

        if(!onValidationError(errors, element)) {
            return callback();
        }

        return false;
    }
};

    return plugin;
})(document, window);
// $.masked = new Masked;

/**
 * Добавить поддержку $(selector).Masked( options );
 */