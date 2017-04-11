/**! 
* Masked - v1.1.0 - 
* 
* @author Rashin Sergey 
* @version 1.1.0 2017-04-10
*/


var Global = {
 // pre: [],
 // initialization: false,
 // instances: [],
  languages: [],
  countries: { // коды стран которые необходимо дополнительно подключить
    all: [],     // список масок для всех стран
    ae: [],     //
    an: [],     //
    ba: [],     //
    bt: [],     //
    ca: [],     // список кодов для канады
    cn: [],     //
    de: [],     //
    ec: [],     //
    ee: [],     //
    id: [],     //
    il: [],     //
    jp: [],     //
    kp: [],     //
    la: [],     //
    lb: [],     //
    ly: [],     //
    mc: [],     //
    mm: [],     //
    mx: [],     //
    my: [],     //
    ng: [],     //
    nz: [],     //
    ru: [],     // список кодов для россии
    sa: [],     //
    sb: [],     //
    so: [],     //
    sr: [],     //
    th: [],     //
    tl: [],     //
    tv: [],     //
    tw: [],     //
    ua: [],     // список кодов для Украины
    us: [],     // список кодов для США
    vn: [],     //
    vu: [],     //
    ye: []     //
  }
};

var $M = MaskedReady = (function () {
  return function (callback) {
    this.use = true;
    callback();
    MaskEventBroker.publish('initialization');
  };
})();
$M.ready = $M;

/**
 * Этот способ намного хуже способа с оберткой через $M.ready
 */
var alternativeReady = (function () {
  return {
    timerID: 0,
    init: function () {
      if (this.timerID) {
        clearTimeout(this.timerID);
      }
      this.timerID = setTimeout(function () {
        MaskEventBroker.publish('initialization');
        MaskEvents.events.initialized = true;
      }, 250);
    }
  };
})();




/**
 * Объект хелперов нужных во всех частях программы
 */
var generalMaskedFn = {
    extend: function (defaults, options) {
        var i,
            extended = {},
            prototype = Object.prototype.hasOwnProperty;

        for (i in defaults) {
            if (defaults.hasOwnProperty(i) && prototype.call(defaults, i)) {
                extended[i] = defaults[i];
            }
        }
        for (i in options) {
            if (options.hasOwnProperty(i) && prototype.call(options, i)) {
                extended[i] = options[i];
            }
        }
        return extended;
    },
    addLanguage: function (language) {
      if (Global.languages.indexOf(language) === -1) {
        Global.languages.push(language);
      }
    }
}

var MaskedConfig = MConf = (function() {

    var exception_example = {
        'ru' : {
            localFormat:'8',
            exceptions: {
                '8975': '7975'
            }
        }
    };

    var options = {
        pathToList:         '/js/masks/',
        prefix:             'instId_',
        language:           'ru',
        country:            'ru',
        one_country:        false, // false or string 'iso_code'
        country_call_binding: false,
        first_countries:    ['ru'],
        exceptions:         exception_example,
        initial_focus:      false,
        select_range:       false,
        onToggleList:       null,
        onShowList:         null,
        onHideList:         null,
        onSend:             null,
        onValueChanged:     null,
        onTitleChanged:     null,
        popup_direction:    'auto'
    };

    
    return function (args) {
        if (typeof args === 'string') {
            return options[args];
        } else {
            for (var i in args) {
                if (args.hasOwnProperty(i) && typeof options[i] === 'undefined') {
                    console.warn('masked argument not exists');
                }
            }

            return options = generalMaskedFn.extend(options, args);
        }
    };
})();

/**
 * Все поддерживаемые масками события
 */

