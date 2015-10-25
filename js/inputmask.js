/* Кто скопирует код тот какашка! */
var CBHMasks = (function(){
var und = 'undefined';

var Event = (function() {
    var guid = 0
    function fixEvent(event) {
        event = event || window.event
        if ( event.isFixed ) {
            return event
        }
        event.isFixed = true
        event.preventDefault = event.preventDefault || function(){this.returnValue = false}
        event.stopPropagation = event.stopPropagaton || function(){this.cancelBubble = true}
        if (!event.target) {
            event.target = event.srcElement
        }
        if (!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }
        if ( event.pageX == null && event.clientX != null ) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }
        if ( !event.which && event.button ) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }
        return event
    }
    function commonHandle(event) {
        event = fixEvent(event)
        var handlers = this.events[event.type]
        for ( var g in handlers ) {
            var handler = handlers[g]
            var ret = handler.call(this, event)
            if ( ret === false ) {
                event.preventDefault()
                event.stopPropagation()
            }
        }
    }
    return {
        add: function(elem, type, handler) {
            if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {
                elem = window;
            }
            if (!handler.guid) {
                handler.guid = ++guid
            }
            if (!elem.events) {
                elem.events = {}
                elem.handle = function(event) {
                    if (typeof Event !== "undefined") {
                        return commonHandle.call(elem, event)
                    }
                }
            }
            if (!elem.events[type]) {
                elem.events[type] = {}
                if (elem.addEventListener)
                    elem.addEventListener(type, elem.handle, false)
                else if (elem.attachEvent)
                    elem.attachEvent("on" + type, elem.handle)
            }
            elem.events[type][handler.guid] = handler
        },
        remove: function(elem, type, handler) {
            var handlers = elem.events && elem.events[type]
            if (!handlers) return
            delete handlers[handler.guid]
            for(var any in handlers) return
            if (elem.removeEventListener)
                elem.removeEventListener(type, elem.handle, false)
            else if (elem.detachEvent)
                elem.detachEvent("on" + type, elem.handle)
            delete elem.events[type]
            for (var any in elem.events) return
            try {
                delete elem.handle
                delete elem.events
            } catch(e) { // IE
                elem.removeAttribute("handle")
                elem.removeAttribute("events")
            }
        }
    }
}());


function addClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    if (re.test(o.className)) return
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}

function removeClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}
function makeid()
{
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
    var availableType       = ['GET', 'POST', 'PUT'];
    var availableDataType   = ['json', 'text'];
    var headers             = {};

    var args = {
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

    if (typeof XMLHttpRequest == und){
        XMLHttpRequest = function () {
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP.6.0' );
            } catch ( e ) {}
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP.3.0' );
            } catch ( e ) {}
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP' );
            } catch ( e ) {}
            throw new Error( 'This browser does not support XMLHttpRequest.' );
        };
    }
    var xhr = new (("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest)();

    var url = args.url;
    if (args.type === 'GET' && args.data && args.data.length>0) {
        url = args.url + '?' +args.data.toString();
    }
    xhr.open( args.type, url, args.async );

    if ( !args.crossDomain ) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }

    for ( i in headers ) { // Support: IE<9
        if ( headers[ i ] !== undefined ) {
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
        var status, statusText,
            responses = {};
        if ( xhr.readyState === 4  ) {
            if  (args.async) {
                clearTimeout(timeout);
            }
            callback = undefined;
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
                    var res = responses.text || '';
                } else if (args.dataType === 'json') {
                    var res = JSON.parse(responses.text) || '';
                }
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
/**
 * @param a responce result
 * @param b responce code
 * @param c response text
 * @param d header for responce
 */
var phoneCodes = {
    all:    [],
    ru:     [],
    us:     [],
    ca:     [],


    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @returns {*}
     */
    sortPhones:function (maskList, key, sort) {
        var key = (key == 'mask')? 'mask' : 'name';
        var sort = (sort == 'desc')? 'desc' : 'asc';
        maskList.sort(function (a, b) {
            if (typeof a[key] === und || typeof b[key] === und)return;
            if (key ==='mask'){
                var a = a[key].replace(/\D+/g,"");
                var b = b[key].replace(/\D+/g,"");
            } else {
                var a = a[key];
                var b = b[key];
            }
            if (a > b) {
                return sort=='asc' ? 1:-1;
            } else if (a < b) {
                return sort=='asc' ? -1:1;
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
        var self     = this,
            p        = plugin,
            regex    = p.regex,
            instance = p.selectInstance(self),
            code     = e.keyCode || e.which,
            key      = String.fromCharCode(code),
            value    = self.value,
            _false   = false,
            _true    = true;

        if (code === 8) {  // BACKSPACE
            var index = instance.getLastNum(self);
            if (regex.test(value[index]) === _true) {
                instance.removeChar(self, index);
                instance.setCaret(self, index ,index);
                return _false;
            } else {
                return _false;
            }
        } else {
            var num = value.indexOf('_');
            if (num !== -1) { // если есть еще пустые символы
                if (regex.test(key) === _true) {
                    instance.setCaret(self, num, (num+1) );
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
        var self        = this,
            index       = und,
            p           = plugin,
            regex       = p.regex,
            instance    = p.selectInstance(self),
            code        = e.keyCode || e.which,
            value       = self.value,
            _false      = false;

        if (code === 8) {     // BACKSPACE
            index = instance.getLastNum(self);
            if (regex.test(value[index]) === true) {
                index += 1;
                instance.setCaret(self, index ,index);
                return _false;
            } else {
                return _false;
            }
            if (/[\(\)\- ]/.test(value[index])) {
                instance.setCaret(self, index, index);
            }
        }  else if(code === 13) {
            if (instance.opt.onsend) {
                instance.opt.onsend(instance.opt);
            }
        } else {
            var num   = value.indexOf('_');
            index = (num !== -1) ? num : value.length;
            instance.setCaret(self, index, index);
            instance.setCheckedMask(self); // ищем новую маску
        }
    }
};
/**
 * Объект маски
 */
var inpClass = function (el, args) {
    if (args.phone) {
        var finded       = this.maskFinder(phoneCodes.all, args.phone);
        if (finded) {
            args.mask    = this.setNewMaskValue(args.phone, finded.mask);
            args.country = finded.obj.iso_code;
        }
    }
    this.opt = {
        instId:         plugin.prefix + makeid(),          //  Селектор выбранного елемента
        element:        el,
        lang:           args.lang    ||    'ru',
        country:        args.country ||    'ru',
        phone:          args.phone   ||    false,
        mask:           args.mask    ||     '',
        onsend:         args.onsend || null,
        value:          '',
        old:            {}
    };

    this.setTemplate();
    var options = this.opt,
        mask    = options.mask;
    element = this.opt.element;

    element.value       = mask;
    element.placeholder = mask;

    addClass(element, options.instId);

    this.addActions(options.element);
};

inpClass.prototype = {
    setTemplate: function() {
        var opt = this.opt,
            el  = this.opt.element,
            p  = plugin,
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

        var wrapper = document_create('div');
        inner_HTML(wrapper,el);
        className(wrapper,'CBH-masks');

        el.parentNode.replaceChild(wrapper, el);

        var caret                   = document_create('i');
        className(caret,'caret');
        var flag                    = document_create(text_div);
        inner_HTML(flag,caret);
        className(flag, text_flag+' ' + opt.country);
        var selected                = document_create(text_div);
        inner_HTML(selected,flag);
        className(selected,'selected');
        var flags_block             = document_create(text_div);
        inner_HTML(flags_block,selected);
        className(flags_block,'flags');
        var ul                      = document_create('ul');
        className(ul,'lists');

        var sortedCodes = phone_codes.sortPhones(phone_codes.all, "name", 'asc'); // phoneCodes

        for (i in sortedCodes) {
            var one             = sortedCodes[i],
                iso             = one.iso_code.toString().toLowerCase(),
                name            = one.name,
                mask            = one.mask;

            if (typeof name === und)continue;
            if (opt.phone === false) {
                if (opt.country === iso) {
                    this.opt.mask = mask;
                }
            }
            var li                      = document_create('li');
                li.className            = 'country';
                li.dataset['isoCode']   = iso;
                li.dataset['mask']      = mask;

            Event.add(li,'click', this.maskReplace);

            var i                       = document_create('i');
            className(i, text_flag+' ' + iso);
            append_child(li, i);
            var span                    = document_create('span');
            className(span, 'name');
            span.innerHTML = name;
            append_child(li, span);
            var span                    = document_create('span');
            className(span, 'code');
            span.innerHTML = '+'+one.phone_code;
            append_child(li, span);
            append_child(ul, li)
        }

        append_child(flags_block, ul);

        Event.add(ul,'mousedown', function(e){
            e.stopPropagation();
        });

        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            var w       = window,
                d       = document,
                lists   = 'lists',
                active  = 'active',
                top     = 'top',
                opened_elements = d.getElementsByClassName(lists+' '+active),
                cur_el          = wrapper.getElementsByClassName(lists)[0];
            if(!!opened_elements.length) {
                for(var i in opened_elements) {
                    if (cur_el !== opened_elements[i] && opened_elements.hasOwnProperty(i)) {
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
        this.opt.element = wrapper.childNodes[1];
    },
    maskReplace: function () {
        var self        = this,
            parent      = self.parentNode.parentNode,
            input       = parent.parentNode.childNodes[1],
            p           = plugin,
            instance    = p.selectInstance(input),
            dataset     = self.dataset,

            placeholder = input.placeholder;

        var n = {
            code:       dataset['isoCode'],
            mask:       dataset['mask'],
            phone_code: instance.getVal(dataset['mask']),
        };
        var o = {
            mask:         placeholder,
            phone_code:   instance.getVal(placeholder),
            val:          instance.getVal(input.value)
        };

        var newval              = o.val.replace(o.phone_code, n.phone_code);
        var nval                = o.mask.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_');
        input.value             = instance.setNewMaskValue(newval, nval);
        input.placeholder       = n.mask;

        flag_el                 = parent.childNodes[0].childNodes[0];
        flag_el.className       = 'flag '+ n.code,
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
        var e = this.opt.element,
            v = e.value;
        var num = v.indexOf('_');
        var i = (num === -1) ? v.length : num;
        this.setCaret(e, i, i);
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
     * @param inp
     * @returns {Number}
     */
    getLastNum:function(e) {
        var v = e.value;
        for (var i = v.length; i >= 0; i--) {
            if (plugin.regex.test(v[i])) {
                break;
            }
        }
        return i;
    },

    /**
     * Удалить последний элемент
     * @param inp
     * @param index
     */
    removeChar:function(e, i) {
        var temp = e.value.split('');
            temp[i]='_';
        e.value = temp.join('');
    },

    setCheckedMask: function (e) {
        var self        = this,
            value       = self.getVal(e.value),
            phone_codes = phoneCodes,
            finded      = self.maskFinder(phone_codes.all, value),
            old         = self.opt.old;

        if(finded !== false) {
            if (value.length && typeof phone_codes[finded.obj.iso_code] !== und) {
                if (phone_codes[finded.obj.iso_code].length === 0) {
                    plugin.loadMasks(finded.obj.iso_code, self.opt.lang);
                }
            }
            if (typeof phone_codes[finded.obj.iso_code] !== und && typeof old !== 'null') {
                var newSearch = self.maskFinder(phone_codes[finded.obj.iso_code], value);
                if (newSearch) {
                    finded = newSearch;
                }
            }
            if (typeof finded.obj.name === und && old.obj != finded.obj) {
                var iso       = finded.obj.iso_code;        //  ищем по коду и ставим аргументы
                var new_value = self.findMaskByCode(iso);
                if (new_value) {
                    finded.obj.name = new_value.name;
                }
            }
            if (finded && (old.obj != finded.obj || old.determined != finded.determined)) {
                self.opt.old  = finded;
                self.setInputAttrs(e, finded.obj.iso_code, finded.obj.name, self.setNewMaskValue(value, finded.mask));
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
        var maths = [],
            regex = plugin.regex;
        for (var mid in masklist) {
            var mask = masklist[mid]['mask'];
            var pass = true;
            for (var it=0, im=0; (it < value.length && im < mask.length);) {
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

            if (pass && it==value.length) {
                var determined = mask.substr(im).search(regex) == -1;
                mask = mask.replace(new RegExp([regex.source].concat('_').join('|'), 'g'), '_');
                maths.push({
                    mask:       mask,
                    obj:        masklist[mid],
                    determined: determined
                });
            }
        }

        var find = false;
        for (var i in maths) {
            var val = this.getVal(maths[i].obj.mask);
            if (parseInt(val) === parseInt(value)) {
                find = maths[i];
            }
        }

        return find || maths[0] || false;
    },

    findMaskByCode: function(code){
        var phone_codes = phoneCodes;
        var sortedCodes = phone_codes.sortPhones(phone_codes.all, "name");
        for (i in phone_codes.all) {
            var one = sortedCodes[i];
            if (sortedCodes[i].iso_code === code) {
                return one;
            }
        }
        return false;
    },
    setNewMaskValue: function(value, mask) {
        var value       = this.getVal(value),
            mask        = mask.split(''),
            len         = 0;
        for (i in mask) {
            var digit = mask[i];
            if (digit == '_') {
                if (len < value.length) {
                    mask[i] = value[len];
                    len++;
                }
            }
        }
        return mask.join('');
    },

    setInputAttrs:function (e, flag, title, value) {
        e.value          = value;
        var i = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
            i.className = 'flag '+ flag;
            i.parentNode.setAttribute('title', title);
        this.opt.country = flag;
    }
};
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



    return plugin;
})();