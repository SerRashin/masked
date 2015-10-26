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
        var self     = this,
            p        = plugin,
            regex    = p.regex,
            instance = p.selectInstance(self),
            code     = e.which || e.keyCode,
            key      = e.key   || String.fromCharCode(code),
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