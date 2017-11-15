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