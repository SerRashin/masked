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
        lang:             args.lang                 || MConf('lang'),
        country:          args.country              || MConf('country'),
        phone:            args.phone                || false,
        mask:             args.mask                 || '',
        onSend:           args.onSend               || null,
        onToggleList:     args.onToggleList         || null,
        onShowList:       args.onShowList           || null,
        onHideList:       args.onHideList           || null,
        onValueChanged:   args.onValueChanged       || null,
        one_country:      args.one_country          || MConf('one_country'),    // режим одной страны
        first_countries:  args.first_countries      || MConf('first_countries'),
        exceptions:       args.exceptions           || MConf('exceptions'),
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
        }
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
                        if (value === phone_code + ''+expr) {
                            value = value.replace(phone_code + ''+expr, phone_code +''+exc[expr]);
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
                            if (self.opt.initial_focus === true) {
                                self.focused();
                            }
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
                li.dataset['isoCode']   = iso;
                li.dataset['mask']      = mask;

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
            e        = self.opt.element;
        value    = self.opt.element.value.split('');
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
            dataset     = self.dataset;

        var finded_old          = pc.findMaskByCode(instance.opt.country);
        var finded_new          = pc.findMaskByCode(dataset['isoCode']);

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
        Event.add(e,'click',       actions.click);
        Event.add(e,'dblclick',    actions.dblclick);
        Event.add(e,'keydown',     actions.keydown);
        Event.add(e,'keyup',       actions.keyup);
        Event.add(e,'paste',       actions.paste);
    },
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