var MaskEvents = (function() {
  function MaskEvents() {
    this.events = {
      initialized: false, // подготовка объектов завершена
      maskListLoaded: false, // загрузка списков масок завершена
      createdMaskObjects: false // объекты масок созданы
    };

    this.oldstate = {};
    for(var i in this.events) {
      if(this.events.hasOwnProperty(i)) {
        this.oldstate[i] = [];
      }
    }
  }

  var checkEvent = function(event, callback) {

   var self = this;
   var events = self.events;
   var oldstate = self.oldstate;

   if (events.hasOwnProperty(event)) {

     oldstate[ event ].push(setInterval(function () {
       var clear = false;
       var value = events[ event ];

       if (typeof value === 'boolean') {

         if (value === true && oldstate[ event ].indexOf('clear') === -1) {
           console.info('event: ', event);

           clear = true;
           callback();
         }

         if (clear) {
           for(var i in oldstate[ event ]){
             if(oldstate[ event ].hasOwnProperty(i)) {
               clearInterval(oldstate[ event ][i]);
               oldstate[ event ][i] = 'clear';
             }
           }

         }
       }
     }, 50));
   }
  };

  MaskEvents.prototype = {
   // init: true
    onInitialized: function (callback) {
      return checkEvent.call(this, 'initialized', callback);
    },
    onMaskListLoaded: function (callback) {
      return checkEvent.call(this, 'maskListLoaded', callback);
    },
    onCreatedMaskObjects: function (callback) {
      return checkEvent.call(this, 'createdMaskObjects', callback);
    }
  };

  return new MaskEvents();
})();

/**
 * 1. Создаем событие
 * 2. Подписываемся на событие
 * 3. Вызываем событие
 */

var MaskEventBroker = (function() {
  function EventBroker() {
    this.subjects = [];
  }

  EventBroker.prototype = {
    subscribe: function(subject, callback) {
      this.get(subject).push(callback);
    },

    create: function(subject) {
      this.subjects[subject] = [];
    },

    get: function(subject){
      if( !this.has(subject) ) {
        throw new Error("Subject Not Found: "+subject);
      }

      return this.subjects[subject];
    },

    has: function(subject){
      return this.subjects.hasOwnProperty(subject);
    },

    publish: function(subject, callback) {
      var subscribers = this.get(subject),
        args = Array.prototype.slice.call(arguments,1);

      args.splice(0,0, null);
      for(var i = -1, len=subscribers.length; ++i < len; ) {
        setTimeout(Function.prototype.bind.apply(subscribers[i], args), 0);
      }

      return typeof callback === 'function' ? callback() : false;
    }
  };

  return new EventBroker();
})();

