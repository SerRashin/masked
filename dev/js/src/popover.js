/**
 *
 * @param element Элементу которому будет показан popover
 * @param text
 * @param direction
 * @constructor
 */
var Popover = (function() {
    var Popover = function () {
        var self = this;

        var settings = MConf('popover');

        self.prefix_id = settings.prefix_id;
        self.prefix_class = settings.prefix_class;

        self.template = '<div class="{class} {direction}" id="{id}" style="{styles}">'
            + '<div class="arrow" style="left: 50%;"></div>'
            + '<h3 class="popover-title" style="display:none"></h3>'
            + '<div class="popover-content">{text}</div>'
            + '</div>';

        function fragmentFromString(strHTML) {
            return document.createRange().createContextualFragment(strHTML);
        }

        function setPx(el, type, px) {
            el.style[type] = px + 'px';
        }

        self.show = function (e, text, direction) {
            var pos = e.getBoundingClientRect(),
                top = pos.top,
                left = pos.left,
                width = pos.width,
                height = pos.height,
                direction = direction || 'top';

            var template = self.template.replace('{direction}', direction)
                       .replace('{class}', self.prefix_class)
                       .replace('{id}', self.prefix_id)
                       .replace('{styles}', "display: block")
                       .replace('{text}', text);

            var element = fragmentFromString(template).getElementById(self.prefix_id);

            element.style.visibility = 'hidden';
            element.style.display    = 'block';
            document.body.appendChild(element);
            element.style.visibility = '';

            var p_width = element.offsetWidth,
                p_height = element.offsetHeight;



            if (p_height + 10 > top || direction === 'bottom') {
                removeClass(element, direction);
                top = Math.ceil(height + top);
                addClass(element, 'bottom')
                direction = 'bottom'
            }

            if (p_width > width) {
                left -= (p_width - width) / 2;
            }

            if (direction === 'top') {
                top -= Math.ceil(p_height) + 2;
            }

            console.log(
                e.offsetHeight ,
                e.clientHeight ,
                e.scrollHeight ,
                top
            )

            if (window.pageYOffset > 0) {
                top += (window.pageYOffset || window.scrollY || document.documentElement.scrollTop);
            }

            setPx(element, 'left', left);
            setPx(element, 'top', top);
        };

        self.hide = function() {
            if (document.getElementById(self.prefix_id) !== null) {
                document.getElementById(self.prefix_id).remove();
            }
        };

        return self;
    };

    return new Popover();
})();