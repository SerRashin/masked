var actions = {

    /**
     * При фокусе на поле ввода
     * @return void
     */
    focus: function () {
       this.focused();
    },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    click: function () {
        var self = this;

        if (self.opt.select_range !== false) {
            self.setRange();
        } else {
            self.focused();
        }
    },

    /**
     * При двойном нажатии
     * @return void
     */
    dblclick:function () {
        actions.click.bind(this);
    },

    /**
     * При потери фокуса
     * @return boolean
     */
    blur: function () {
        var self = this;
        if (self.opt.select_range !== false) {
            self.unsetRange();
        }

        return true;
    },

    /**
     * При вставке номера телефона
     * @param e
     * @return void
     */
    paste: function(e) {
        e.preventDefault();
        this.findMask(getPhone((e.originalEvent || e).clipboardData.getData('text/plain')));
    },

    /**
     * При нажатии клавиши
     * @return void|boolean
     */
    keydown: function (e) {
        var index,
            num,
            self        = this,
            element     = self.opt.element,
            code        = e.which || e.keyCode,
            ctrlKey     = e.ctrlKey||e.metaKey,
            key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
            value       = element.value,
            select_range= self.opt.select_range;

        if (code === 8) {  // BACKSPACE
            index = self.getLastNum();
            if (_regex.test(value[index]) === true) {

                if (select_range !== false) {
                    if (select_range.focus === true) {
                        self.replaceRange();
                        index   = select_range.start;
                        self.unsetRange();
                        self.opt.select_range.changed  = select_range.end - select_range.start > 1;
                    }
                }
                self.removeLastChar(index);
                self.setCaretFocus(index ,index);


                self.findMask(element.value); // ищем новую маску
                self.focused();

                return false;
            } else {
                return false;
            }
        } else {
            if(ctrlKey === true && code === 86) {
                return true;
            } else {

                num = value.indexOf('_');
                if (select_range !== false) {
                    if (select_range.focus === true) {
                        if (_regex.test(key) === true) {
                            self.replaceRange();
                            num   = select_range.start;
                            value = element.value;
                            self.unsetRange();
                            self.opt.select_range.changed  = select_range.end - select_range.start > 1;
                        }
                    }
                }

                if (num !== -1) { // если есть еще пустые символы
                    if (_regex.test(key) === true && value[num] === '_' ) {
                        self.setCaretFocus(num, (num + 1));
                    } else {
                        return false;
                    }
                } else {
                    // тут добавляем проверку на коды большей длинны
                    if (self.ifIssetNextMask() && _regex.test(key) === true) {
                        return true;
                    }
                    return false;
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
            element     = self.opt.element,
            code        = e.keyCode || e.which,
            value       = element.value,
            opt         = self.opt,
            select_range= opt.select_range;

        if (code === 8) {     // BACKSPACE
            index = self.getLastNum();
            if (_regex.test(value[index]) === true) {
                index += 1;
                self.focused();
                return false;
            } else {
                return false;
            }
        }  else if(code === 13) {
            if (opt.onSend) {
                opt.onSend(opt);
            }
        } else {
            num   = value.indexOf('_');
            index = (num !== -1) ? num : value.length;

            if (select_range.changed !== true) {
                self.findMask(element.value); // ищем новую маску
                self.focused();
            } else {
                if (num === -1) {
                    self.unsetRange();
                    self.focused();
                }
            }

        }
    },
};