var Masked = (function(doc, win) {
  var _regex          =  new RegExp('[0-9]'),
   _regex2           = new RegExp([_regex.source].concat('_').join('|'), 'g');

function isFunction(a) {
  return typeof a === 'function';
}

function getElements(selector) {
  var i,
    element,
    elements = [],
    first_digit;
  if ( typeof selector === 'string' ) {
    first_digit = selector[0];

    if ( (first_digit === '.') || (first_digit === '#') ) {
      selector = selector.substr(1);
    }

    if (first_digit === '.') {
      element = document.getElementsByClassName( selector );
      for(i in element) {
        if (element.hasOwnProperty(i) && element[i] !== 'null') {
          elements[element[i].id||i] = element[i];
        }
      }
    } else if (first_digit === '#') {
      element = document.getElementById( selector );
      if (element !== 'null') {
        elements.push(element);
      }
    } else {
      console.warn('selector finder empty');
    }
  } else if (selector.nodeType) {
    if (selector !== 'null') {
      elements.push(selector);
    }
  }

  return elements;
}

function getElementPath(element) {
  var el = element,
    parents = [];

  while (el.parentNode !== null) {
    var sibCount = 0;
    var sibIndex = 0;
    var ch = el.parentNode.childNodes;
    for ( var i = 0; i < ch.length; i++ ) {
      var sib = ch[i];
      if ( sib.nodeName === el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }

    var nodeName = el.nodeName.toUpperCase();

    if (el.className === 'CBH-masks') {
      el = el.parentNode;
      continue;
    }

    parents.unshift((sibCount > 1 ? nodeName + '[' + (sibIndex) + ']' : nodeName));

    el = el.parentNode;
    if (el.nodeType === 11) {
      el = el.host;
    }
  }

  return '//' + parents.join("/");
};

/**
 *  SUPPOORT
 *
 *   CORS is supported in the following browsers:
 *
 *   Chrome 3+
 *   Firefox 3.5+
 *   Opera 12+
 *   Safari 4+
 *   Internet Explorer 8+
 *
 * @author Sergey Rashin
 * @link https://github.com/serhanters/sAJAX
 */
var sAJAX = function (obj) {
  var i,
    res,
    url,
    xhr,
    status,
    statusText,
    callback,
    responses = {},
    und       = 'undefined',
    availableType       = ['GET', 'POST', 'PUT'],
    availableDataType   = ['json', 'text'],
    headers             = {},
    xmlhttpobj          = XMLHttpRequest,
    Msxml2              = 'Msxml2.XMLHTTP',
    args = {
      url:            obj.url             || false,
      async:          obj.async           || false,
      data:           obj.data            || null,
      crossDomain:    obj.crossDomain     || false,
      complete:       obj.result          || function(){},
      timeout:        obj.timeout         || 10000,
      type:           ( availableType.indexOf(obj.type) !== -1 ? obj.type : null )                || "GET",
      dataType:       ( availableDataType.indexOf(obj.dataType) !== -1 ? obj.dataType : null )    || "json"
    },
    makeQueryString      = function(data) {
      var query = [];
      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          query.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
        }
      }
      return query.join('&');
    };

  if (empty(args.url)) {
    return;
  }

  if (typeof xmlhttpobj === und){
    xmlhttpobj = function () {
      try {
        var activex_obj = ActiveXObject;
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2+'.6.0' );
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2+'.3.0' );
      } catch ( e ) {}
      try {
        return new activex_obj( Msxml2 );
      } catch ( e ) {}
      throw new Error( 'This browser does not support XMLHttpRequest.' );
    };
  }
  xhr = new (("onload" in new xmlhttpobj()) ? xmlhttpobj : XDomainRequest)();

  url = args.url;

  if (typeof args.data === 'string') {
    try {args.data = JSON.parse(args.data);} catch ( e ) {}
  }

  if (typeof args.data === 'object') {
    args.data = makeQueryString(args.data);
  }

  if (args.type === 'GET' && args.data && args.data.length>0) {
    url = args.url + '?' +args.data.toString();
  }
  xhr.open( args.type, url, args.async );

  if ( !args.crossDomain ) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  for ( i in headers ) { // Support: IE<9
    if ( headers.hasOwnProperty(i) && isset(headers[ i ]) ) {
      xhr.setRequestHeader( i, headers[ i ] + "" );
    }
  }

  if (args.data && args.data.toString().length>0) {
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    args.data = args.data.toString();
  }

  try {
    xhr.send(args.data || null);
  } catch ( e ) {}

  if  (args.async) {
    var timeout = setTimeout( function() {
      xhr.abort();
    }, args.timeout);
  }

  callback = function() {
    if ( xhr.readyState === 4  ) {
      if  (args.async) {
        clearTimeout(timeout);
      }
      callback = 'undefined';
      if ( xhr.readyState !== 4 ) {
        xhr.abort();
      } else {
        status = xhr.status;
        if ( typeof xhr.responseText === "string" ) {responses.text = xhr.responseText;}
        try {statusText = xhr.statusText;} catch( e ) {statusText = "";}
        if ( !status && !args.crossDomain ) {
          status = responses.text ? 200 : 404;
        } else if ( status === 1223 ) {
          status = 204;
        }
      }
    }

    if ( responses ) {
      if ( !status && !args.crossDomain ) {
        status = responses.text ? 200 : 404;
      } else if ( status === 1223 ) {
        status = 204;
      }
      if (status === 200) {
        if(args.dataType === 'text') {
          res = responses.text || '';
        } else if (args.dataType === 'json') {
          try {
            res = JSON.parse(responses.text) || '';
          } catch ( e ) {
            res = '';
          }
        }
        /**
         * @param a responce result
         * @param b responce code
         * @param c response text
         * @param d header for responce
         */
        args.complete(res, status, statusText, xhr.getAllResponseHeaders());
      }
    }
  };

  if ( !args.async ) {
    callback();
  } else if ( xhr.readyState === 4 ) { // (IE6 & IE7) if it's in cache and has been
    setTimeout( callback, 20 );
  } else {
    xhr.onreadystatechange = callback;
  }
};

