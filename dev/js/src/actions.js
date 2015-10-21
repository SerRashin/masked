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
        var instance = plugin.selectInstance(this);
        $code = e.keyCode;
        $key  = parseInt(e.key);

        if ($code === 8) {  // BACKSPACE
            var index = instance.getLastNum(this);
            if (plugin.regex.test(this.value[index]) === true) {
                instance.removeChar(this, index);
                instance.setCaret(this, index ,index);
                return false;
            } else {
                return false;
            }
        } else {
            var num = this.value.indexOf('_');
            if (num !== -1) { // если есть еще пустые символы
                if (plugin.regex.test($key) === true) {
                    instance.setCaret(this, num, (num+1) );
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
        var self        = this;
        var instance    = plugin.selectInstance(self);
        $code = e.keyCode;
        if ($code === 8) {     // BACKSPACE
            var index = instance.getLastNum(self);
            if (plugin.regex.test(self.value[index]) === true) {
                index += 1;
                instance.setCaret(self, index ,index);
                //instance.checkMask(this); // ищем новую маску
                return false;
            } else {
                return false;
            }
            if (/[\(\)\- ]/.test(self.value[index])) {
                instance.setCaret(self, index, index);
                //instance.keyboardApply(this,instance.matchMask(this)); // ищем новую маску
            }
        } else {
            var num   = self.value.indexOf('_');
            var index = (num !== -1) ? num : self.value.length;
            instance.setCaret(self, index, index);
            instance.setCheckedMask(self); // ищем новую маску
            //instance.keyboardApply(this, instance.matchMask(this)); // ищем новую маску
        }
    }
};