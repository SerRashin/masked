/* Кто скопирует код тот какашка! */
var CBHMasks = (function(){
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
$.AJAX = function (obj) {
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

    if (typeof args.url === 'undefined' || args.url === false) {
        return;
    }

    if (typeof XMLHttpRequest == 'undefined'){
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
    en:     [],


    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @returns {*}
     */
    sortPhones:function (maskList) {
        var key = "name";
        maskList.sort(function (a, b) {
            if (typeof a[key] === 'undefined' || typeof b[key] === 'undefined')return;
            var ia = 0,
                ib = 0;
            for (; (ia<a[key].length && ib<b[key].length); ) {
                var cha = a[key].charAt(ia);
                var chb = b[key].charAt(ib);
                if (cha > chb) {
                    return 1;
                } else if (cha < chb) {
                    return -1;
                } else {
                    return 0;
                }
                ia++;
                ib++;
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
    keypress: function (e) {
        var instance = plugin.selectInstance(this);
        $code = e.keyCode;
        $key  = parseInt(e.key);

        if ($code === 8) {  // BACKSPACE
            var index = instance.getLastNum(this);
            if (plugin.regex.test(this.value[index]) === true) {
                instance.removeChar(this, index);
                instance.setCaret(this, index ,index);
                return false;
            } else {
                return false;
            }
        } else {
            var num = this.value.indexOf('_');
            if (num !== -1) { // если есть еще пустые символы
                if (plugin.regex.test($key) === true) {
                    instance.setCaret(this, num, (num+1) );
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    },

    /*  При отпускании клавиши проверим фокусировку */
    keyup: function (e) {
        var self        = this;
        var instance    = plugin.selectInstance(self);
        $code = e.keyCode;
        if ($code === 8) {     // BACKSPACE
            var index = instance.getLastNum(self);
            if (plugin.regex.test(self.value[index]) === true) {
                index += 1;
                instance.setCaret(self, index ,index);
                //instance.checkMask(this); // ищем новую маску
                return false;
            } else {
                return false;
            }
            if (/[\(\)\- ]/.test(self.value[index])) {
                instance.setCaret(self, index, index);
                //instance.keyboardApply(this,instance.matchMask(this)); // ищем новую маску
            }
        } else {
            var num   = self.value.indexOf('_');
            var index = (num !== -1) ? num : self.value.length;
            instance.setCaret(self, index, index);
            instance.setCheckedMask(self); // ищем новую маску
            //instance.keyboardApply(this, instance.matchMask(this)); // ищем новую маску
        }
    }
};
/**
 * Объект парсинга дизайна маски
 * @type {{setTemplate: Function, addActions: Function}}
 */
var inputView = {
    setTemplate: function(obj, el) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = el.outerHTML;
        wrapper.className = 'CBH-masks';

        el.parentNode.replaceChild(wrapper, el);

        var caret                   = document.createElement('i');
            caret.className         = 'caret';
        var flag                    = document.createElement('div');
            flag.innerHTML          = caret.outerHTML;
            flag.className          = 'flag ' + obj.opt.country;
        var selected                = document.createElement('div');
            selected.innerHTML      = flag.outerHTML;
            selected.className      = 'selected';
        var flags_block             = document.createElement('div');
            flags_block.innerHTML   = selected.outerHTML;
            flags_block.className   = 'flags';
        var ul                      = document.createElement('ul');
            ul.className            = 'lists';

        var sortedCodes = phoneCodes.sortPhones(phoneCodes.all); // phoneCodes

        for (i in sortedCodes) {
            var one             = sortedCodes[i];
                one.iso_code    = one.iso_code.toString().toLowerCase();
            if (typeof one.name === 'undefined')continue;
            if (obj.opt.country === one.iso_code) {
                obj.opt.mask = one.mask;
            }
            var li                      = document.createElement('li');
                li.className            = 'country';
                li.dataset['isoCode']   = one.iso_code.toString().toLowerCase();
                li.dataset['mask']      = one.mask;

            //Event.add(li,'click', inputMask.maskReplace);

            var i                       = document.createElement('i');
                i.className             = 'flag ' + one.iso_code;
                li.appendChild(i);
            var span                    = document.createElement('span');
                span.className          = 'name';
                span.innerHTML          = one.name;
            li.appendChild(span);

            var span                    = document.createElement('span');
                span.className          = 'code';
                span.innerHTML          = "+" + one.phone_code;
            li.appendChild(span);
            ul.appendChild(li);
        }

        flags_block.appendChild(ul);
        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            var el = wrapper.getElementsByClassName('lists')[0];
            if (/active/.test(el.className) === true) {
                removeClass(el,'active');
            } else {
                addClass(el,'active');
            }
        };

        return wrapper.childNodes[1];
    },

};
/**
 * Объект маски
 * @type {{opt: {}, setMask: Function}}
 */
var inpClass = function (el, args) {

    if (args.phone !== false) {
        var finded      = this.maskFinder(phoneCodes.all, args.phone);
        if (finded) {
            args.mask = this.setNewMaskValue(args.phone, finded.mask);
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
        value:          '',
        old:            {}
    };

    console.log(this.opt);

    this.setTemplate();
    this.opt.element.value       = this.opt.mask;
    this.opt.element.placeholder = this.opt.mask;

    addClass(this.opt.element, this.opt.instId);

    this.addActions(this.opt.element);
};

inpClass.prototype = {
    setTemplate: function() {
        var opt = this.opt,
            el  = this.opt.element;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = el.outerHTML;
        wrapper.className = 'CBH-masks';

        el.parentNode.replaceChild(wrapper, el);

        var caret                   = document.createElement('i');
        caret.className         = 'caret';
        var flag                    = document.createElement('div');
        flag.innerHTML          = caret.outerHTML;
        flag.className          = 'flag ' + opt.country;
        var selected                = document.createElement('div');
        selected.innerHTML      = flag.outerHTML;
        selected.className      = 'selected';
        var flags_block             = document.createElement('div');
        flags_block.innerHTML   = selected.outerHTML;
        flags_block.className   = 'flags';
        var ul                      = document.createElement('ul');
        ul.className            = 'lists';

        var sortedCodes = phoneCodes.sortPhones(phoneCodes.all); // phoneCodes

        for (i in sortedCodes) {
            var one             = sortedCodes[i];
            one.iso_code    = one.iso_code.toString().toLowerCase();
            if (typeof one.name === 'undefined')continue;
            if (opt.phone === false) {
                if (opt.country === one.iso_code) {
                    this.opt.mask = one.mask;
                }
            }

            var li                      = document.createElement('li');
            li.className            = 'country';
            li.dataset['isoCode']   = one.iso_code.toString().toLowerCase();
            li.dataset['mask']      = one.mask;

            Event.add(li,'click', this.maskReplace);

            var i                       = document.createElement('i');
            i.className             = 'flag ' + one.iso_code;
            li.appendChild(i);
            var span                    = document.createElement('span');
            span.className          = 'name';
            span.innerHTML          = one.name;
            li.appendChild(span);

            var span                    = document.createElement('span');
            span.className          = 'code';
            span.innerHTML          = "+" + one.phone_code;
            li.appendChild(span);
            ul.appendChild(li);
        }

        flags_block.appendChild(ul);
        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            var el = wrapper.getElementsByClassName('lists')[0];
            if (/active/.test(el.className) === true) {
                removeClass(el,'active');
            } else {
                addClass(el,'active');
            }
        };

        this.opt.element = wrapper.childNodes[1];
    },
    maskReplace: function () {
        var input       = this.parentNode.parentNode.parentNode.childNodes[1];
        var self        = this;
        var instance    = plugin.selectInstance(input);


        var n = {
            code:       self.dataset['isoCode'],
            mask:       self.dataset['mask'],
            phone_code: instance.getVal(self.dataset['mask']),
        };
        var o = {
            mask:         input.placeholder,
            phone_code:   instance.getVal(input.placeholder),
            val:          instance.getVal(input.value)
        };
        var newval          = o.val.replace(o.phone_code, n.phone_code);
        var nval            = o.mask.replace(new RegExp([plugin.regex.source].concat('_').join('|'), 'g'), '_');
        input.value         = instance.setNewMaskValue(newval, nval);
        input.placeholder   = n.mask;
        var  flag_el        = this.parentNode.parentNode.childNodes[0].childNodes[0];
        flag_el.className   = 'flag '+ n.code;

        var list_el = this.parentNode.parentNode.childNodes[1];
        removeClass(list_el,'active');
    },
    addActions: function(e) {
        Event.add(e,'focus',       actions.focus);
        Event.add(e,'click',       actions.click);
        Event.add(e,'keypress',    actions.keypress);
        Event.add(e,'keyup',       actions.keyup);
    },

    /**
     * Сфокусировать маску на доступном для ввода элементе
     */
    focused: function() {
        var e = this.opt.element;
        var num = e.value.indexOf('_');
        var i = (num === -1) ? e.value.length : num;
        this.setCaret(e, i, i);
    },

    /**
     * Метод может устанавливать курсор на позицию start||end или выделять символ для замены
     *   если start и end равны, то курсор устанавливается на позицию start||end
     *   если не равны, выделяет символы от start до end
     */
    setCaret: function (input, start, end) {
        input.focus();
        if (input.setSelectionRange) {
            input.setSelectionRange(start, end);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', start);
            range.moveStart('character', end);
            range.select();
        }
    },

    /**
     * Получить номер(массива) последнего int символа, используется для BACKSPACE методов actions.[keypress||keyup]
     * @param inp
     * @returns {Number}
     */
    getLastNum:function(e) {
        for (var i = e.value.length; i >= 0; i--) {
            if (plugin.regex.test(e.value[i])) {
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
        var value       = this.getVal(e.value);
        var finded      = this.maskFinder(phoneCodes.all, value);
        var old         = this.opt.old;

        if(finded !== false) {
            if (typeof phoneCodes[finded.obj.iso_code] !== 'undefined' && phoneCodes[finded.obj.iso_code].length === 0) {
                plugin.loadMasks(this.opt.country, this.opt.lang);
            }
            if (typeof this.opt.country !== 'undefined' && typeof old !== 'null') {
                var newSearch = this.maskFinder(phoneCodes[finded.obj.iso_code], value);
                if (newSearch) {
                    finded = newSearch;
                }
            }
            if (typeof finded.obj.name === 'undefined' && old.obj != finded.obj) {
                var iso = finded.obj.iso_code; //  ищем по коду и ставим аргументы
                var new_value = this.findMaskByCode(iso);
                if (new_value) {
                    finded.obj.name = new_value.name;
                }
            }
            if (finded && (old.obj != finded.obj || old.determined != finded.determined)) {
                this.opt.old  = finded;
                e.value      = this.setNewMaskValue(value, finded.mask);
                this.setInputAttrs(e, finded.obj.iso_code, finded.obj.name);
                this.focused(e);
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
        var maths = [];
        for (var mid in masklist) {
            var mask = masklist[mid]['mask'];
            var pass = true;
            for (var it=0, im=0; (it < value.length && im < mask.length);) {
                var chm = mask.charAt(im);
                var cht = value.charAt(it);

                if (!plugin.regex.test(chm) && chm !== '_') {
                    im++;
                    continue;
                }

                if ((chm === '_' && plugin.regex.test(cht)) || (cht == chm)) {
                    it++;
                    im++;
                } else {
                    pass = false;
                    break;
                }
            }

            if (pass && it==value.length) {
                var determined = mask.substr(im).search(plugin.regex) == -1;
                mask = mask.replace(new RegExp([plugin.regex.source].concat('_').join('|'), 'g'), '_');
                maths.push({
                    mask:       mask,           // новая маска для ввода
                    obj:        masklist[mid],  //
                    determined: determined,     //
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
        var sortedCodes = phoneCodes.sortPhones(phoneCodes.all); // phoneCodes
        for (i in sortedCodes) {
            var one = sortedCodes[i];
            if (sortedCodes[i].iso_code === code) {
                return one;
            }
        }
        return false;
    },
    setNewMaskValue: function(value, mask) {
        var value       = this.getVal(value),
            mask       = mask.split(''),
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

    setInputAttrs:function (e, flag, title) {
        var i = e.parentNode.getElementsByClassName('selected')[0].getElementsByClassName('flag')[0];
        i.className = 'flag '+ flag;
        i.parentNode.setAttribute('title', title);
        this.opt.country = flag;
    },
};

/**
 * Получить все цифры в строке
 *
 * parseInt(value.replace(/\D+/g,""))
 *
 */

/**
 *  Последняя циферка
 *
 * parseInt(value.match(/([\d+])(?:[\D]+)?$/)[0])
 *
 */



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



    return plugin;
})();