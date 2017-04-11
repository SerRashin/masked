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