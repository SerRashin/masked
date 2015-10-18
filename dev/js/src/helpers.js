var Event = (function() {
    var guid = 0
    function fixEvent(event) {
        event = event || window.event
        if ( event.isFixed ) {
            return event
        }
        event.isFixed = true
        event.preventDefault = event.preventDefault || function(){this.returnValue = false}
        event.stopPropagation = event.stopPropagaton || function(){this.cancelBubble = true}
        if (!event.target) {
            event.target = event.srcElement
        }
        if (!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }
        if ( event.pageX == null && event.clientX != null ) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }
        if ( !event.which && event.button ) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }
        return event
    }
    function commonHandle(event) {
        event = fixEvent(event)
        var handlers = this.events[event.type]
        for ( var g in handlers ) {
            var handler = handlers[g]
            var ret = handler.call(this, event)
            if ( ret === false ) {
                event.preventDefault()
                event.stopPropagation()
            }
        }
    }
    return {
        add: function(elem, type, handler) {
            if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {
                elem = window;
            }
            if (!handler.guid) {
                handler.guid = ++guid
            }
            if (!elem.events) {
                elem.events = {}
                elem.handle = function(event) {
                    if (typeof Event !== "undefined") {
                        return commonHandle.call(elem, event)
                    }
                }
            }
            if (!elem.events[type]) {
                elem.events[type] = {}
                if (elem.addEventListener)
                    elem.addEventListener(type, elem.handle, false)
                else if (elem.attachEvent)
                    elem.attachEvent("on" + type, elem.handle)
            }
            elem.events[type][handler.guid] = handler
        },
        remove: function(elem, type, handler) {
            var handlers = elem.events && elem.events[type]
            if (!handlers) return
            delete handlers[handler.guid]
            for(var any in handlers) return
            if (elem.removeEventListener)
                elem.removeEventListener(type, elem.handle, false)
            else if (elem.detachEvent)
                elem.detachEvent("on" + type, elem.handle)
            delete elem.events[type]
            for (var any in elem.events) return
            try {
                delete elem.handle
                delete elem.events
            } catch(e) { // IE
                elem.removeAttribute("handle")
                elem.removeAttribute("events")
            }
        }
    }
}());


function addClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    if (re.test(o.className)) return
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}

function removeClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
}
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 *  SUPPOORT
 *
     CORS is supported in the following browsers:

     Chrome 3+
     Firefox 3.5+
     Opera 12+
     Safari 4+
     Internet Explorer 8+
 */
$.AJAX = function (obj) {
    var availableType       = ['GET', 'POST', 'PUT'];
    var availableDataType   = ['json', 'text'];
    var headers             = {};

    var args = {
        url:            obj.url             || false,
        async:          obj.async           || false,
        data:           obj.data            || null,
        crossDomain:    obj.crossDomain     || false,
        complete:       obj.result          || function(){},
        timeout:        obj.timeout         || 10000,
        type:           ( availableType.indexOf(obj.type) !== -1 ? obj.type : null )                || "GET",
        dataType:       ( availableDataType.indexOf(obj.dataType) !== -1 ? obj.dataType : null )    || "json"
    };

    if (typeof args.url === 'undefined' || args.url === false) {
        return;
    }

    if (typeof XMLHttpRequest == 'undefined'){
        XMLHttpRequest = function () {
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP.6.0' );
            } catch ( e ) {}
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP.3.0' );
            } catch ( e ) {}
            try {
                return new ActiveXObject( 'Msxml2.XMLHTTP' );
            } catch ( e ) {}
            throw new Error( 'This browser does not support XMLHttpRequest.' );
        };
    }
    var xhr = new (("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest)();

    var url = args.url;
    if (args.type === 'GET' && args.data && args.data.length>0) {
        url = args.url + '?' +args.data.toString();
    }
    xhr.open( args.type, url, args.async );

    if ( !args.crossDomain ) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }

    for ( i in headers ) { // Support: IE<9
        if ( headers[ i ] !== undefined ) {
            xhr.setRequestHeader( i, headers[ i ] + "" );
        }
    }

    if (args.data && args.data.toString().length>0) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        args.data = args.data.toString();
    }

    try {
        xhr.send(args.data || null);
    } catch ( e ) {}

    if  (args.async) {
        var timeout = setTimeout( function() {
            xhr.abort();
        }, args.timeout);
    }

    callback = function() {
        var status, statusText,
            responses = {};
        if ( xhr.readyState === 4  ) {
            if  (args.async) {
                clearTimeout(timeout);
            }
            callback = undefined;
            if ( xhr.readyState !== 4 ) {
                xhr.abort();
            } else {
                status = xhr.status;
                if ( typeof xhr.responseText === "string" ) {responses.text = xhr.responseText;}
                try {statusText = xhr.statusText;} catch( e ) {statusText = "";}
                if ( !status && !args.crossDomain ) {
                    status = responses.text ? 200 : 404;
                } else if ( status === 1223 ) {
                    status = 204;
                }
            }
        }

        if ( responses ) {
            if ( !status && !args.crossDomain ) {
                status = responses.text ? 200 : 404;
            } else if ( status === 1223 ) {
                status = 204;
            }
            if (status === 200) {
                if(args.dataType === 'text') {
                    var res = responses.text || '';
                } else if (args.dataType === 'json') {
                    var res = JSON.parse(responses.text) || '';
                }
                args.complete(res, status, statusText, xhr.getAllResponseHeaders());
            }
        }
    };

    if ( !args.async ) {
        callback();
    } else if ( xhr.readyState === 4 ) { // (IE6 & IE7) if it's in cache and has been
        setTimeout( callback );
    } else {
        xhr.onreadystatechange = callback;
    }
};
/**
 * @param a responce result
 * @param b responce code
 * @param c response text
 * @param d header for responce
 */