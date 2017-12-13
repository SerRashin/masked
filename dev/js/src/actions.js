var actions = {
    /**
     * При фокусе на поле ввода
     * @return void
     */
    focus: function (e) {
        Masked.getInst(this).focused();
    },

    /**
     * При двойном нажатии
     * @return void
     */
    dblclick:function () {
        this.click();
    },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    click: function () {
        var inst = Masked.getInst(this);

        if (inst.opt.select_range !== false) {
            inst.setRange();
        } else {
            inst.focused();
        }
    },

    /**
     * При потери фокуса
     * @return void
     */
    blur: function () {
        var inst = Masked.getInst(this);
        if (inst.opt.select_range !== false) {
            inst.unsetRange();
        }

        Popover.hide();

        return true;
    },

  /**
   * События новых символов
   *
   * только для android
   *
   * @param e
   * @returns {boolean}
   */
  textInput: function (e) {
    var index,
      num,
      self        = this,
      p           = plugin,
      instance    = p.getInst(self),
      data        = e.data,
      value       = self.value;

    num = value.indexOf('_');

    if (num !== -1) { // если есть еще пустые символы
      if (_regex.test(data) === true && value[num] === '_' ) {

        self.value = getPhone(value + '' + data);

        instance.setMask(self);

        setTimeout(function () {
          instance.focused();
        });
      }
    } else {
      if (instance.ifIssetNextMask() && _regex.test(data) === true) {
        return true;
      }
    }

    return false;
  },

  /**
   * Удаление символов
   *
   * только для android
   *
   * @param e
   * @returns {boolean}
   */
  input: function (e) {
    e.preventDefault();
      if (e.data === null) {
        var self      = this,
          p           = plugin,
          instance    = p.getInst(self);

        self.value = instance.opt.value;

        var index = getLastNum(self);
        removeLastChar(self, index);

        setCaretFocus(self, index);
        instance.setMask(self); // ищем новую маску

        setTimeout(function () {
          instance.focused();
        });
      }
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
            select_range= instance.opt.select_range,
            _false      = false,
            _true       = true;

        Popover.hide();

        if (code === 8) {  // BACKSPACE
            index = getLastNum(self);
            if (_regex.test(value[index]) === _true) {
                if (select_range !== false) {
                    if (select_range.focus === true) {
                        instance.replaceRange();
                        index   = select_range.start;
                        instance.unsetRange();
                        instance.opt.select_range.changed  = select_range.end - select_range.start > 1;
                    }
                }
                removeLastChar(self, index);
                setCaretFocus(self, index ,index);
                instance.setMask(self); // ищем новую маску
                instance.focused();
                return _false;
            } else {
                return _false;
            }
        } else {
            if(ctrlKey === true && code === 86) {
                return _true;
            } else {

                num = value.indexOf('_');
                if (select_range !== false) {
                    if (select_range.focus === true) {
                        if (_regex.test(key) === _true) {
                            instance.replaceRange();
                            num   = select_range.start;
                            value = self.value;
                            instance.unsetRange();
                            instance.opt.select_range.changed  = select_range.end - select_range.start > 1;
                        }
                    }
                }

                if (num !== -1) { // если есть еще пустые символы
                    if (_regex.test(key) === _true && value[num] === '_' ) {
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
                instance.focused();
                return _false;
            } else {
                return _false;
            }
        }  else if(code === 13) {
            if (opt.onSend && instance.validationErrors() === false) {
                opt.onSend(opt);
            }
        } else {
            num   = value.indexOf('_');
            index = (num !== -1) ? num : value.length;

            instance.setMask(self); // ищем новую маску
            instance.focused();
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

        /**
         * @todo нужно сделать дополнительно вставку по субкодам если они еще не загружены
         *
         */
        instance.opt.element.value = getPhone(clipboard_text);
        instance.setMask(self); // ищем новую маску, и принудительно перезагружаем вторым аргументом
    }
};

(function () {
    var ev;
    try {
        ev = new KeyboardEvent('keydown');
        if (!('key' in ev)) {
            if (!('keyCode' in ev))
            Object.defineProperty(
                KeyboardEvent.prototype,
                'key',
                {get: function () {return this.keyCode;}}
            );
        }
    } catch (e) {}
}());