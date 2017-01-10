/**
 * Объект маски
 */
var Mask = function (el, args) {
    var self = this;

    var init = function(el) {
        if (el) {
            var opt = self.opt;

            opt.oldState = el;

            self.setTemplate();
            self.addActions(opt.element);

            opt.xpath = getElementPath(opt.element);
        }

    };

    self.opt = {
        xpath:            false,                    // нахождение елемента по ДОМ дереву
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
        onTitleChanged:   args.onTitleChanged       || MConf('onTitleChanged'),
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

                    /**
                     * При клике "вне" масок, скрывать список
                     */
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

                    if (opt.popup_direction === "auto") {
                        var winHeight = w.innerHeight || d.documentElement.clientHeight || d.body.clientHeight,
                            offset = findPos(cur_el),
                            fromTop = (offset.top - cur_el.scrollTop),
                            maskBlockHeight = cur_el.clientHeight;

                        if ((winHeight - (fromTop + wrapper.childNodes[1].clientHeight)) <= maskBlockHeight) {
                            addClass(cur_el, top);
                        }
                    } else if (opt.popup_direction === 'top') {
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
            one_country = opt.one_country,
            language    = opt.lang,
            country     = opt.country,
            phone       = getPhone(_phone),
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

            if (self.opt.element) {
                self.setTitle(mask);
                self.setMask(mask);
                self.setPhone(phone);

                if (self.opt.initial_focus === true) {
                    self.focused();
                }
            }

        }

        return mask;
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

            i.parentNode.setAttribute('title', title_text);

            if (isFunction(opt.onTitleChanged)) {
                opt.onTitleChanged(title_text, title);
            }
        }

        return self;
    },
    setPhone: function (phone) {
        var self  = this,
            opt   = self.opt;
        var value = getNewMaskValue(
            phone,
            opt.mask.replace(new RegExp([_regex.source].concat('_').join('|'), 'g'), '_')
        );

        if (
            isFunction(opt.onValueChanged) &&
            opt.phone !== phone
        ) {
            opt.onValueChanged(getPhone(value), value);
        }

        opt.phone = phone;

        opt.element.placeholder = value;
        opt.element.value       = value;
    },

    maskReplace: function (e) {
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

                        return Masked.phoneCodes.loadMask([iso], [language], function() {
                            self.opt.country = iso;
                            self.opt.lang = language;

                            value = self.opt.pre_value.length > value.length ? self.opt.pre_value : value;

                            var m = self.findMask(value);
                            if (self.opt.initial_focus === true) {
                                self.focused();
                            }

                            self.opt.pre_value = false;

                            return m;
                        });
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