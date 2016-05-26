var actions = {
    /**
     * При фокусе на поле ввода
     * @return void
     */
    focus: function () {
        Masked.getInst(this).focused();
    },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    click: function () {
        Masked.getInst(this).focused();
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
            instance    = p.getInst(self),
            code        = e.which || e.keyCode,
            ctrlKey     = e.ctrlKey||e.metaKey,
            key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
            value       = self.value,
            _false      = false,
            _true       = true;

        if (code === 8) {  // BACKSPACE
            index = getLastNum(self);
            if (_regex.test(value[index]) === _true) {
                removeLastChar(self, index);
                setCaretFocus(self, index ,index);
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
                    if (_regex.test(key) === _true) {
                        setCaretFocus(self, num, (num + 1));
                    } else {
                        return _false;
                    }
                } else {
                    // тут добавляем проверку на коды большей длинны
                    if (instance.ifIssetNextMask() && _regex.test(key) === _true) {
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
            instance    = p.getInst(self),
            code        = e.keyCode || e.which,
            value       = self.value,
            opt         = instance.opt,
            _false      = false;

        if (code === 8) {     // BACKSPACE
            index = getLastNum(self);
            if (_regex.test(value[index]) === true) {
                index += 1;
                setCaretFocus(self, index ,index);
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
            setCaretFocus(self, index, index);
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
        instance.opt.element.value = getPhone(clipboard_text);
        instance.setMask(self); // ищем новую маску, и принудительно перезагружаем вторым аргументом
    }
};