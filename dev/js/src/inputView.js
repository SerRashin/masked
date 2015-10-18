/**
 * Объект парсинга дизайна маски
 * @type {{setTemplate: Function, addActions: Function}}
 */
var inputView = {
    setTemplate: function(obj, el) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = el.outerHTML;
        wrapper.className = 'CBH-masks';

        el.parentNode.replaceChild(wrapper, el);

        var caret                   = document.createElement('i');
            caret.className         = 'caret';
        var flag                    = document.createElement('div');
            flag.innerHTML          = caret.outerHTML;
            flag.className          = 'flag ' + obj.opt.country;
        var selected                = document.createElement('div');
            selected.innerHTML      = flag.outerHTML;
            selected.className      = 'selected';
        var flags_block             = document.createElement('div');
            flags_block.innerHTML   = selected.outerHTML;
            flags_block.className   = 'flags';
        var ul                      = document.createElement('ul');
            ul.className            = 'lists';

        var sortedCodes = phoneCodes.sortPhones(phoneCodes.all); // phoneCodes

        for (i in sortedCodes) {
            var one             = sortedCodes[i];
                one.iso_code    = one.iso_code.toString().toLowerCase();
            if (typeof one.name === 'undefined')continue;
            if (obj.opt.country === one.iso_code) {
                obj.opt.mask = one.mask;
            }
            var li                      = document.createElement('li');
                li.className            = 'country';
                li.dataset['isoCode']   = one.iso_code.toString().toLowerCase();
                li.dataset['mask']      = one.mask;

            //Event.add(li,'click', inputMask.maskReplace);

            var i                       = document.createElement('i');
                i.className             = 'flag ' + one.iso_code;
                li.appendChild(i);
            var span                    = document.createElement('span');
                span.className          = 'name';
                span.innerHTML          = one.name;
            li.appendChild(span);

            var span                    = document.createElement('span');
                span.className          = 'code';
                span.innerHTML          = "+" + one.phone_code;
            li.appendChild(span);
            ul.appendChild(li);
        }

        flags_block.appendChild(ul);
        wrapper.insertBefore( flags_block, wrapper.firstChild );
        wrapper.getElementsByClassName('selected')[0].onclick = function () {
            var el = wrapper.getElementsByClassName('lists')[0];
            if (/active/.test(el.className) === true) {
                removeClass(el,'active');
            } else {
                addClass(el,'active');
            }
        };

        return wrapper.childNodes[1];
    },

};