/**
 * Проверяет переменную на существование
 * @returns {boolean}
 */
function isset() {
  var a  = arguments,
    l  = a.length,
    i  = 0,
    u  = undefined,
    uu = ''+u;

  while (i !== l) {
    if (a[i] === u || typeof a[i] === uu || a[i] === null) {
      return false;
    }
    i++;
  }

  return true;
}

/**
 * Проверяет переменную на пустоту
 * @returns {boolean}
 */
function empty()  {
  var a  = arguments,
    l  = a.length,
    i  = 0,
    i2 = 0,
    u  = undefined,
    uu = ''+ u,
    ev = [u, false, ''],
    el = ev.length;
  while (i !== l) {
    for (i2 = 0; i2 < el; i2++) {
      if (typeof a[i] === uu || a[i] === ev[i2] || a[i].length === 0) {
        return true;
      }
    }
    i++;
  }
  return false;
}

/**
 * Получить значение маски без символов только int
 * @param value
 * @returns {string}
 */
function getPhone(value) {
  return (value+'').replace(/\D+/g,"");
}
var phoneCodes = {

  /**
   * Сортировать номера телефонов по ключу
   * @param maskList
   * @param k
   * @param s
   * @returns {*}
   */
  sortPhones:function (maskList, k, s) {
    var txt_mask = 'mask',
      txt_desc = 'desc',
      txt_asc  = 'asc',
      key      = (k  === txt_mask) ? txt_mask : 'name',
      sort     = (s === txt_desc) ? txt_desc : txt_asc;

    if (maskList) {
      maskList.sort(function (a, b) {
        if (!isset(a[key]) || !isset(b[key])) {
          return !isset(a[key]) ? 1 : -1;
        }

        if (key === txt_mask) {
          a = a[key].replace(/\D+/g,"");
          b = b[key].replace(/\D+/g,"");
        } else {
          a = a[key];
          b = b[key];
        }
        if (a > b) {
          return sort==txt_asc ? 1:-1;
        } else if (a < b) {
          return sort==txt_asc ? -1:1;
        } else {
          return 0;
        }
      });
    }

    return maskList;
  },

  /**
   * Загрузить маску
   *
   * @param types
   * @param languages
   * @param callback
   */
  loadMask: function (types, languages, callback) {
    var self  = this,
      gc    = Global.countries;


    var type = typeof types === 'string' ? [types] : types.splice(0,1)[0];
    var lang = typeof languages === 'string' ? [languages] : languages.splice(0,1)[0];

    if (typeof type === 'undefined' && typeof lang === 'undefined') {
      return callback();
    }

    if (typeof type !== 'undefined' && typeof gc[type] === 'undefined') {
      return self.loadMask(types, languages, callback);
    }

    if (typeof gc[type][lang] !== 'undefined' && gc[type][lang].length > 0) {
      if (languages.length === 0) {
        return callback();
      } else {
        self.loadMask(types, languages, callback);
      }
    } else {
      sAJAX({
        url:         MConf('pathToList') + type + '/' + (!empty(lang) ? lang : 'ru') + '.min.json',
        type:        'GET',
        async:       true,
        crossDomain: true,             /// при crossdomain не возможен заголовок XMLHttpRequest
        dataType:    'json',
        result: function (responce) {
          gc[type][lang] = self.sortPhones(responce, 'mask', 'desc');

          if (languages.length === 0 && isFunction(callback)) {
            return callback();
          } else {
            self.loadMask(types, languages, callback)
          }
        }
      });
    }

    return true;
  },

  // findMaskByCode: function(type, code, language) {
  //   var i,
  //     one,
  //     self = this,
  //     gc    = Global.countries,
  //     sortedCodes = self.sortPhones(gc[type][language], 'name', 1);
  //
  //   if (sortedCodes.length > 0) {
  //     for (i in sortedCodes) {
  //       if (sortedCodes.hasOwnProperty(i)) {
  //         one = sortedCodes[i];
  //         /**
  //          * @namespace one.iso_code Код страны
  //          */
  //         if (one.iso_code === code) {
  //           return one;
  //         }
  //       }
  //     }
  //   }
  //
  //   return false;
  // }
};
var actions = {

    /**
     * При фокусе на поле ввода
     * @return void
     */
    // focus: function () {
    //    this.focused();
    // },

    /**
     * При нажатии на поле ввода
     * @return void
     */
    // click: function () {
    //     var self = this;
    //
    //     if (self.opt.select_range !== false) {
    //         self.setRange();
    //     } else {
    //         self.focused();
    //     }
    // },

    /**
     * При двойном нажатии
     * @return void
     */
    // dblclick:function () {
    //     actions.click.bind(this);
    // },

    /**
     * При потери фокуса
     * @return boolean
     */
    // blur: function () {
    //     var self = this;
    //     if (self.opt.select_range !== false) {
    //         self.unsetRange();
    //     }
    //
    //     return true;
    // },

    /**
     * При вставке номера телефона
     * @param e
     * @return void
     */
    // paste: function(e) {
    //     e.preventDefault();
    //     this.findMask(getPhone((e.originalEvent || e).clipboardData.getData('text/plain')));
    // },

    /**
     * При нажатии клавиши
     * @return void|boolean
     */
    // keydown: function (e) {
    //     var index,
    //         num,
    //         self        = this,
    //         element     = self.opt.element,
    //         code        = e.which || e.keyCode,
    //         ctrlKey     = e.ctrlKey||e.metaKey,
    //         key         = e.key ? e.key : (code >= 96 && code <= 105) ? String.fromCharCode(code - 48)  : String.fromCharCode(code), // для numpad(а) преобразовываем
    //         value       = element.value,
    //         select_range= self.opt.select_range;
    //
    //     if (code === 8) {  // BACKSPACE
    //         index = self.getLastNum();
    //         if (_regex.test(value[index]) === true) {
    //
    //             if (select_range !== false) {
    //                 if (select_range.focus === true) {
    //                     self.replaceRange();
    //                     index   = select_range.start;
    //                     select_range.focus = false;
    //                     self.opt.select_range.changed  = select_range.end - select_range.start > 1;
    //
    //                     if (select_range.start === 1 && select_range.end === value.length) {
    //                         self.unsetRange();
    //                     }
    //                 }
    //             }
    //             self.removeLastChar(index);
    //             self.setCaretFocus(index ,index);
    //
    //
    //             self.findMask(element.value); // ищем новую маску
    //             self.focused();
    //
    //             return false;
    //         } else {
    //             return false;
    //         }
    //     } else {
    //         if(ctrlKey === true && code === 86) {
    //             return true;
    //         } else {
    //
    //             num = value.indexOf('_');
    //             if (select_range !== false) {
    //
    //                 if (select_range.focus === true) {
    //                     if (_regex.test(key) === true) {
    //                         self.replaceRange();
    //                         num   = select_range.start;
    //                         value = element.value;
    //                         select_range.focus = false;
    //                         self.opt.select_range.changed  = select_range.end - select_range.start > 1;
    //
    //                         if (select_range.start === 1 && select_range.end === value.length) {
    //                             self.unsetRange();
    //                         }
    //                     }
    //                 } else if (select_range.changed) {
    //                     if (select_range.end === num+1) {
    //                         self.unsetRange();
    //                     }
    //
    //
    //                 }
    //             }
    //
    //             if (num !== -1) { // если есть еще пустые символы
    //                 if (_regex.test(key) === true && value[num] === '_' ) {
    //                     self.setCaretFocus(num, (num + 1));
    //                 } else {
    //                     return false;
    //                 }
    //             } else {
    //                 // тут добавляем проверку на коды большей длинны
    //                 return !!(self.ifIssetNextMask() && _regex.test(key) === true);
    //             }
    //         }
    //     }
    // },

    /**
     * При отпускании клавиши проверим фокусировку
     * @param e
     * @return boolean|void
     */
    // keyup: function (e) {
    //     var index,
    //         num,
    //         self        = this,
    //         element     = self.opt.element,
    //         code        = e.keyCode || e.which,
    //         value       = element.value,
    //         opt         = self.opt,
    //         select_range= opt.select_range;
    //
    //     if (code === 8) {     // BACKSPACE
    //         index = self.getLastNum();
    //         if (_regex.test(value[index]) === true) {
    //             index += 1;
    //             self.focused();
    //             return false;
    //         } else {
    //             return false;
    //         }
    //     }  else if(code === 13) {
    //         if (opt.onSend) {
    //             opt.onSend(opt);
    //         }
    //     } else {
    //         num   = value.indexOf('_');
    //         index = (num !== -1) ? num : value.length;
    //
    //
    //         if (select_range.changed !== true) {
    //             self.findMask(element.value); // ищем новую маску
    //             self.focused();
    //         } else {
    //             if (num === -1) {
    //                 self.unsetRange();
    //                 self.focused();
    //             }
    //         }
    //
    //     }
    // }
};
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
/**
 * Событие инициализации объектов.
 */
