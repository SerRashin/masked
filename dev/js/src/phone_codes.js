var phoneCodes = {
    all:    [],
    ru:     [],
    us:     [],


    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @returns {*}
     */
    sortPhones:function (maskList, key, sort) {
        var key = (key == 'mask')? 'mask' : 'name';
        var sort = (sort == 'desc')? 'desc' : 'asc';
        maskList.sort(function (a, b) {
            if (typeof a[key] === und || typeof b[key] === und)return;
            if (key ==='mask'){
                var a = a[key].replace(/\D+/g,"");
                var b = b[key].replace(/\D+/g,"");
            } else {
                var a = a[key];
                var b = b[key];
            }
            if (a > b) {
                return sort=='asc' ? 1:-1;
            } else if (a < b) {
                return sort=='asc' ? -1:1;
            } else {
                return 0;
            }
        });
        return maskList;
    }
};