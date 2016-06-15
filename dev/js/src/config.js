var MaskedConfig = MConf = (function() {

    var exception_example = {
        'ru' : {
            //localFormat:'8',
            exceptions: {
                '8975': '7975'
            }
        }
    };



    var options = {
        pathToList:         '/js/masks/',
        prefix:             'instId_',
        lang:               'ru',
        country:            'ru',
        one_country:        false, // false or string 'iso_code'
        first_countries:    ['ru'],
        exceptions:         exception_example,
    };

    
    return function (args) {
        if (typeof args === 'string') {
            return options[args];
        } else {
            return generalMaskedFn.extend(options, args);
        }
    };
})();