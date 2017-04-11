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