MaskEventBroker.create('initialization');
MaskEventBroker.create('load.all.masks.lists');
MaskEventBroker.create('create.mask.objects');


//

/**
 * @var mixed doc
 * @var null type_null
 */
var plugin = function (params) {
  MaskEvents.events.initialized = false;
  MaskEvents.events.maskListLoaded = false;
  MaskEvents.events.createdMaskObjects = false;

  var self        = this;

  // self.paths = [];
  // self.ready = false;

  self.init(params);

  if (typeof MaskedReady.use === 'undefined') {
    alternativeReady.init();
  }
};


plugin.prototype = {

  /**
   * Первичная инициализация
   *
   * Этап выборки елементов по селектору и передача всех элементов в сервер приема сообщений [MaskedObserver]
   * @param params
   * @returns {plugin}
   */
  init: function (params) {
    var self  = this,
      elements,
      options;

    if (params) {
      if (typeof params === 'string') {
        params = {
          selector: params
        };
      }
      options = generalMaskedFn.extend(MConf(), params);
    }

    if (typeof params.selector !== 'undefined') {
      elements = getElements(params.selector);
    }


    // Masked.phoneCodes.loadMask('all', languages, function() {
    //   callback();
    // });

    if (Object.keys(elements).length) {
      MaskEventBroker.subscribe('initialization', function() {
        var i,
          element;

        for(i in elements) {
          if (elements.hasOwnProperty(i)) {
            element   = elements[i];

            if (element) {
              var maskOptions = generalMaskedFn.extend(
                generalMaskedFn.extend(
                  generalMaskedFn.extend({}, options),
                  element.dataset
                ),
                element.value ? { phone: element.value } : {}
              );

              element.value = maskOptions.phone;

              generalMaskedFn.addLanguage(maskOptions.language);

              MaskEvents.onInitialized(function() {
                MaskEventBroker.publish('load.all.masks.lists');
              });

              MaskEventBroker.subscribe('load.all.masks.lists', function() {
                phoneCodes.loadMask('all', Global.languages, function() {
                  MaskEvents.events.maskListLoaded = true;
                });
              });

              MaskEvents.onMaskListLoaded(function() {
                MaskEventBroker.publish('create.mask.objects');
                MaskEvents.events.createdMaskObjects = true;
              });

              MaskEventBroker.subscribe('create.mask.objects', function() {
                var object = new Mask(element, maskOptions);


              });
            }
          }
        }
      });
    }

    return self;
  }
};
  return plugin;
})(document, window);
// $.masked = new Masked;

/**
 * Добавить поддержку $(selector).Masked( options );
 */