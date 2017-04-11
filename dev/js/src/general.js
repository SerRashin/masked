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