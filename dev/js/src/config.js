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