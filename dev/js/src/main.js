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