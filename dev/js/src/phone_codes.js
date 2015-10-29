var phoneCodes = {
    all:    [],     // список масок для всех стран
    ru:     [],     // список кодов для россии
    us:     [],     // список кодов для США
    ca:     [],     // список кодов для канады


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
            if (typeof a[key] === und || typeof b[key] === und)return;
            if (key === txt_mask){
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
    }
};