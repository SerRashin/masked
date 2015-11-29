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
    removeChar:function(e, i) {
        var temp = e.value.split('');
            temp[i]='_';
        e.value = temp.join('');
    },

    /**
     * Установка маски
     *
     * */
    setCheckedMask: function (e,reload) {
        var iso,
            new_value,
            newSearch,
            subPhones,
            self        = this,
            value       = self.getVal(e.value),
            phone_codes = phoneCodes,
            finded      = self.maskFinder(phone_codes.all, value),
            old         = self.opt.old;

        if(finded === false) {
            finded  = self.maskFinder(phone_codes.all, value.length > 6 ? value.substring(0, 6) : value);
        }

        if(finded !== false) {
            iso = finded.obj['iso_code'];
            subPhones = typeof phone_codes[iso] !== und ? phone_codes[iso] : false ;

            if (subPhones !== false ) {
                if (value.length && subPhones.length === 0) {
                    plugin.loadMasks(iso, self.opt.lang);
                }

                if (subPhones.length !== 0 && subPhones[0]['mask'] !== finded.obj['mask'] ) {
                    subPhones.unshift({
                        'iso_code': finded.obj['iso_code'],
                        'mask': finded.obj['mask']
                    })
                }

                if (typeof old !== 'null') {
                    newSearch = self.maskFinder(subPhones, value);
                    if (newSearch) {
                        finded = newSearch;
                    }
                }
            }


            if (typeof finded.obj.name === und && old.obj != finded.obj) {
                new_value = self.findMaskByCode(iso); //  ищем по коду и ставим аргументы
                if (new_value) {
                    finded.obj.name = new_value.name;
                }
            }

            if (finded && (old.obj != finded.obj || old.determined != finded.determined) || typeof reload !== 'undefined') {
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

    ifIssetNextMask: function () {
        var self            = this,
            p               = plugin,
            iso             = self.opt.country,
            phone_codes     = phoneCodes,
            value           = self.opt.element.value,
            cur_length      = value.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_').replace(/[+()-]/g,"").length;

        if (typeof phone_codes[iso] !== und) {
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