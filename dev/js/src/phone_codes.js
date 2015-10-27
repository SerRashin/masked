var phoneCodes = {
    all:    [],
    ru:     [],
    us:     [],
    ca:     [],


    /**
     * Сортировать номера телефонов по ключу
     * @param maskList
     * @param key
     * @param sort
     * @returns {*}
     */
    sortPhones:function (maskList, key, sort) {
        var txt_mask = 'mask',
            txt_desc = 'desc',
            txt_asc  = 'asc';
            key      = (key  == txt_mask) ? txt_mask : 'name',
            sort     = (sort == txt_desc) ? txt_desc : txt_asc;
        maskList.sort(function (a, b) {
            if (typeof a[key] === und || typeof b[key] === und)return;
            if (key === txt_mask){
                var a = a[key].replace(/\D+/g,"");
                var b = b[key].replace(/\D+/g,"");
            } else {
                var a = a[key];
                var b = b[key];
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
    }
};