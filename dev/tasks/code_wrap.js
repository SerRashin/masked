var path = require('path');

module.exports = function (grunt) {
  grunt.registerMultiTask('code_wrap', function() {
    var options = this.options({
      'data': '{}'
    });
    this.files.forEach(function(file) {
      var src = file.src.filter(function(filePath) {
        // Warn on and remove invalid source files.
        if (!grunt.file.exists(filePath)) {
          grunt.log.warn('Source file `' + filePath + '` not found.');
          return false;
        } else {
          return true;
        }
      });
      if (!src.length) {
        grunt.log.warn(
            'Destination `' + file.dest +
            '` not written because `src` files were empty.'
        );
        return;
      }
      var template = src.map(function(filePath) {
        return grunt.file.read(filePath);
      }).join('\n');

      var replaceMap = [];
      for(var key in options.data) {
        if(!options.data.hasOwnProperty(key)) continue;

        replaceMap.push({
          key: options.selector.start + key + options.selector.end,
          value: ( (typeof options.data[key] === 'function')  ? options.data[key]() : options.data[key] )
        });
      }
      var temp = template;
      if (typeof replaceMap !== 'undefined') {
        for(var i in replaceMap) {
          var el = replaceMap[i];
          temp = temp.replace(el.key, el.value);
        }
      }

      grunt.file.write(file.dest, temp);
      grunt.log.writeln('File `' + file.dest + '` created.');
    });
  });
};