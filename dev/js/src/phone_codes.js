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

    findMaskByCode: function(type, code, language) {
        var i,
            one,
            self = this,
            gc    = Global.countries,
            sortedCodes = self.sortPhones(gc[type][language], 'name', 1);

        if (sortedCodes.length > 0) {
            for (i in sortedCodes) {
                if (sortedCodes.hasOwnProperty(i)) {
                    one = sortedCodes[i];
                    /**
                     * @namespace one.iso_code Код страны
                     */
                    if (one.iso_code === code) {
                        return one;
                    }
                }
            }
        }

        return false;
    }
};