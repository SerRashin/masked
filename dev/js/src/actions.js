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
  dblclick: function () {
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
      self = this,
      p = plugin,
      instance = p.getInst(self),
      data = e.data,
      value = self.value;

    num = value.indexOf('_');

    if (num !== -1) { // если есть еще пустые символы
      if (_regex.test(data) === true && value[num] === '_') {

        self.value = getPhone(value + '' + data);

        instance.setMask(self);

        setTimeout(function () {
          instance.focused();
        });
      }
    } else {
      if (instance.ifIssetNextMask() && _regex.test(data) === true) {

        instance.setMask(self);

        setTimeout(function () {
          instance.focused();
        });

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
      var self = this,
        p = plugin,
        instance = p.getInst(self);

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

  inputText: function (e) {
    var index,
      num,
      self = this,
      p = plugin,
      instance = p.getInst(self),
      code = e.which || e.keyCode,
      key = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48) : String.fromCharCode(code), // для numpad(а) преобразовываем
      value = self.value,
      select_range = instance.opt.select_range;

    num = value.indexOf('_');

        // backspace
    if (code === 8) {
      index = getLastNum(self);

      if (select_range !== false) {
        if (select_range.focus === true) {
          instance.replaceRange();
          index = select_range.start;
          instance.unsetRange();
          instance.opt.select_range.changed = select_range.end - select_range.start > 1;
        }
      }

      removeLastChar(self, index);
      instance.setMask(self); // ищем новую маску
      instance.focused();

      return false;
    }

    if (isNaN(key)) {
      return false;
    }

    if (_regex.test(key) === true && value[num] === '_') { // если есть еще пустые символы
      if (select_range !== false) {
        if (select_range.focus === true) {
          instance.replaceRange();
          instance.unsetRange();
          instance.opt.select_range.changed  = select_range.end - select_range.start > 1;

          value = instance.opt.element.value;
          num = value.indexOf('_');
        }
      }

      instance.addDigitToMask(key);
      instance.setMask(self); // ищем новую маску
      instance.focused();
    } else {
      if (instance.ifIssetNextMask() && _regex.test(key) === true) {

        instance.setMask(self);
        instance.focused();
        return true;
      }
    }

    return false;
  },
  /**
   * При вставке номера телефона
   * @param e
   * @return void
   */
  paste: function (e) {
    e.preventDefault();
    var self = this,
      p = plugin,
      instance = p.getInst(self),
      clipboard_text = (e.originalEvent || e).clipboardData.getData('text/plain');

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
          {
            get: function () {
              return this.keyCode;
            }
          }
        );
    }
  } catch (e) {
  }
}());