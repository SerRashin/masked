var phoneCodes = {
    all:    [],     // список масок для всех стран
    ae:     [],     //
    an:     [],     //
    ba:     [],     //
    bt:     [],     //
    ca:     [],     // список кодов для канады
    cn:     [],     //
    de:     [],     //
    ec:     [],     //
    ee:     [],     //
    id:     [],     //
    il:     [],     //
    jp:     [],     //
    kp:     [],     //
    la:     [],     //
    lb:     [],     //
    ly:     [],     //
    mc:     [],     //
    mm:     [],     //
    mx:     [],     //
    my:     [],     //
    ng:     [],     //
    nz:     [],     //
    ru:     [],     // список кодов для россии
    sa:     [],     //
    sb:     [],     //
    so:     [],     //
    sr:     [],     //
    th:     [],     //
    tl:     [],     //
    tv:     [],     //
    tw:     [],     //
    ua:     [],     // список кодов для Украины
    us:     [],     // список кодов для США
    vn:     [],     //
    vu:     [],     //
    ye:     [],     //


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
            key      = (k  == txt_mask) ? txt_mask : 'name',
            sort     = (s == txt_desc) ? txt_desc : txt_asc;

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

        return maskList;
    },

    /**
     * Загрузить маски
     *
     * @param type
     * @param lang
     * @param callback
     */
    loadMasks: function (type, lang, callback) {
        var self  = this,
            _true = true;

        sAJAX({
            url:         MConf('pathToList') + type + '/' + (!empty(lang) ? lang : 'ru') + '.min.json',
            type:        'GET',
            async:       _true,
            crossDomain: _true,             /// при crossdomain не возможен заголовок XMLHttpRequest
            dataType:    'json',
            result: function (responce) {
                self[type] = self.sortPhones(responce, 'mask', 'desc');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    },
    findMaskByCode: function(code) {
        var i,
            one,
            self = this,
            sortedCodes = self.sortPhones(self.all, 'name', 1);

        for (i in self.all) {
            if (self.all.hasOwnProperty(i)) {
                one = sortedCodes[i];
                /**
                 * @namespace one.iso_code Код страны
                 */
                if (one.iso_code === code) {
                    return one;
                }
            }
        }
        return false;
    }
};