/* Кто скопирует код тот какашка! */
var CBHMasks = (function(){
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
                    if (typeof Event !== "undefined") {
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

    if (typeof args.url === und || args.url === false) {
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
        if ( headers.hasOwnProperty(i) && typeof headers[ i ] !== 'undefined' ) {
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
        setTimeout( callback );
    } else {
        xhr.onreadystatechange = callback;
    }
};
var phoneCodes = {
    all:    [],     // список масок для всех стран
    ru:     [],     // список кодов для россии
    us:     [],     // список кодов для США
    ca:     [],     // список кодов для канады


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
            if (typeof a[key] === und || typeof b[key] === und)return;
            if (key === txt_mask){
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
    /* При фокусе на поле ввода */
    focus: function () {
        plugin.selectInstance(this).focused();
    },

    /* При нажатии на поле ввода */
    click: function () {
        plugin.selectInstance(this).focused();
    },

    /* При нажатии клавиши */
    keydown: function (e) {

        var index,
            num,
            self        = this,
            p           = plugin,
            regex       = p.regex,
            instance    = p.selectInstance(self),
            code        = e.which || e.keyCode,
            key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
            value       = self.value,
            set_caret   = instance.setCaret,
            _false      = false,
            _true       = true;

        if (code === 8) {  // BACKSPACE
            index = instance.getLastNum(self);
            if (regex.test(value[index]) === _true) {
                instance.removeChar(self, index);
                set_caret(self, index ,index);
                return _false;
            } else {
                return _false;
            }
        } else {
            num = value.indexOf('_');
            if (num !== -1) { // если есть еще пустые символы
                if (regex.test(key) === _true) {
                    set_caret(self, num, (num+1) );
                } else {
                    return _false;
                }
            } else {
                return _false;
            }
        }
    },

    /*  При отпускании клавиши проверим фокусировку */
    keyup: function (e) {
        var index,
            num,
            self        = this,
            p           = plugin,
            regex       = p.regex,
            instance    = p.selectInstance(self),
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
            instance.setCheckedMask(self); // ищем новую маску
        }
    }
};
/**
 * Объект маски
 */
var inpClass = function (el, args) {
    this.opt = {
        instId:         plugin.prefix + makeid(),          //  Селектор выбранного елемента
        element:        el,
        lang:           args.lang    ||    'ru',
        country:        args.country ||     'ru',
        phone:          args.phone   ||    false,
        mask:           args.mask    ||     '',
        onsend:         args.onsend  || null,
        value:          '',
        name:           '',
        old:            {}
    };
    this.init(el, this.opt);
};

inpClass.prototype = {
    init: function(el, args) {
        var mask,
            element,
            options,
            self = this,
            p = plugin;
        if (args.phone) {
            var i,
                iso,
                finded,
                phone     = self.getVal(args.phone+''),
                pl        = phone.length,
                pc        = phoneCodes,
                for_code  = self.maskFinder(pc.all, pl > 6 ? phone.substring(0, 6) : phone);
            if (for_code) {
                iso = for_code.obj['iso_code'];
                if(typeof pc[iso] !== 'undefined' && pc[iso].length === 0) {
                    p.loadMasks(iso, args.lang, function() {
                        for (i in phone) {
                            if (phone.hasOwnProperty(i)) {
                                finded = self.maskFinder(pc[iso], phone);
                                if (finded && phone !== for_code.obj['phone_code']) {
                                    args.mask    = self.setNewMaskValue(phone, finded.mask);
                                    args.country = finded.obj['iso_code'];
                                    args.phone   = phone;
                                    break;
                                } else phone = phone.substring(0, pl - 1);
                            }
                        }
                        self.init(el, args);
                        return true;
                    });
                    return true;
                }
                args.mask    = self.setNewMaskValue(phone, for_code.mask);
                args.country = for_code.obj['iso_code'];
            }
        }
        p.loaded = true;
        self.opt       = p.extend(self.opt, args);

        self.setTemplate();

        options = self.opt;
        mask    = options.mask;
        element = self.opt.element;

        element.value       = mask;
        element.placeholder = mask;

        addClass(element, options.instId);

        self.addActions(options.element);
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
            className(wrapper,'CBH-masks');

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

                if (typeof name === und)continue;
                if (opt.phone === false) {
                    if (opt.country === iso) {
                        self.opt.name = name;
                        self.opt.mask = mask;
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

        Event.add(ul,'mousedown', function(e){
            e.stopPropagation();
        });

        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            cur_el           = wrapper.getElementsByClassName(lists)[0];
            if(!!opened_elements.length) {
                for(i in opened_elements) {
                    if (opened_elements.hasOwnProperty(i) && cur_el !== opened_elements[i]) {
                        removeClass(opened_elements[i], active);
                    }
                }
            }
            if (/active/.test(cur_el.className) !== true) {
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
            }
        };
        self.opt.element = wrapper.childNodes[1];
    },
    maskReplace: function () {
        var flag_el,
            list_el,
            self        = this,
            parent      = self.parentNode.parentNode,
            input       = parent.parentNode.childNodes[1],
            p           = plugin,
            instance    = p.selectInstance(input),
            dataset     = self.dataset;

        var finded_old          = instance.findMaskByCode(instance.opt.country);
        var finded_new          = instance.findMaskByCode(dataset['isoCode']);
        input.value             = instance.setNewMaskValue(
            instance.getVal(input.value).replace(finded_old['phone_code'], finded_new['phone_code']),
            instance.opt.mask.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_')
        );

        input.placeholder       = finded_new.mask;
        instance.opt.value      = input.value;
        instance.opt.name       = finded_new.name;
        instance.opt.mask       = finded_new.mask;
        instance.opt.country    = finded_new['iso_code'];

        flag_el                 = parent.childNodes[0].childNodes[0];
        flag_el.className       = 'flag '+ finded_new['iso_code'];
        list_el                 = parent.childNodes[1];

        removeClass(list_el,'active');
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
    removeChar:function(e, i) {
        var temp = e.value.split('');
            temp[i]='_';
        e.value = temp.join('');
    },

    setCheckedMask: function (e) {
        var iso,
            new_value,
            newSearch,
            self        = this,
            value       = self.getVal(e.value),
            phone_codes = phoneCodes,
            finded      = self.maskFinder(phone_codes.all, value),
            old         = self.opt.old;

        if(finded !== false) {
            if (value.length && typeof phone_codes[finded.obj['iso_code']] !== und) {
                if (phone_codes[finded.obj['iso_code']].length === 0) {
                    plugin.loadMasks(finded.obj['iso_code'], self.opt.lang);
                }
            }
            if (typeof phone_codes[finded.obj['iso_code']] !== und && typeof old !== 'null') {
                newSearch = self.maskFinder(phone_codes[finded.obj['iso_code']], value);
                if (newSearch) {
                    finded = newSearch;
                }
            }
            if (typeof finded.obj.name === und && old.obj != finded.obj) {
                iso       = finded.obj['iso_code'];        //  ищем по коду и ставим аргументы
                new_value = self.findMaskByCode(iso);
                if (new_value) {
                    finded.obj.name = new_value.name;
                }
            }
            if (finded && (old.obj != finded.obj || old.determined != finded.determined)) {
                self.opt.old  = finded;
                self.setInputAttrs(e, finded.obj['iso_code'], finded.obj.name, self.setNewMaskValue(value, finded.mask));
                self.focused(e);
            }
        }
    },

    /**
     * Получить значение маски без символов только int
     * @param mask
     * @returns {string}
     */
    getVal: function(mask) {
        return mask.replace(/\D+/g,"");
    },


    /**
     * Метод поиска маски
     * @param masklist
     * @param value
     * @returns {boolean|*}
     */
    maskFinder: function(masklist, value) {
        var i,
            it,
            im,
            val,
            find,
            mask,
            pass,
            determined,
            maths = [],
            self  = this,
            regex = plugin.regex;
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
                        pass = false;
                        break;
                    }
                }
                if (pass && it == value.length) {
                    determined = mask.substr(im).search(regex) == -1;
                    mask = mask.replace(new RegExp([regex.source].concat('_').join('|'), 'g'), '_');
                    maths.push({
                        mask: mask,
                        obj: masklist[i],
                        determined: determined
                    });
                }
            }
        }

        find = false;
        for (i in maths) {
            if (maths.hasOwnProperty(i)) {
                val = self.getVal(maths[i].obj.mask);
                if (parseInt(val) === parseInt(value)) {
                    find = maths[i];
                }
            }
        }

        return find || maths[0] || false;
    },

    findMaskByCode: function(code) {
        var i,
            one,
            phone_codes = phoneCodes,
            sortedCodes = phone_codes.sortPhones(phone_codes.all, "name", 1);
        for (i in phone_codes.all) {
            if (phone_codes.all.hasOwnProperty(i)) {
                one = sortedCodes[i];
                if (one['iso_code'] === code) {
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
    },

    setInputAttrs:function (e, flag, title, value) {
        e.value          = value;
        var opt          = this.opt,
            i            = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
            i.className  = 'flag '+ flag;
            i.parentNode.setAttribute('title', title);
        opt.country = flag;
        opt.name    = title;
        opt.value   = value;
    }
};
var opt = {
    path:'//test.proj/js/masks/',
    prefix:'instId_'
};
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
            url:         self.path + type + '/' + (lang == 'ru' ? 'ru' : 'en') + '.min.json',
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
    return plugin;
})();