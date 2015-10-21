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

        this.opt.element = wrapper.childNodes[1];
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


