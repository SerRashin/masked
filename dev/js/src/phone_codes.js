var phoneCodes = {
    all:    [],
    ru:     [],
    en:     [],


    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @returns {*}
     */
    sortPhones:function (maskList) {
        var key = "name";
        maskList.sort(function (a, b) {
            if (typeof a[key] === 'undefined' || typeof b[key] === 'undefined')return;
            var ia = 0,
                ib = 0;
            for (; (ia<a[key].length && ib<b[key].length); ) {
                var cha = a[key].charAt(ia);
                var chb = b[key].charAt(ib);
                if (cha > chb) {
                    return 1;
                } else if (cha < chb) {
                    return -1;
                } else {
                    return 0;
                }
                ia++;
                ib++;
            }
        });
        return maskList;
    }
};