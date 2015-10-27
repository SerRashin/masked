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
        name:           '',
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
        if(sortedCodes.length===0) {
            return;
        }
        for (i in sortedCodes) {
            var one             = sortedCodes[i],
                iso             = one.iso_code.toString().toLowerCase(),
                name            = one.name,
                mask            = one.mask;

            if (typeof name === und)continue;
            if (opt.phone === false) {
                if (opt.country === iso) {
                    this.opt.name = name;
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
            dataset     = self.dataset;

        var finded_old          = instance.findMaskByCode(instance.opt.country);
        var finded_new          = instance.findMaskByCode(dataset['isoCode']);
        input.value             = instance.setNewMaskValue(
            instance.getVal(input.value).replace(finded_old.phone_code, finded_new.phone_code),
            instance.opt.mask.replace(new RegExp([p.regex.source].concat('_').join('|'), 'g'), '_')
        );

        input.placeholder       = finded_new.mask;
        instance.opt.value      = input.value;
        instance.opt.name       = finded_new.name;
        instance.opt.mask       = finded_new.mask;
        instance.opt.country    = finded_new.iso_code;

        flag_el                 = parent.childNodes[0].childNodes[0];
        flag_el.className       = 'flag '+ finded_new.iso_code,
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
        this.opt.name    = title;
        this.opt.value   = value;
    }
};