var MaskedConfig = MConf = (function() {

    var exception_example = {
        // 'ru' : {
            //localFormat:'8',
            // exceptions: {
            //     '8975': '7975'
            // }
        // }
    };

    var options = {
        pathToList:         '/js/masks/',
        prefix:             'instId_',
        lang:               'ru',
        country:            'ru',
        one_country:        false, // false or string 'iso_code'
        country_binding:    false,
        first_countries:    ['ru'],
        exceptions:         exception_example,
        initial_focus:      false,
        select_range:       false,
        onToggleList:       null,
        onShowList:         null,
        onHideList:         null,
        onSend:             null,
        onValueChanged:     null,
        onValidationError:  null,
        onShowInformation:  null,
        show_validation_errors: true,
        show_phone_information: true,
        i18n: {
            'ru': {
                'errors': {
                    'phone_is_empty': 'Телефон не заполнен, заполните все символы.',
                    'phone_not_exists': 'Телефон введен не верно или не существует.'
                }
            }
        },
        popover: {
            prefix_id: 'masked_popover',
            prefix_class: 'Masked_popover'
        }
    };

    
    return function (args) {
        if (typeof args === 'string') {
            return options[args];
        } else {
            return options = generalMaskedFn.extend(options, args);
        }
    };
})();