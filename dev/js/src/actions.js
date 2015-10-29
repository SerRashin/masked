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