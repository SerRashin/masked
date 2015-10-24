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
            code     = e.keyCode,
            key      = parseInt(e.key);

        if (code === 8) {  // BACKSPACE
            var index = instance.getLastNum(self);
            if (regex.test(self.value[index]) === true) {
                instance.removeChar(self, index);
                instance.setCaret(self, index ,index);
                return false;
            } else {
                return false;
            }
        } else {
            var num = self.value.indexOf('_');
            if (num !== -1) { // если есть еще пустые символы
                if (regex.test(key) === true) {
                    instance.setCaret(self, num, (num+1) );
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
        var self        = this,
            p           = plugin,
            regex       = p.regex,
            instance    = p.selectInstance(self),
            code        = e.keyCode;

        if (code === 8) {     // BACKSPACE
            var index = instance.getLastNum(self);
            if (regex.test(self.value[index]) === true) {
                index += 1;
                instance.setCaret(self, index ,index);
                return false;
            } else {
                return false;
            }
            if (/[\(\)\- ]/.test(self.value[index])) {
                instance.setCaret(self, index, index);
            }
        }  else if(e.which === 13 || e.keyCode === 13) {
            if (instance.opt.onsend) {
                instance.opt.onsend(instance.opt);
            }
        } else {
            var num   = self.value.indexOf('_'),
                index = (num !== -1) ? num : self.value.length;
            instance.setCaret(self, index, index);
            instance.setCheckedMask(self); // ищем новую маску
        }
    }
};