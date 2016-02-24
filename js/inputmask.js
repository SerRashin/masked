var CBHMasks = (function() {
    /* Кто скопирует код тот какашка! */
var und = 'undefined';

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

function addClass(o, c) {
    var object_class = o.className;
    if (new RegExp("(^|\\s)" + c + "(\\s|$)", "g").test(object_class)) return;
    o.className = (object_class + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}
function removeClass(o, c) {
    o.className = o.className.replace(new RegExp("(^|\\s)" + c + "(\\s|$)", "g"), "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}
/**
 * Проверяет есть ли в родительском елементе указанный
 * @param c Child node
 * @param p Parent node
 * @returns {boolean}
 */
function childOf(c,p){ //returns boolean
    while((c=c.parentNode)&&c!==p);
    return !!c;
}
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

/**
 *  SUPPOORT
 *
     CORS is supported in the following browsers:

     Chrome 3+
     Firefox 3.5+
     Opera 12+
     Safari 4+
     Internet Explorer 8+

 @author Sergey Rashin
 @link https://github.com/serhanters/sAJAX
 */

$AJAX = function (obj) {
    var i,
        res,
        url,
        xhr,
        status,
        statusText,
        callback,
        responses = {},
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
                    res = JSON.parse(responses.text) || '';
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
var phoneCodes = {
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

        return maskList;
    }
};
var actions = {
    /**
     * При фокусе на поле ввода
     * @return void
     */
    focus: function () {
        plugin.getInst(this).focused();
    },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    click: function () {
        plugin.getInst(this).focused();
    },

    /**
     * При нажатии клавиши
     * @return void|boolean
     */
    keydown: function (e) {
        var index,
            num,
            self        = this,
            p           = plugin,
            regex       = p.regex,
            instance    = p.getInst(self),
            code        = e.which || e.keyCode,
            ctrlKey     = e.ctrlKey||e.metaKey,
            key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
            value       = self.value,
            set_caret   = instance.setCaret,
            _false      = false,
            _true       = true;

        if (code === 8) {  // BACKSPACE
            index = instance.getLastNum(self);
            if (regex.test(value[index]) === _true) {
                instance.remChar(self, index);
                set_caret(self, index ,index);
                instance.setMask(self); // ищем новую маску
                return _false;
            } else {
                return _false;
            }
        } else {
            if(ctrlKey === true && code === 86) {
                return _true;
            } else {
                num = value.indexOf('_');
                if (num !== -1) { // если есть еще пустые символы
                    if (regex.test(key) === _true) {
                        set_caret(self, num, (num + 1));
                    } else {
                        return _false;
                    }
                } else {
                    // тут добавляем проверку на коды большей длинны
                    if (instance.ifIssetNextMask() && regex.test(key) === _true) {
                        return _true;
                    }
                    return _false;
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
            p           = plugin,
            regex       = p.regex,
            instance    = p.getInst(self),
            code        = e.keyCode || e.which,
            value       = self.value,
            opt         = instance.opt,
            set_caret   = instance.setCaret,
            _false      = false;

        if (code === 8) {     // BACKSPACE
            index = instance.getLastNum(self);
            if (regex.test(value[index]) === true) {
                index += 1;
                set_caret(self, index ,index);
                return _false;
            } else {
                return _false;
            }
        }  else if(code === 13) {
            if (opt.onsend) {
                opt.onsend(opt);
            }
        } else {
            num   = value.indexOf('_');
            index = (num !== -1) ? num : value.length;
            set_caret(self, index, index);
            instance.setMask(self); // ищем новую маску
        }
    },

    /**
     * При вставке номера телефона
     * @param e
     * @return void
     */
    paste: function(e) {
        e.preventDefault();
        var self            = this,
            p               = plugin,
            instance        = p.getInst(self),
            clipboard_text  = (e.originalEvent || e).clipboardData.getData('text/plain');
        /*
        * @todo нужно сделать дополнительно вставку по субкодам если они еще не загружены
        * */
        instance.opt.element.value = instance.getVal(clipboard_text);
        instance.setMask(self); // ищем новую маску, и принудительно перезагружаем вторым аргументом
    }
};
/**
 * Объект маски
 */
var inpClass = function (el, args) {
    this.opt = {
        listOpened:     false,                              // список открыт
        instId:         plugin.prefix + makeid(),          //  Селектор выбранного елемента
        element:        el,
        lang:           args.lang    ||    'ru',
        country:        args.country ||     'ru',
        phone:          args.phone   ||    false,
        mask:           args.mask    ||     '',
        onsend:         args.onsend  ||    null,
        value:          '',
        name:           '',
        old:            {},
        oldState:       null    // предыдущее состояние для переключения активности
    };


    this.init(el, this.opt);
};

inpClass.prototype = {
    init: function(el, args) {
        var element,
            options,
            self = this;

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
    },

    /**
     * Метод поиска маски
     * @param _value
     * @param _country
     * @returns {boolean|*}
     */
    maskFinder: function(_value, _country) {
        var iso,
            obj,
            find,
            self    = this,
            value   = self.getVal(_value+''),
            country = _country ? _country : false,
            pc      = phoneCodes,
            p       = plugin;

        find = this.simpleFinder(value, country);

        if (find) {
            obj = find.obj;
            iso = obj['iso_code'];

            if(isset(pc[iso]) && empty(pc[iso])) {
                p.loadMasks(iso, 'ru', function() {
                    find = self.simpleFinder(value, iso);
                    self.setInp(self.opt.element, find.obj['iso_code'], find.obj['name'], self.setNewMaskValue(value, find['mask']));
                    self.focused();
                    p.loaded = true;
                });
            } else {
                self.setInp(self.opt.element, obj['iso_code'], obj['name'], self.setNewMaskValue(value, find['mask']));
            }

        }
        self.focused();
        return find;
    },

    /**
     * Установка маски
     *
     **/
    setMask: function (e) {
        this.maskFinder(e.value, this.opt.country);
    },

    setInp:function (e, flag, title, value) {
        e.value          = value;

        var i,
            opt          = this.opt;
        if (!empty(e.parentNode.getElementsByClassName('selected')[0])) {
            i            = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
            i.className  = 'flag '+ flag;
            i.parentNode.setAttribute('title', title);
        }

        opt.country     = flag;
        opt.name        = title;
        opt.value       = value;
        opt.mask        = value;
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
            p                = plugin,
            lists            = 'lists',
            active           = 'active',
            top              = 'top',
            cbm              = 'CBH-masks',
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

        caret                   = document_create('i');
            className(caret,'caret');
        flag                    = document_create(text_div);
            inner_HTML(flag, caret);
            className(flag, text_flag+' ' + opt.country);
        selected                = document_create(text_div);
            inner_HTML(selected, flag);
            className(selected,'selected');
        flags_block             = document_create(text_div);
            inner_HTML(flags_block, selected);
            className(flags_block,'flags');
        ul                      = document_create('ul');
            className(ul, 'lists');

        sortedCodes = phone_codes.sortPhones(phone_codes.all, "name", 'asc'); // phoneCodes

        if(sortedCodes.length===0) {
            return;
        }
        for (i in sortedCodes) {
            if (sortedCodes.hasOwnProperty(i)) {
                var one             = sortedCodes[i],
                    iso             = one['iso_code'].toString().toLowerCase(),
                    name            = one.name,
                    mask            = one.mask;

                if (!isset(name))continue;
                if (opt.phone === false) {
                    if (opt.country === iso) {
                        self.opt.name = name;
                        self.opt.mask = mask;
                        self.opt.value = mask;

                    }
                }
                li                      = document_create('li');
                li.className            = 'country';
                li.dataset['isoCode']   = iso;
                li.dataset['mask']      = mask;

                Event.add(li,'click', self.maskReplace);

                ico                       = document_create('i');
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
        }

        append_child(flags_block, ul);

        Event.add(ul,'mousedown', function(e) {
            e.stopPropagation();
        });


        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            cur_el           = wrapper.getElementsByClassName(lists)[0];
            var doc = document,
                handler = function(e) {
                if(!childOf(e.target, flags_block)) {
                    removeClass(cur_el, active);
                    removeClass(cur_el, top);
                    Event.remove(doc,'click',handler);
                }
            };
            if(!!opened_elements.length) {
                for(i in opened_elements) {
                    if (opened_elements.hasOwnProperty(i) && cur_el !== opened_elements[i]) {
                        removeClass(opened_elements[i], active);
                    }
                }
            }
            if (/active/.test(cur_el.className) !== true) {

                Event.add(doc,'click', handler);

                addClass(cur_el, active);
                var winHeight       = w.innerHeight || d.documentElement.clientHeight || d.body.clientHeight,
                    offset          = p.findPos(cur_el),
                    fromTop         = (offset.top - cur_el.scrollTop),
                    maskBlockHeight = cur_el.clientHeight;

                if ( (winHeight-(fromTop+wrapper.childNodes[1].clientHeight)) <= maskBlockHeight ) {
                    addClass(cur_el, top);
                }
            } else {
                removeClass(cur_el, active);
                removeClass(cur_el, top);

                Event.remove(doc,'click',handler);
            }
        };

        self.opt.element = wrapper.childNodes[1];
    },
    maskReplace: function () {
        var self        = this,
            parent      = self.parentNode.parentNode,
            input       = parent.parentNode.childNodes[1],
            p           = plugin,
            instance    = p.getInst(input),
            dataset     = self.dataset;

        var finded_old          = instance.findMaskByCode(instance.opt.country);
        var finded_new          = instance.findMaskByCode(dataset['isoCode']);

        instance.setInp(
           instance.opt.element,
           finded_new.iso_code,
           finded_new.name,
           instance.setNewMaskValue(
               instance.getVal(input.value).replace(finded_old.phone_code, finded_new.phone_code),
               finded_new.mask.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_')
           )
       );

        removeClass(parent.childNodes[1],'active');
    },
    /**
     * Добавление событий на елемент
     * @param e Элемент
     */
    addActions: function(e) {
        Event.add(e,'focus',       actions.focus);
        Event.add(e,'click',       actions.click);
        Event.add(e,'keydown',     actions.keydown);
        Event.add(e,'keyup',       actions.keyup);
        Event.add(e,'paste',       actions.paste);
    },

    /**
     * Сфокусировать маску на доступном для ввода элементе
     */
    focused: function() {
        var self  = this,
            e     = self.opt.element,
            v     = e.value,
            num   = v.indexOf('_'),
            i     = (num === -1) ? v.length : num;
        self.setCaret(e, i, i);
    },

    /**
     * Метод может устанавливать курсор на позицию start||end или выделять символ для замены
     *   если start и end равны, то курсор устанавливается на позицию start||end
     *   если не равны, выделяет символы от start до end
     */
    setCaret: function (input, start, end) {
        var character = 'character';
        input.focus();
        if (input.setSelectionRange) {
            input.setSelectionRange(start, end);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd(character, start);
            range.moveStart(character, end);
            range.select();
        }
    },

    /**
     * Получить номер(массива) последнего int символа, используется для BACKSPACE методов actions.[keypress||keyup]
     * @param e
     * @returns {Number}
     */
    getLastNum:function(e) {
        var i,
            v  = e.value;
        for (i = v.length; i >= 0; i--) {
            if (plugin.regex.test(v[i])) {
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
    remChar:function(e, i) {
        var temp = e.value.split('');
            temp[i]='_';
        e.value = temp.join('');
    },



    /**
     * Получить значение маски без символов только int
     * @param mask
     * @returns {string}
     */
    getVal: function(mask) {
        return mask.replace(/\D+/g,"");
    },

    ifIssetNextMask: function () {
        var self            = this,
            p               = plugin,
            iso             = self.opt.country,
            phone_codes     = phoneCodes,
            value           = self.opt.element.value,
            cur_length      = value.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_').replace(/[+()-]/g,"").length;

        if (isset(phone_codes[iso])) {
            for(var i in phone_codes[iso]) {
                if (phone_codes[iso].hasOwnProperty(i)) {
                    var one = (phone_codes[iso][i]['mask'].replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_').replace(/[0-9+()-]/g, "")).length;
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
    simpleFinder:function(value, mask_code) {
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
            self      = this,
            pc        = phoneCodes,
            masklist  = pc.all,
            regex     = plugin.regex;

        masklist = phoneCodes.sortPhones(masklist,'mask','desc');

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

                    if (!regex.test(chm) && chm !== '_') {
                        im++;
                        continue;
                    }

                    if ((chm === '_' && regex.test(cht)) || (cht == chm)) {
                        it++;
                        im++;
                    } else {
                        pass = _false;
                        break;
                    }
                }
                if (pass && it == value.length) {
                    determined = mask.substr(im).search(regex) == -1;
                    mask = mask.replace(new RegExp([regex.source].concat('_').join('|'), 'g'), '_');
                    maths.push({
                        mask: mask,
                        obj: masklist[i]
                    });
                }
            }
        }

        if (mask_code === 'us' || mask_code === 'ca') {
            maths = phoneCodes.sortPhones(maths,'obj.mask','asc');
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
                return Math.sign((a['mask'].match(/_/g) || []).length - (b['mask'].match(/_/g) || []).length);
            });
        }

        if (!isset(maths[0])) {
            value = value.substring(0, value.length - 1);
            if (value) { // если есть еще символы
                return self.simpleFinder(value, mask_code);
            }
        } else {
            return find || maths[0] || _false;
        }
    },

    findMaskByCode: function(code) {
        var i,
            one,
            phone_codes = phoneCodes,
            sortedCodes = phone_codes.sortPhones(phone_codes.all, 'name', 1);

        for (i in phone_codes.all) {
            if (phone_codes.all.hasOwnProperty(i)) {
                one = sortedCodes[i];
                if (one.iso_code === code) {
                    return one;
                }
            }
        }
        return false;
    },
    setNewMaskValue: function(v, m) {
        var i,
            digit,
            value       = this.getVal(v),
            mask        = m.split(''),
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
};
var opt = {
    path:'//masked.proj/js/masks/',
    prefix:'instId_'
};
var plugin = {
    path:   opt.path,
    prefix: opt.prefix,
    regex:  new RegExp('[0-9]'),
    instances:[],
    loaded: true,
    phoneCodes: phoneCodes,
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
                    self.loadMasks('all', opt.lang, (function(o) {
                        return function () {
                            self.loop(elements, o);
                        }})(opt));
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
            url:         self.path + type + '/' + (!empty(lang) ? lang : 'ru') + '.min.json',
            type:        "GET",
            async:       _true,
            crossDomain: _true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                pc[type] = pc.sortPhones(responce, "mask", 'desc');
                if (typeof callback == 'function') {
                    callback(opt);
                }
            }
        });
    },
    /**
     * Получить инстанс
     * @param e
     * @returns {*}
     */
    getInst: function (e) {
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
            return this.getInst(el);
        }
        return false;
    },

    /**
     * Переключение статуса
     * @param e Элемент или класс
     */
    toggle: function(e) {
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
};
    return plugin;
})();