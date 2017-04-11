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