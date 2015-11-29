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
            if (typeof a[key] === und || typeof b[key] === und) {
                return typeof a[key] === und ? 1 : -1;
            }

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