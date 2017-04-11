MaskEventBroker.create('find.mask');
// MaskEventBroker.create('set.phone');
// MaskEventBroker.create('set.phone');

var Mask = function (el, args) {
  var self = this;

  var opt = self.options = {
    xpath:            false,                    // нахождение елемента по ДОМ дереву
    // pre_value:        false,
    // listOpened:       false,                    // список открыт
    element:          el,
    language:         args.language                || MConf('language'),
    country:          args.country                 || MConf('country'),
    phone:            args.phone                   || false,
    // mask:             args.mask                 || '',
    // onSend:           args.onSend               || MConf('onSend'),
    // onToggleList:     args.onToggleList         || MConf('onToggleList'),
    // onShowList:       args.onShowList           || MConf('onShowList'),
    // onHideList:       args.onHideList           || MConf('onHideList'),
    // onValueChanged:   args.onValueChanged       || MConf('onValueChanged'),
    // onTitleChanged:   args.onTitleChanged       || MConf('onTitleChanged'),
    // one_country:      args.one_country          || MConf('one_country'),    // режим одной страны
    // first_countries:  args.first_countries      || MConf('first_countries'),
    // exceptions:       args.exceptions           || MConf('exceptions'),
    // name:             '',
    // title: {
    //   country:          '',
    //   region:           '',
    //   city:             '',
    //   operator:         ''
    // },
    // old:              {},
    // oldState:         null,    // предыдущее состояние для переключения активностиб
    // initial_focus:    args.initial_focus       || MConf('initial_focus'),
    // select_range:     !args.select_range && !MConf('select_range') ? false : {  // разрешать выделять диапазон
    //     focus:   false,
    //     changed: false,
    //     start:   0,
    //     end:     0
    //   },
    // popup_direction: args.popup_direction || MConf('popup_direction')
  };

  //console.log(opt);

  if (el) {
    opt.oldState = el;
    el.value     = opt.phone || '';

    MaskEvents.onCreatedMaskObjects(function() {
      MaskEventBroker.publish('find.mask');
    });

    MaskEventBroker.subscribe('find.mask', function() {
      self.findMask(opt.phone);
    });
   // self.setTemplate();
    // self.addActions(opt.element);

    opt.xpath = getElementPath(opt.element);
  }
};

Mask.prototype = {
  findMask: function (_phone) {
    var find,
      mask,
      self = this,
      opt = self.options,
      one_country = opt.one_country,
      language    = opt.language,
      country     = opt.country,
      phone       = getPhone(_phone),
      pc          = phoneCodes,
      exceptions  = opt.exceptions;

    self.hardSearch(phone, language, country);

   // self.setValue(_phone);
  },

  /**
   *
   * @todo можно будет сделать исключения (для спорных ситуаций таких как CA и US) при которых флаг страны не отображается
   *
   * @param value
   * @param language
   * @param country
   * @returns {*}
   */
  hardSearch: function(value, language, country) {
    var i,
      it,
      im,
      val,
      find,
      mask,
      pass,
      determined,
      self      = this,
      maths     = [],
      pc        = phoneCodes,
      masklist  = Global.countries.all[language];

   masklist  = Global.countries.all[language];

    if (empty(masklist)) {
      return false;
    }

    masklist = pc.sortPhones(masklist, 'mask', 'desc');

    if (isset(Global.countries[country]) && !empty(Global.countries[country][language])) {
      masklist = Global.countries[country][language].concat(masklist);
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
            pass = false;
            break;
          }
        }
        if (pass && it == value.length) {
          determined = mask.substr(im).search(_regex) == -1;
          mask = mask.replace(_regex, '_');

          if (value === '1' && masklist[i].iso_code !== 'us') {
            continue;
          }

          maths.push(masklist[i]);
        }
      }
    }

    maths = phoneCodes.sortPhones(maths, 'mask', 'desc');

    find = false;
    for (i in maths) {
      if (maths.hasOwnProperty(i)) {
        val = maths[i].mask.replace(/\D+/g,"");
        if (parseInt(val) === parseInt(value)) { // точное совпадение
          find = maths[i];
        }
      }
    }

    if (find) {
      return find;
    }

    // так как у нас не точное совпадение начинаем искать по подмаскам
    if (maths.length > 1) {
      maths.sort(function (a, b) {
        return Math.sign((a['mask'].match(/_/g) || []).length - (b['mask'].match(/_/g) || []).length);
      });
    }

    if (isset(Global.countries[country]) && empty(Global.countries[country][language]) && maths && value) {

      for(i in maths) {
        if (maths.hasOwnProperty(i)) {
          var iso = maths[i]['iso_code'];
          if (iso === 'ca') {
            iso = 'us';
          }

          console.log(maths);

          MaskEventBroker.subscribe('load.all.masks.lists', function() {
            phoneCodes.loadMask('all', Global.languages, function() {
              MaskEvents.events.maskListLoaded = true;
            });
          });

          // if (Global.initialization === true) {
          //   MaskedSubListObserver.add({
          //     object: self,
          //     country: iso,
          //     language: language
          //   });
          // } else {
          //
          //   return Masked.phoneCodes.loadMask([iso], [language], function() {
          //     self.opt.country = iso;
          //     self.opt.lang = language;
          //
          //     value = self.opt.pre_value.length > value.length ? self.opt.pre_value : value;
          //
          //     var m = self.findMask(value);
          //     if (self.opt.initial_focus === true) {
          //       self.focused();
          //     }
          //
          //     if (Global.initialization === false) {
          //       self.focused();
          //     }
          //
          //     self.opt.pre_value = false;
          //
          //     return m;
          //   });
          // }
        }
      }
    }


  },



  setValue: function(value) {
    var self  = this,
        opt   = self.options;

    opt.phone               = value;
    opt.element.placeholder = value;
    opt.element.value       = value;
  }

};